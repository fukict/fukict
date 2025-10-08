# @fukict/widget 设计文档

## 包职责

widget 是 Fukict 的组件抽象层，职责：

1. **组件范式**：提供类组件和函数组件
2. **生命周期**：组件挂载、更新、卸载
3. **Refs 管理**：父子组件通信
4. **Slots 机制**：内容投影
5. **扩展 runtime**：通过注册机制实现上述功能

## 不包含的功能

- ❌ 状态管理（由 flux 提供）
- ❌ 路由（由 router 提供）
- ❌ 调度器（由 scheduler 提供，可选集成）

## 核心设计理念

### "通过注册扩展 runtime"

widget 不是独立的渲染引擎，而是 runtime 的扩展：

```
runtime 提供：
  - VNode 创建和渲染
  - 钩子注册机制

widget 通过注册实现：
  - 组件检测和渲染
  - 生命周期管理
  - Refs 提取和管理
  - Slots 提取和渲染
```

**为什么这样设计？**

- 保持 runtime 纯粹（< 5KB）
- widget 功能按需加载
- 支持多种组件范式共存

## 依赖关系

```
@fukict/runtime (直接依赖，自动安装)
    ↑ dependencies (widget 直接依赖)
@fukict/widget
```

**用户只需安装 widget**：

```bash
pnpm add @fukict/widget
# runtime 自动安装
```

## 组件范式设计

### 1. Widget 类组件

**设计目标**：提供完整的组件能力

**核心特性**：

- 生命周期钩子
- 内部状态管理
- Refs 管理
- Slots 支持
- 脱围渲染

**使用方式**：

```tsx
class Counter extends Widget<{ initialCount: number }> {
  private count: number;

  constructor(props) {
    super(props);
    this.count = props.initialCount;
  }

  onMounted() {
    // 挂载后
  }

  render() {
    return <div>{this.count}</div>;
  }
}
```

### 2. 函数组件（defineWidget）

**设计目标**：轻量级、无生命周期

**核心特性**：

- 纯函数
- 无内部状态（通过 props 驱动）
- 无生命周期钩子
- 由 babel-preset-widget 自动包裹

**使用方式**：

```tsx
// 用户代码（无需手动 defineWidget）
const Greeting = ({ name }: { name: string }) => (
  <div>Hello {name}</div>
)

// babel-preset-widget 自动编译为
const Greeting = defineWidget(({ name }) => (
  <div>Hello {name}</div>
))
```

### 为什么两种组件？

**Widget 类**：

- 适合有状态、有生命周期的复杂组件
- 类似 React Class Component

**defineWidget 函数**：

- 适合无状态、纯展示的简单组件
- 类似 React Function Component（但无 Hooks）

## 生命周期设计

### Widget 类生命周期

```
创建: constructor(props)
  ↓
挂载: mount(container)
  ↓ 渲染并插入 DOM
onMounted() ← 初始化钩子
  ↓
[运行中]
  ↓
update(newProps) ← 可重写，控制更新逻辑
  ↓ this.props = { ...this.props, ...newProps }
  ↓ this.forceUpdate()
  ↓ diff/patch DOM
  ↓
[运行中]
  ↓
onBeforeUnmount() ← 清理钩子
  ↓
unmount()
  ↓ 清理 refs，移除 DOM
```

### 生命周期钩子说明

**onMounted()**

- 时机：DOM 插入后
- 用途：初始化、事件绑定、数据请求
- 注意：此时 refs 已注册

**onBeforeUnmount()**

- 时机：DOM 移除前
- 用途：清理、解绑事件、取消请求
- 注意：此时 DOM 和 refs 都还在，可以访问

### update() 和 forceUpdate() 语义

#### update(newProps) - 外部 props 变更通知

**用途**：父组件通知子组件 props 变更

**内置行为**：

1. 合并新旧 props：`this.props = { ...this.props, ...newProps }`
2. 执行 diff 和 patch DOM
3. 触发 `onPropsUpdated()` 生命周期钩子（如果定义）
4. 递归更新子组件（考虑脱围）

**可重写**：

```typescript
// 自定义 props 更新逻辑
update(newProps: Partial<TProps>): void {
  const oldProps = this.props

  // 判断是否需要更新
  if (oldProps.count === newProps.count) {
    return  // 跳过更新
  }

  // 更新 props
  this.props = { ...this.props, ...newProps }

  // 开发者自行决定是否调用 forceUpdate
  this.forceUpdate()

  // 开发者自行决定是否触发 onPropsUpdated
  // this.onPropsUpdated?.()
}
```

**注意**：

- update() 是提供给**外部（父组件）**调用的 API
- 内置实现会处理 diff 和触发生命周期
- 重写后由开发者自行决定所有行为

#### forceUpdate() - 强制重新渲染

**用途**：组件内部触发重新渲染（不改变 props）

**行为**：

1. 调用 `this.render()` 生成新 VNode
2. 与旧 VNode 进行 diff
3. patch DOM（最小化 DOM 操作）
4. 递归更新子组件（考虑脱围）

**不触发生命周期钩子**：

- 不触发 `onPropsUpdated`（因为 props 没变）
- 仅通过渲染流程触发 DOM 变化

**使用场景**：

```typescript
class Counter extends Widget<{}> {
  private count = 0

  handleClick = () => {
    this.count++
    this.forceUpdate()  // 内部状态变化，强制重新渲染
  }

  render() {
    return <button on:click={this.handleClick}>{this.count}</button>
  }
}
```

#### 对比总结

| 方法               | 调用者         | props 变化 | 触发生命周期         | 可重写 |
| ------------------ | -------------- | ---------- | -------------------- | ------ |
| `update(newProps)` | 外部（父组件） | 是         | 是（onPropsUpdated） | 是     |
| `forceUpdate()`    | 内部（自己）   | 否         | 否                   | 否     |

**为什么不需要 onBeforeUpdate/onUpdated？**

- Fukict 更新是显式的（手动调用 `update()` 或 `forceUpdate()`）
- 用户在 `update()` 方法中完全控制更新逻辑
- 不像 React/Vue 的响应式自动更新，不需要额外钩子拦截

### 函数组件没有生命周期

**理由**：

- 保持简单
- 避免复杂度
- 如果需要生命周期，使用 Widget 类

## Refs 机制设计

### 设计目标

实现父子组件通信，父组件可以：

- 引用子组件实例
- 调用子组件方法
- 触发子组件更新

### fukict:ref 属性

```tsx
class Parent extends Widget<{}> {
  // 声明 refs 类型
  declare protected refs: {
    child: ChildWidget;
  };

  handleClick = () => {
    // 通过 ref 访问子组件
    this.refs.child.update({ count: 1 });
  };

  render() {
    return <ChildWidget fukict:ref="child" />;
  }
}
```

### Refs 实现机制

**通过 runtime ComponentHandler 实现**：

1. **组件渲染时**：

   - 创建组件实例：`const instance = new Component(props)`
   - 将实例存储在 VNode 上：`vnode.__instance__ = instance`

2. **VNode 后处理时**：

   - 提取 `fukict:ref` 属性
   - **立即填充到父组件 refs**：`parent.refs.set(refName, instance)`
   - 时机：子组件实例化完成后的第一时间

3. **卸载时**：
   - 清理 refs 引用
   - 调用子组件 unmount

### Refs 可用时机

**重要说明**：

| 时机               | refs 是否可用 | 说明                                            |
| ------------------ | ------------- | ----------------------------------------------- |
| `constructor()`    | ❌            | 子组件还未创建                                  |
| `render()`         | ❌            | 子组件实例化在 render 返回之后                  |
| `onMounted()`      | ❌            | 子组件的 onMounted 还未调用（子级后于父级挂载） |
| `onMounted()` 之后 | ✅            | 可以通过异步访问（如 setTimeout、事件处理器）   |
| 事件处理器         | ✅            | 用户交互时，所有组件已完成挂载                  |

**正确用法**：

```typescript
class Parent extends Widget<{}> {
  protected declare refs: {
    child: ChildWidget
  }

  // ❌ 错误：render 中无法访问 refs
  render() {
    // this.refs.child  // undefined
    return <ChildWidget fukict:ref="child" />
  }

  // ❌ 错误：onMounted 中子组件还未挂载完成
  onMounted() {
    // this.refs.child.element  // undefined，子组件的 element 还未设置
  }

  // ✅ 正确：事件处理器中访问
  handleClick = () => {
    this.refs.child.update({ count: 1 })  // ✅ 可用
  }

  // ✅ 正确：异步访问
  async onMounted() {
    await nextTick()
    this.refs.child.update({ count: 1 })  // ✅ 可用
  }
}
```

**为什么 onMounted 中不能访问子组件实例？**

- 生命周期顺序：父组件 onMounted → 子组件 onMounted
- refs 填充时机：子组件实例化后立即填充
- 子组件 element：子组件 onMounted 时才设置
- 因此父组件 onMounted 时，子组件 element 属性还是 undefined

### Refs 的限制

- **仅用于组件**：不能用于 DOM 元素（使用 props.ref）
- **必须指定名称**：`fukict:ref="name"`
- **同名会覆盖**：后注册的覆盖先注册的

### Refs 清理机制

**自动清理时机**：

- 子组件 unmount 时自动从父组件 refs 中移除
- 父组件 unmount 时递归卸载所有子组件

**避免悬空引用**：

```typescript
class Parent extends Widget<{}> {
  declare protected refs: {
    child?: ChildWidget; // ✅ 使用可选类型
  };

  handleClick = () => {
    // ✅ 正确：检查 ref 是否存在
    if (this.refs.child) {
      this.refs.child.update({ count: 1 });
    }

    // ❌ 错误：不检查直接访问
    // this.refs.child.update({ count: 1 })  // 可能抛出错误
  };
}
```

**潜在问题与解决方案**：

- ⚠️ 问题：异步操作中 ref 可能已被清理
- ✅ 方案：在异步回调中检查 ref 是否仍然存在
- ⚠️ 问题：快速卸载/重新挂载可能导致引用混乱
- ✅ 方案：使用唯一 key 或检查组件实例 ID

## Slots 机制设计

### 设计目标

实现内容投影（类似 Vue slots / React children）

### 默认插槽

```tsx
class Dialog extends Widget<{ title: string }> {
  render() {
    return (
      <div class="dialog">
        <h1>{this.props.title}</h1>
        <div class="body">{this.slots.default}</div>
      </div>
    );
  }
}

// 使用
<Dialog title="标题">
  <p>这是内容</p>
</Dialog>;
```

### 具名插槽

```tsx
class Dialog extends Widget<{ title: string }> {
  render() {
    return (
      <div class="dialog">
        {this.slots.header || <h1>{this.props.title}</h1>}
        <div class="body">{this.slots.default}</div>
        {this.slots.footer || <button>确定</button>}
      </div>
    );
  }
}

// 使用
<Dialog title="标题">
  <h2 fukict:slot="header">自定义标题</h2>
  <p>内容</p>
  <div fukict:slot="footer">
    <button>取消</button>
    <button>确定</button>
  </div>
</Dialog>;
```

### Slots 实现机制

**在 Widget 基类 constructor 中提取**：

1. 从 `props.children` 中提取
2. 检查每个子节点的 `fukict:slot` 属性
3. 有属性的归入具名 slot
4. 无属性的归入 `default` slot
5. 存储到 `this.slots`
6. **隐藏 children 属性**：用户无法直接访问 `this.props.children`

### Slots 可用时机

**重要说明**：

| 时机            | slots 是否可用 | 说明                        |
| --------------- | -------------- | --------------------------- |
| `constructor()` | ✅             | 在基类 constructor 中已提取 |
| `render()`      | ✅             | 可以直接在 render 中使用    |
| `onMounted()`   | ✅             | 始终可用                    |
| 任何方法        | ✅             | 始终可用                    |

**用法示例**：

```typescript
class Dialog extends Widget<{ title: string }> {
  constructor(props) {
    super(props)

    // ✅ constructor 中已可用
    console.log(this.slots.default)  // ✅ 可用
    console.log(this.props.children) // ❌ undefined，已被隐藏
  }

  render() {
    // ✅ render 中直接使用
    return (
      <div class="dialog">
        <h1>{this.props.title}</h1>
        <div class="body">{this.slots.default}</div>
        <div class="footer">{this.slots.footer}</div>
      </div>
    )
  }
}
```

**为什么不暴露 children？**

- slots 机制已经提供了更好的内容投影方式
- 避免用户直接操作 children 导致混乱
- 统一使用 slots API

### Slots 类型

```typescript
type SlotsMap = {
  default?: VNodeChild[]; // 默认插槽
  [name: string]: VNodeChild[] | undefined; // 具名插槽
};
```

## 脱围渲染设计

### 设计目标

允许子组件不随父组件更新，由子组件自己控制更新时机。

### fukict:detach 属性

```tsx
class Parent extends Widget<{}> {
  render() {
    return (
      <div>
        {/* 子组件不随父组件更新 */}
        <ExpensiveChild fukict:detach />
      </div>
    );
  }
}
```

### 脱围实现机制

**通过 runtime 钩子实现**：

1. **VNode 后处理钩子**：

   - 检查 `fukict:detach` 属性
   - 标记 VNode（`vnode.__detached__ = true`）

2. **父组件 forceUpdate 时**：

   - 遍历子组件
   - 如果标记了脱围，跳过自动 update

3. **手动更新**：
   - 父组件可以通过 refs 手动调用 `child.update()`

### 脱围的使用场景

- 性能优化（避免不必要的更新）
- 复杂组件（需要自己控制更新时机）
- 第三方组件集成

### 脱围渲染注意事项

**⚠️ 使用风险**：

- 脱围组件的 props 不会自动更新
- 可能导致父子组件状态不一致
- 调试复杂度增加

**✅ 最佳实践**：

```typescript
class Parent extends Widget<{}> {
  protected declare refs: {
    child: ExpensiveChild
  }

  // ✅ 正确：通过 ref 手动更新
  handleDataChange = (newData) => {
    this.refs.child.update({ data: newData })
  }

  // ❌ 错误：期望脱围组件自动更新
  render() {
    return (
      <div>
        <ExpensiveChild
          fukict:detach
          fukict:ref="child"
          data={this.state.data}  // ❌ 这个 prop 不会自动更新
        />
      </div>
    )
  }
}
```

**📝 推荐做法**：

- 仅在确实需要性能优化时使用
- 必须配合 `fukict:ref` 使用，以便手动更新
- 脱围组件应该是相对独立的功能模块

## 组件更新机制

### 更新触发方式

1. **父组件触发**：

   - 父组件调用 `child.update(newProps)`
   - 触发子组件 `onPropsUpdate`
   - 默认自动 re-render

2. **自己触发**：
   - 调用 `this.forceUpdate()`
   - 直接 re-render

### forceUpdate 实现

```
1. 调用 this.render() 生成新 VNode
2. 与旧 VNode 进行 diff
3. patch DOM（最小化 DOM 操作）
4. 更新子组件（递归，考虑脱围）
```

### Diff 算法（简化版）

**初版不实现 key diff**：

- 按位置比较
- 类型不同则替换
- 属性差异更新
- 子节点递归

**未来优化**：

- key-based diff
- 最长递增子序列
- 双端比较

## 注册到 runtime

### widget 初始化时注册

**使用 ComponentHandler 集中注册**：

```typescript
// widget 包加载时自动执行
import { registerComponentHandler } from '@fukict/runtime';

// 注册 Widget 类组件处理器
registerComponentHandler({
  name: 'Widget',
  priority: 100,

  // 1. 检测 Widget 类
  detect(fn) {
    return (
      fn.prototype instanceof Widget || fn.__COMPONENT_TYPE__ === 'WIDGET_CLASS'
    );
  },

  // 2. 渲染 Widget 实例
  render(Component, props, children) {
    // 创建实例
    const instance = new Component({ ...props, children });

    // 调用 render
    const vnode = instance.render();

    // 存储实例引用（供后续生命周期使用）
    vnode.__instance__ = instance;

    return vnode;
  },

  // 3. 提取特殊属性（refs、slots、detach）
  processVNode(vnode) {
    const props = vnode.props;
    if (!props) return vnode;

    // 提取 fukict:ref
    if (props['fukict:ref']) {
      const refName = props['fukict:ref'];
      const parent = getCurrentWidget();
      if (parent && vnode.__instance__) {
        parent.refs.set(refName, vnode.__instance__);
      }
    }

    // 提取 fukict:detach
    if (props['fukict:detach']) {
      vnode.__detached__ = true;
    }

    return vnode;
  },

  // 4. 挂载时触发生命周期
  onMount(element, vnode) {
    const instance = vnode.__instance__;
    if (instance) {
      instance.element = element;
      instance.onMounted?.();
    }
  },

  // 5. 跳过 fukict: 前缀属性
  processAttribute(element, key, value) {
    if (key.startsWith('fukict:')) {
      return true; // 已处理（不设置到 DOM）
    }
    return false; // 继续默认逻辑
  },

  // 6. 卸载时清理
  onUnmount(element, vnode) {
    const instance = vnode.__instance__;
    if (instance) {
      instance.onBeforeUnmount?.();

      // 清理 refs
      const parent = getParentWidget(instance);
      if (parent) {
        parent.refs.forEach((ref, name) => {
          if (ref === instance) {
            parent.refs.delete(name);
          }
        });
      }
    }
  },
});

// 注册 defineWidget 函数组件处理器
registerComponentHandler({
  name: 'defineWidget',
  priority: 100,

  // 检测 defineWidget 函数
  detect(fn) {
    return fn.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION';
  },

  // 渲染函数组件
  render(component, props, children) {
    // 直接调用函数
    const vnode = component({ ...props, children });

    // 标记来源（用于调试）
    vnode.__component__ = component;

    return vnode;
  },

  // 函数组件不需要生命周期，其他方法不实现
});
```

## 包导出策略

### 公开 API

```typescript
// 组件基类和工厂
export { Widget, defineWidget }

// 重新导出 runtime API（用户只从 widget 引用）
export { render, h, hyperscript, Fragment } from '@fukict/runtime'

// 工具函数（可选，供高级用户使用）
export { extractSlots, extractRefName, isDetached }

// 类型定义
export type {
  VNode,
  VNodeChild,
  WidgetProps,
  SlotsMap,
  RefsMap
}
```

### 不导出的内部 API

- Diff 算法实现
- Refs 管理器内部状态
- Slots 提取器内部实现
- ComponentHandler 注册代码

## 与 scheduler 集成

### 可选集成

```typescript
import { scheduleRender } from '@fukict/scheduler';

// widget 检测 scheduler 是否可用
if (typeof scheduleRender === 'function') {
  // 使用 scheduler 调度渲染
} else {
  // 同步渲染
}
```

### 集成点

- `Widget.forceUpdate()` 可以使用调度器
- `Widget.mount()` 可以使用调度器
- 用户可以选择不使用（同步渲染）

## 性能优化策略

### 编译时优化（配合 babel-preset-widget）

- 自动 defineWidget 包裹
- 组件 displayName 注入
- 静态 VNode 提升（未来）

### 运行时优化

- 最小化 diff 范围
- 避免不必要的 re-render
- 脱围渲染减少更新

### 未来优化空间

- key-based diff
- shouldUpdate 钩子
- memo 化组件
- 异步组件

## 体积目标

- **核心功能**: < 6KB gzipped
- **包含 diff**: < 8KB gzipped
- **完整导出**: < 8KB gzipped

## 设计权衡记录

### 1. 为什么只有 2 个生命周期钩子？

**决策**：只保留 `onMounted` 和 `onBeforeUnmount`

**理由**：

- Fukict 更新是显式的（非响应式）
- 用户在 `update()` 方法中完全控制更新逻辑
- 不需要 `onBeforeUpdate`/`onUpdated` 拦截自动更新
- 保持简单，降低学习成本

**权衡**：

- 比 React/Vue 少很多钩子
- 但符合 Fukict "显式优于隐式"的理念

### 2. 为什么函数组件没有生命周期？

**决策**：defineWidget 函数组件无生命周期

**理由**：

- 保持简单
- 避免复杂度（不实现 Hooks）
- 有需求用 Widget 类

**权衡**：

- 函数组件功能受限
- 但实现简单，体积小

### 3. 为什么 Refs 只用于组件？

**决策**：fukict:ref 仅用于组件，DOM 元素用 props.ref

**理由**：

- refs 是组件通信机制
- DOM 引用通过 runtime 的 ref 机制
- 职责分离

**权衡**：

- 两种 ref 机制
- 但职责清晰

### 4. 为什么不实现 key diff？

**决策**：初版不实现 key-based diff

**理由**：

- 算法复杂，增加体积
- 大部分场景够用
- 可以后续版本添加

**权衡**：

- 列表渲染性能可能不是最优
- 但降低了初版复杂度

### 5. 为什么需要脱围渲染？

**决策**：提供 fukict:detach 脱围机制

**理由**：

- 性能优化的必要手段
- 复杂组件的必要能力
- 是 Fukict 的特色功能

**权衡**：

- 增加了概念复杂度
- 但换来了性能和灵活性

## 测试策略

### 单元测试

- Widget 类生命周期
- defineWidget 函数组件
- Refs 注册和清理
- Slots 提取
- 脱围渲染

### 集成测试

- 与 runtime 集成
- 与 scheduler 集成
- 复杂嵌套组件

### 性能测试

- 渲染性能 benchmark
- 更新性能 benchmark
- 与其他框架对比

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
