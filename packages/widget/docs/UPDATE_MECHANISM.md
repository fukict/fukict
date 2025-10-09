# 组件更新机制

## 核心设计原则

**实例复用优先**：组件实例是状态的载体，必须尽可能复用，而不是重建。

**VNode 是描述**：VNode 可以重新生成，但组件实例必须保持稳定。

**两种更新策略**：提供强制重建和平滑更新两种方式，由用户选择。

## VNode 与组件实例的关联

**双向引用机制**：

```typescript
// VNode 结构增强
interface VNode {
  type: Component | string | symbol
  props: Props
  children: VNodeChild[]

  // 关联到组件实例
  __instance__?: Widget          // 组件实例引用
  __instanceKey__?: string       // 实例唯一标识（用于 diff 匹配）
}

// Widget 实例增强
class Widget {
  __vnode__: VNode               // 当前渲染的 VNode（用于 diff）
  __key__: string                // 实例唯一标识
  element?: HTMLElement          // 关联的 DOM 元素
  refs: Map<string, Widget>      // 子组件引用
}
```

**关键点**：

- VNode 通过 `__instance__` 引用组件实例
- Widget 通过 `__vnode__` 引用当前 VNode
- 通过 `__instanceKey__` 在 diff 时匹配实例

## 三种更新方法

### 1. forceUpdate() - 强制重建（无 diff，用户控制）

**语义**：完全重新创建，销毁所有子组件实例

**行为**：

```
1. 卸载当前所有子组件（触发 onBeforeUnmount）
2. 移除当前 DOM
3. 调用 render() 生成新 VNode
4. 创建全新的组件实例和 DOM
5. 挂载新 DOM（触发 onMounted）
```

**适用场景**：

- 组件状态完全失效，需要全部重置
- diff 成本高于重建成本（大量节点变化）
- 需要强制重置所有子组件的状态

**注意事项**：

- ⚠️ 所有子组件实例会被销毁并重建
- ⚠️ 所有 refs 引用会失效
- ⚠️ 所有子组件的内部状态会丢失
- ⚠️ 性能开销较大
- ✅ 框架本身从不调用此方法，完全由用户控制

**使用示例**：

```typescript
class Counter extends Widget<{}> {
  private count = 0

  handleReset = () => {
    // 完全重置组件，丢弃所有子组件状态
    this.count = 0
    this.forceUpdate()
  }

  render() {
    return <div>{this.count}</div>
  }
}
```

### 2. __performUpdate() - 平滑更新（带 diff，框架内部使用）

**语义**：执行更新流程，尽可能复用组件实例，最小化 DOM 操作

**行为**：

```
1. 调用 render() 生成新 VNode
2. 与旧 VNode 进行 diff
3. patch DOM（仅更新变化的部分）
4. 复用子组件实例（能复用则复用）
5. 同步更新 refs（处理 ref 名称变化）
```

**优点**：

- ✅ 子组件实例能复用则复用
- ✅ refs 引用保持稳定
- ✅ 最小化 DOM 操作
- ✅ 保持子组件的内部状态

**注意事项**：

- 📌 这是 **protected** 方法，使用 `__` 前缀
- 📌 框架内部使用，用户通常不直接调用
- 📌 用户通过重写 `update()` 来间接调用
- 📌 框架的所有内置更新都使用此方法

**实现流程**：

```
__performUpdate():
  1. newVNode = this.render()
  2. patches = diff(this.__vnode__, newVNode, this)
  3. patch(this.element, patches)
  4. this.__vnode__ = newVNode
```

### 3. update(newProps) - 更新 props（外部调用，可重写）

**语义**：父组件通知子组件 props 变更

**行为**：

```
1. 合并新旧 props
2. 调用 __performUpdate() 平滑更新
```

**可重写**：

- 开发者可以重写此方法，完全控制更新逻辑
- 重写后可以决定是否调用 `__performUpdate()` 或 `forceUpdate()`
- **不需要 onPropsUpdated 钩子**：`update()` 本身就是钩子

**默认实现**：

```typescript
class Widget<TProps = {}> {
  public update(newProps: Partial<TProps>): void {
    // 1. 合并 props
    this.props = { ...this.props, ...newProps }

    // 2. 平滑更新（框架默认行为）
    this.__performUpdate()
  }
}
```

**自定义实现示例**：

```typescript
class MyWidget extends Widget<{ count: number }> {
  update(newProps: Partial<{ count: number }>) {
    const oldCount = this.props.count

    // 判断是否需要更新
    if (oldCount === newProps.count) {
      return  // 跳过更新
    }

    // 更新 props
    this.props = { ...this.props, ...newProps }

    // 处理 props 变化（替代 onPropsUpdated）
    if (Math.abs(oldCount - newProps.count!) > 100) {
      // 变化太大，强制重建
      this.forceUpdate()
    } else {
      // 平滑更新
      this.__performUpdate()
    }
  }
}
```

## 三种方法的对比

| 方法                  | 可见性        | 调用者         | 使用 diff | 复用实例 | 框架调用 | 命名约定      |
| --------------------- | ------------- | -------------- | --------- | -------- | -------- | ------------- |
| `forceUpdate()`       | public        | 用户           | ❌        | ❌       | ❌ 从不  | 无前缀        |
| `__performUpdate()`   | protected     | 框架/用户子类  | ✅        | ✅       | ✅ 总是  | `__` 前缀     |
| `update(newProps)`    | public（可写） | 父组件/用户    | ✅        | ✅       | ✅ 总是  | 无前缀（可写）|

**核心原则**：

- 框架内部永远只使用 `__performUpdate()`（通过 `update()` 调用）
- `forceUpdate()` 完全交给用户决定何时使用
- 用户可以通过重写 `update()` 来选择更新策略
- **命名约定**：`__` 前缀表示框架内部方法，用户不应直接调用

## 组件 Diff 算法

### 组件实例复用判断

```typescript
function canReuseInstance(oldVNode: VNode, newVNode: VNode): boolean {
  // 1. 组件类型必须相同
  if (oldVNode.type !== newVNode.type) {
    return false
  }

  // 2. 如果指定了 key，key 必须相同
  const oldKey = oldVNode.props?.key ?? oldVNode.__instanceKey__
  const newKey = newVNode.props?.key

  if (oldKey !== undefined && newKey !== undefined) {
    return oldKey === newKey
  }

  // 3. 默认可以复用（同类型组件）
  return true
}
```

### Diff 核心逻辑

```
diff(oldVNode, newVNode, parent):

  // 情况 1: 组件节点
  if (isComponentVNode(newVNode)) {
    if (canReuseInstance(oldVNode, newVNode)) {
      // 复用组件实例
      instance = oldVNode.__instance__
      newVNode.__instance__ = instance
      newVNode.__instanceKey__ = instance.__key__

      // 检查是否为脱围组件
      if (newVNode.props?.['fukict:detach']) {
        // 脱围组件：复用实例但不自动更新
        // 注意：生命周期不受影响，只是跳过自动 update() 调用
        return
      }

      // 普通组件：更新 props
      instance.update(newVNode.props)

      // 递归 diff 子树（组件内部调用 __performUpdate）
      // 注意：update() 会触发组件自己的 render 和 diff
    } else {
      // 不能复用，卸载旧实例，创建新实例
      oldVNode.__instance__?.unmount()
      newInstance = createComponent(newVNode)
      newVNode.__instance__ = newInstance
      newInstance.mount(parent.element)
    }
  }

  // 情况 2: DOM 节点
  else if (typeof newVNode.type === 'string') {
    if (oldVNode.type === newVNode.type) {
      // 同类型 DOM 节点，复用 element
      patchProps(element, oldVNode.props, newVNode.props)
      diffChildren(element, oldVNode.children, newVNode.children)
    } else {
      // 不同类型，替换
      replaceElement(oldVNode, newVNode)
    }
  }
```

**关键点**：

- 组件实例能复用则复用，调用 `update()` 而非重建
- 脱围组件（`fukict:detach`）跳过自动 `update()` 调用
- 组件实例不能复用才重建
- 递归处理子树

## 脱围组件的更新机制

### 脱围 = 跳过 diff/patch

**核心理念**：最小运行时更新 + 用户自控更新

脱围是 Fukict 的核心特性，支持：
- ✅ **所有节点类型**：DOM 元素、函数组件、类组件
- ✅ **持久化配置**：一旦脱围，永久生效（除非 forceUpdate）
- ✅ **跳过整个子树**：diff 时跳过该节点及其所有子节点

```typescript
class Parent extends Widget<{}> {
  protected declare refs: {
    chart: HeavyChart,                       // 类组件：引用实例
    preview: DetachedRef<HTMLDivElement>,     // DOM：引用 DetachedRef
    sidebar: DetachedRef<HTMLElement>         // 函数组件：引用 DetachedRef
  }

  handleDataChange = (data) => {
    // 类组件：通过实例的 update() 方法
    this.refs.chart.update({ data })
  }

  handlePreviewUpdate = (html: string) => {
    // DOM/函数组件：通过 DetachedRef 的 update() 方法
    this.refs.preview.update(
      <div class="preview" innerHTML={html} />
    )
  }

  render() {
    return (
      <div>
        {/* 类组件脱围 */}
        <HeavyChart fukict:detach fukict:ref="chart" />

        {/* DOM 元素脱围 */}
        <div fukict:detach fukict:ref="preview" class="preview" />

        {/* 函数组件脱围 */}
        <Sidebar fukict:detach fukict:ref="sidebar" />
      </div>
    )
  }
}
```

### 脱围标记的持久化

**关键**：脱围标记会从 oldVNode 传递到 newVNode。

```typescript
function diff(oldVNode: VNode, newVNode: VNode, parent: Element) {
  // 持久化检查：旧节点已脱围
  if (oldVNode.__detached__) {
    // 传递脱围标记
    newVNode.__detached__ = true
    // 跳过整个子树的 diff
    return
  }

  // 首次标记
  if (newVNode.props?.['fukict:detach']) {
    newVNode.__detached__ = true
    // 首次标记，本次继续处理...
  }

  // 正常 diff...
}
```

**持久化效果**：

```typescript
// 第一次渲染
<div fukict:detach>...</div>  // __detached__ = true

// 第二次渲染
<div>...</div>  // ← 即使去掉 fukict:detach，仍然 __detached__ = true

// 要解除脱围，必须 forceUpdate（完全重建）
```

### 脱围组件在 Diff 中的行为

**类组件脱围**：

```typescript
function diffComponent(oldVNode: VNode, newVNode: VNode, parent: Widget) {
  const instance = oldVNode.__instance__

  if (canReuseInstance(oldVNode, newVNode)) {
    // 持久化脱围检查
    if (oldVNode.__detached__) {
      newVNode.__detached__ = true
      newVNode.__instance__ = instance
      return  // 跳过 update()
    }

    // 首次脱围检查
    if (newVNode.props?.['fukict:detach']) {
      newVNode.__detached__ = true
      newVNode.__instance__ = instance
      return  // 跳过 update()
    }

    // 普通组件：自动更新
    instance.update(newVNode.props)
  }
}
```

**DOM 元素/函数组件脱围**：

```typescript
function diffElement(oldVNode: VNode, newVNode: VNode, parent: Element) {
  // 持久化脱围检查
  if (oldVNode.__detached__) {
    newVNode.__detached__ = true
    // 跳过整个子树的 diff
    return
  }

  // 首次脱围检查
  if (newVNode.props?.['fukict:detach']) {
    newVNode.__detached__ = true
    // 首次标记，继续处理...
  }

  // 正常 diff 流程...
}
```

### 脱围节点的完整特性

| 特性 | 普通节点 | 类组件脱围 | 函数组件/DOM 脱围 |
| ---- | -------- | ---------- | ----------------- |
| 首次创建 | 正常 | 正常 | 正常 |
| onMounted | ✅ 自动触发 | ✅ 自动触发 | - |
| 父组件更新时 diff | ✅ 是 | ❌ 否（跳过） | ❌ 否（跳过） |
| 手动 update | - | `ref.update(props)` | `ref.update(vnode)` |
| onBeforeUnmount | ✅ 自动触发 | ✅ 自动触发 | - |
| 实例/元素复用 | ✅ | ✅ | ✅ |
| 脱围持久化 | - | ✅ 是 | ✅ 是 |

**关键点**：

- ✅ 脱围节点正常触发 `onMounted`（首次挂载时，仅组件）
- ✅ 脱围节点正常触发 `onBeforeUnmount`（卸载时，仅组件）
- ❌ 脱围节点不会在父组件更新时自动 diff/patch
- ✅ 可以通过 ref 手动更新
- ⚠️ 脱围标记持久化，除非 forceUpdate

## Refs 更新机制

**问题**：diff 后如何正确更新 refs？

**解决方案**：在 diff 过程中同步更新 refs

```typescript
function diffComponent(oldVNode: VNode, newVNode: VNode, parent: Widget) {
  const oldInstance = oldVNode.__instance__
  const oldRefName = oldVNode.props?.['fukict:ref']
  const newRefName = newVNode.props?.['fukict:ref']

  if (canReuseInstance(oldVNode, newVNode)) {
    // 复用实例
    newVNode.__instance__ = oldInstance

    // 处理 ref 变化
    if (oldRefName !== newRefName) {
      // ref 名称变化了
      if (oldRefName) {
        parent.refs.delete(oldRefName)  // 删除旧 ref
      }
      if (newRefName) {
        parent.refs.set(newRefName, oldInstance)  // 注册新 ref
      }
    } else if (newRefName) {
      // ref 名称未变，确保引用正确
      parent.refs.set(newRefName, oldInstance)
    }

    // 更新组件
    oldInstance.update(newVNode.props)
  } else {
    // 不能复用

    // 清理旧 ref
    if (oldRefName && oldInstance) {
      parent.refs.delete(oldRefName)
      oldInstance.unmount()
    }

    // 创建新实例并注册新 ref
    const newInstance = createComponent(newVNode)
    if (newRefName) {
      parent.refs.set(newRefName, newInstance)
    }

    newVNode.__instance__ = newInstance
    newInstance.mount(parent.element)
  }
}
```

**关键点**：

- Refs 更新与组件复用同步进行
- ref 名称变化时，删除旧的，注册新的
- 组件销毁时，自动清理 refs
- 组件实例复用时，refs 保持稳定

## 数组节点 Diff（初版简化）

**初版策略**：按位置比较，不实现 key diff

```
diffChildren(oldChildren, newChildren):
  for i in 0..max(oldChildren.length, newChildren.length):
    if (i < oldChildren.length && i < newChildren.length) {
      diff(oldChildren[i], newChildren[i])  // 递归 diff
    } else if (i < newChildren.length) {
      mount(newChildren[i])  // 新增节点
    } else {
      unmount(oldChildren[i])  // 删除节点
    }
```

**限制**：

- 列表顺序变化会导致大量 DOM 操作
- 不支持高效的列表重排序

**未来优化**：

- key-based diff
- 最长递增子序列（LIS）
- 双端比较

## 完整更新流程示例

**场景**：父组件状态变化，触发更新

```typescript
class Parent extends Widget<{}> {
  private count = 0

  protected declare refs: {
    child1: Child
    child2: Child
  }

  handleClick = () => {
    this.count++
    this.__performUpdate()  // ← 用户也可以直接调用（虽然通常不推荐）
  }

  render() {
    return (
      <div>
        <Child fukict:ref="child1" count={this.count} />
        <Child fukict:ref="child2" count={this.count * 2} />
      </div>
    )
  }
}
```

**更新流程**：

```
1. this.__performUpdate() 被调用
   ↓
2. 调用 this.render() 生成新 VNode 树
   newVNode = <div>
     <Child fukict:ref="child1" count={1} />
     <Child fukict:ref="child2" count={2} />
   </div>
   ↓
3. diff(this.__vnode__, newVNode)
   ↓
   3.1 diff div 节点（DOM 节点，复用）
   ↓
   3.2 diffChildren(oldChildren, newChildren)
       ↓
       3.2.1 diff Child1
             - 类型相同 ✅
             - ref 名称相同 ✅
             - 复用实例 ✅
             - 调用 child1.update({ count: 1 })
               → child1.__performUpdate() 被内部调用
             - refs.child1 保持不变 ✅
       ↓
       3.2.2 diff Child2
             - 类型相同 ✅
             - ref 名称相同 ✅
             - 复用实例 ✅
             - 调用 child2.update({ count: 2 })
               → child2.__performUpdate() 被内部调用
             - refs.child2 保持不变 ✅
   ↓
4. patch DOM（仅更新变化的部分）
   ↓
5. 更新完成，refs 保持稳定 ✅
```

**关键结果**：

- ✅ 子组件实例没有重建
- ✅ refs 引用保持稳定
- ✅ 仅更新了 props 和 DOM
- ✅ diff 机制生效

## update() 与 forceUpdate() 与 __performUpdate() 的区别

| 方法                  | 可见性        | 调用者         | props 变化 | 使用 diff | 复用实例 | 框架调用 | 命名约定  |
| --------------------- | ------------- | -------------- | ---------- | --------- | -------- | -------- | --------- |
| `update(newProps)`    | public（可写） | 父组件/用户    | 是         | ✅        | ✅       | ✅ 总是  | 无前缀    |
| `__performUpdate()`   | protected     | 框架/用户子类  | 否         | ✅        | ✅       | ✅ 总是  | `__` 前缀 |
| `forceUpdate()`       | public        | 用户           | 否         | ❌        | ❌       | ❌ 从不  | 无前缀    |

**共同点**：

- `update()` 和 `__performUpdate()` 都使用 diff 复用子组件实例
- `update()` 内部调用 `__performUpdate()`

**区别**：

- `update()` 更新 props，可重写，用户可在其中处理 props 变化逻辑
- `__performUpdate()` 不改变 props，框架内部方法（`__` 前缀），执行更新流程
- `forceUpdate()` 完全重建，不使用 diff，销毁所有子组件

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
