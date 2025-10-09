# 脱围渲染设计

## 设计目标

**核心理念**：最小运行时更新 + 用户自控更新

脱围是 Fukict 的核心特性之一，提供：

- ✅ **跳过自动 diff/patch**：减少运行时开销
- ✅ **精确控制更新时机**：由用户决定何时更新
- ✅ **支持所有节点类型**：DOM 元素、函数组件、类组件
- ✅ **持久化配置**：一旦脱围，永久生效（除非 forceUpdate）

### 脱围 vs 生命周期

**脱围 = 更新脱围，而非生命周期脱围**

脱围节点仍然：

- ✅ 正常触发 `onMounted`（首次挂载时，仅组件）
- ✅ 正常触发 `onBeforeUnmount`（卸载时，仅组件）
- ✅ 可以手动更新

提供两种使用方式：

1. **fukict:detach 属性**：自动挂载但不自动更新
2. **完全手动控制**：自己控制挂载和更新时机

## fukict:detach 属性

### 支持的节点类型

**所有节点都可以脱围**：

```tsx
// 1. 类组件脱围
<ClassComp fukict:detach fukict:ref="comp" data="initial" />

// 2. 函数组件脱围
<FuncComp fukict:detach fukict:ref="func" data="initial" />

// 3. DOM 元素脱围
<div fukict:detach fukict:ref="box">
  <ExpensiveContent />
</div>
```

### 用法：类组件脱围

类组件脱围后，ref 引用组件实例：

```tsx
class Parent extends Widget<{}> {
  declare protected refs: {
    child: ExpensiveChild; // 引用实例
  };

  onMounted() {
    // ✅ 子组件的 onMounted 已正常触发
    console.log(this.refs.child.element); // 有值
  }

  handleUpdate = () => {
    // 手动更新脱围子组件
    this.refs.child.update({ data: 'new' });
  };

  render() {
    return (
      <div>
        {/* 类组件脱围：不自动更新 */}
        <ExpensiveChild fukict:detach fukict:ref="child" />
      </div>
    );
  }
}
```

### 用法：函数组件/DOM 脱围

函数组件和 DOM 元素脱围后，ref 引用 DetachedRef 对象：

```tsx
class Parent extends Widget<{}> {
  declare protected refs: {
    func: DetachedRef<HTMLDivElement>;
    box: DetachedRef<HTMLDivElement>;
  };

  handleUpdateFunc = () => {
    // 手动更新脱围函数组件
    this.refs.func.update(<FuncComp data="new" />);
  };

  handleUpdateBox = () => {
    // 手动更新脱围 DOM 元素
    this.refs.box.update(
      <div>
        <NewExpensiveContent />
      </div>,
    );
  };

  render() {
    return (
      <div>
        {/* 函数组件脱围 */}
        <FuncComp fukict:detach fukict:ref="func" data="initial" />

        {/* DOM 元素脱围 */}
        <div fukict:detach fukict:ref="box">
          <ExpensiveContent />
        </div>
      </div>
    );
  }
}
```

**DetachedRef 接口**：

```typescript
interface DetachedRef<T extends Element = Element> {
  element: T; // DOM 元素引用
  update: (newVNode: VNode) => void; // 更新函数
}
```

### 完全手动控制

如果需要完全控制挂载时机，不使用 `fukict:detach`，直接手动创建和挂载：

```typescript
class Parent extends Widget<{}> {
  private manualChild?: HeavyWidget;

  onMounted() {
    // 完全手动控制：自己创建、挂载
    this.manualChild = new HeavyWidget({ data: 'initial' });

    const container = this.element!.querySelector('.manual-container')!;
    this.manualChild.mount(container);  // ✅ 手动挂载
  }

  onBeforeUnmount() {
    // 手动卸载
    this.manualChild?.unmount();
  }

  render() {
    return (
      <div>
        <div class="manual-container"></div>
      </div>
    );
  }
}
```

## 脱围实现机制

### 1. 标记脱围节点

所有节点都可以通过 `fukict:detach` 标记：

```typescript
// runtime 处理 fukict:detach（通用处理，不区分节点类型）
function processVNode(vnode: VNode): VNode {
  if (vnode.props?.['fukict:detach']) {
    vnode.__detached__ = true; // 标记为脱围
  }
  return vnode;
}
```

### 2. 脱围标记的持久化

**关键**：脱围是持久配置，一旦标记，后续 diff 都会跳过。

```typescript
function diff(oldVNode: VNode, newVNode: VNode, parent: Element) {
  // 检查旧节点是否已脱围（持久化检查）
  if (oldVNode.__detached__) {
    // 传递脱围标记到新 VNode
    newVNode.__detached__ = true;

    // 跳过整个子树的 diff/patch
    return;
  }

  // 检查是否首次标记脱围
  if (newVNode.props?.['fukict:detach']) {
    newVNode.__detached__ = true;
    // 首次标记，本次继续处理（创建/挂载）
  }

  // 正常 diff 流程...
}
```

**持久化效果**：

```typescript
// 第一次 render
<div fukict:detach>...</div>  // __detached__ = true

// 第二次 render（父组件更新）
<div>...</div>  // ← 即使去掉 fukict:detach，仍然 __detached__ = true

// 除非调用 forceUpdate（完全重建）
```

### 3. 生命周期正常触发

脱围不影响组件的生命周期：

```typescript
// ComponentHandler.onMount
onMount(element, vnode) {
  const instance = vnode.__instance__
  if (instance) {
    instance.element = element
    // 脱围组件也正常触发 onMounted
    instance.onMounted?.()
  }
}

// ComponentHandler.onUnmount
onUnmount(element, vnode) {
  const instance = vnode.__instance__
  if (instance) {
    // 脱围组件也正常触发 onBeforeUnmount
    instance.onBeforeUnmount?.()
  }
}
```

### 4. 不同节点类型的 Diff 跳过

**类组件脱围**：

```typescript
function diffComponent(oldVNode: VNode, newVNode: VNode, parent: Widget) {
  const instance = oldVNode.__instance__;

  // 持久化脱围检查
  if (oldVNode.__detached__) {
    newVNode.__detached__ = true;
    newVNode.__instance__ = instance; // 复用实例
    return; // 跳过 update()
  }

  if (canReuseInstance(oldVNode, newVNode)) {
    // 检查首次脱围
    if (newVNode.props?.['fukict:detach']) {
      newVNode.__detached__ = true;
      newVNode.__instance__ = instance;
      return; // 跳过 update()
    }

    // 正常组件：自动更新
    instance.update(newVNode.props);
  }
}
```

**DOM 元素/函数组件脱围**：

```typescript
function diffElement(oldVNode: VNode, newVNode: VNode, parent: Element) {
  // 持久化脱围检查
  if (oldVNode.__detached__) {
    newVNode.__detached__ = true;
    // 跳过整个子树的 diff
    return;
  }

  // 检查首次脱围
  if (newVNode.props?.['fukict:detach']) {
    newVNode.__detached__ = true;
    // 首次标记，继续处理...
  }

  // 正常 diff 流程（patchProps, diffChildren）...
}
```

### 5. Refs 注册机制

**类组件**：ref 引用实例

```typescript
// ComponentHandler.processVNode
processVNode(vnode) {
  const refName = vnode.props?.['fukict:ref']
  if (refName) {
    const parent = getCurrentWidget()
    const instance = vnode.__instance__
    if (parent && instance) {
      // 类组件：直接注册实例
      parent.refs.set(refName, instance)
    }
  }
  return vnode
}
```

**函数组件/DOM 元素**：ref 引用 DetachedRef

```typescript
// runtime 处理 fukict:ref（针对非组件节点）
function processElementRef(element: Element, vnode: VNode, parent: Widget) {
  const refName = vnode.props?.['fukict:ref'];

  if (refName && vnode.__detached__) {
    // 脱围节点：创建 DetachedRef 对象
    const detachedRef: DetachedRef = {
      element,
      update: (newVNode: VNode) => {
        // 使用 replaceNode 更新
        const newNode = createNode(newVNode);
        if (newNode) {
          replaceNode(element, newNode, vnode);
          // 更新引用
          detachedRef.element = newNode as Element;
        }
      },
    };

    parent.refs.set(refName, detachedRef);
  } else if (refName) {
    // 普通节点：直接注册 element
    parent.refs.set(refName, element);
  }
}
```

## 脱围的使用场景

### 1. 类组件性能优化

```typescript
class Dashboard extends Widget<{}> {
  protected declare refs: {
    chart: HeavyChart  // 引用类组件实例
  }

  updateChartData = (data) => {
    // 只在需要时手动更新图表
    this.refs.chart.update({ data })
  }

  render() {
    return (
      <div>
        {/* 重量级图表，避免每次都重新渲染 */}
        <HeavyChart fukict:detach fukict:ref="chart" />
      </div>
    );
  }
}
```

### 2. DOM 元素性能优化

```typescript
class Editor extends Widget<{}> {
  protected declare refs: {
    preview: DetachedRef<HTMLDivElement>  // 引用 DetachedRef
  }

  updatePreview = (html: string) => {
    // 手动更新预览区域
    this.refs.preview.update(
      <div class="preview" innerHTML={html} />
    )
  }

  render() {
    return (
      <div>
        <textarea on:input={this.handleInput} />

        {/* 预览区域脱围，避免每次输入都更新 */}
        <div fukict:detach fukict:ref="preview" class="preview" />
      </div>
    );
  }
}
```

### 3. 函数组件性能优化

```typescript
class Gallery extends Widget<{}> {
  protected declare refs: {
    sidebar: DetachedRef<HTMLDivElement>  // 引用 DetachedRef
  }

  updateSidebar = (selectedId: string) => {
    // 手动更新侧边栏
    this.refs.sidebar.update(
      <Sidebar selectedId={selectedId} />
    )
  }

  render() {
    return (
      <div>
        {/* 函数组件脱围 */}
        <Sidebar fukict:detach fukict:ref="sidebar" />

        <ImageList on:select={this.handleSelect} />
      </div>
    );
  }
}
```

### 4. 复杂子树优化

```typescript
class App extends Widget<{}> {
  protected declare refs: {
    complexSection: DetachedRef<HTMLDivElement>
  }

  refreshSection = () => {
    // 手动刷新整个复杂区域
    this.refs.complexSection.update(
      <section>
        <HeavyComponent1 />
        <HeavyComponent2 />
        <HeavyComponent3 />
      </section>
    )
  }

  render() {
    return (
      <div>
        <Header />

        {/* 整个复杂区域脱围 */}
        <section fukict:detach fukict:ref="complexSection">
          <HeavyComponent1 />
          <HeavyComponent2 />
          <HeavyComponent3 />
        </section>

        <Footer />
      </div>
    );
  }
}
```

## 脱围渲染注意事项

### 关键特性

**脱围 = 跳过 diff/patch，不是生命周期脱围**：

- ✅ **生命周期正常**：onMounted、onBeforeUnmount 都会正常触发（仅组件）
- ✅ **首次挂载正常**：element 引用正常设置
- ✅ **手动更新可用**：类组件通过 `ref.update()`，其他通过 `ref.update(vnode)`
- ❌ **不自动更新**：父组件更新时跳过该节点的 diff/patch
- ⚠️ **持久化配置**：一旦脱围，永久生效（除非 forceUpdate）

### 持久化特性

```typescript
// 第一次渲染
render() {
  return <div fukict:detach>...</div>  // 标记脱围
}

// 第二次渲染（父组件更新）
render() {
  return <div>...</div>  // ← 即使去掉 fukict:detach
}
// ↑ 仍然脱围！因为 oldVNode.__detached__ = true

// 要解除脱围，必须 forceUpdate（完全重建）
```

### 使用风险

- **内容不会自动同步**：必须手动调用 `update()`
- **状态可能不一致**：父子内容可能不同步
- **调试复杂**：需要理解 diff 被跳过了
- **持久化陷阱**：去掉 `fukict:detach` 不会立即生效

### 最佳实践

1. **必须配合 ref 使用**

```typescript
// ✅ 正确：脱围必须有 ref
<ExpensiveChild fukict:detach fukict:ref="child" />

// ❌ 错误：脱围但没有 ref，无法手动更新
<ExpensiveChild fukict:detach />
```

2. **明确更新时机**

```typescript
class Parent extends Widget<{}> {
  declare protected refs: {
    child: ExpensiveChild;
  };

  // 在需要时手动更新
  handleDataChange = newData => {
    this.refs.child.update({ data: newData });
  };
}
```

3. **仅在必要时使用**

- 确实有性能问题时
- 需要精确控制更新时机
- 节点更新成本很高

4. **理解持久化**

- 脱围标记会持久化，不会因为去掉 `fukict:detach` 而自动解除
- 要解除脱围，必须调用 `forceUpdate()` 完全重建
- 或者设计时避免动态添加/移除 `fukict:detach`

### 对比：脱围 vs 正常节点

| 特性            | 正常节点             | 类组件脱围           | 函数组件/DOM 脱围    |
| --------------- | -------------------- | -------------------- | -------------------- |
| 创建时机        | 父组件 render 时     | 父组件 render 时     | 父组件 render 时     |
| onMounted       | 自动触发             | 自动触发 ✅          | -                    |
| onBeforeUnmount | 自动触发             | 自动触发 ✅          | -                    |
| diff/patch      | 父组件更新时自动     | 跳过 ❌              | 跳过 ❌              |
| ref 类型        | Element              | Widget 实例          | DetachedRef          |
| 手动更新        | -                    | `ref.update(props)`  | `ref.update(vnode)`  |
| 脱围持久化      | -                    | ✅ 是                | ✅ 是                |
| 卸载时机        | 父组件卸载/diff 替换 | 父组件卸载/diff 替换 | 父组件卸载/diff 替换 |

### DetachedRef 类型

```typescript
// 脱围的函数组件和 DOM 元素使用此类型
interface DetachedRef<T extends Element = Element> {
  element: T                        // DOM 元素引用
  update: (newVNode: VNode) => void // 更新函数
}

// 使用示例
protected declare refs: {
  box: DetachedRef<HTMLDivElement>,
  sidebar: DetachedRef<HTMLElement>
}
```

---

**文档状态**：设计阶段
**最后更新**：2025-01-09
