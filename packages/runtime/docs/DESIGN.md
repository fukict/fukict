# @fukict/runtime 设计文档

## 包职责

runtime 是 Fukict 的核心渲染引擎，职责：

1. **VNode 创建**：提供 hyperscript 和 JSX runtime
2. **DOM 渲染**：将 VNode 树转换为真实 DOM
3. **扩展点定义**：开放扩展点让其他包扩展渲染能力
4. **基础工具**：DOM 操作、属性设置、事件绑定

## 不包含的功能

- ❌ 组件概念（由 widget 提供）
- ❌ 生命周期（由 widget 提供）
- ❌ 状态管理（由 flux 提供）
- ❌ 调度器（由 scheduler 提供）

## 核心设计理念

### "最小核心 + 扩展点"

runtime 只提供最基础的 VNode → DOM 能力，通过扩展点让外部包扩展功能：

```
Runtime 核心（< 5KB）
  - VNode 创建（hyperscript）
  - DOM 创建和操作
  - 基础渲染流程
  - 扩展点定义

Widget 包（通过扩展点注册）
  - 组件检测
  - 组件渲染
  - 生命周期管理
  - Refs/Slots 等高级功能
```

**为什么这样设计？**
- runtime 保持最小化
- 功能可按需扩展
- 支持多种组件范式共存

## 扩展机制设计

详见：`EXTENSIONS.md`

核心思想：注册**完整的组件处理器**，而非分散的钩子。

### ComponentHandler 接口

```typescript
interface ComponentHandler {
  name: string
  priority?: number

  // 必需
  detect(fn: Function): boolean
  render(component: Function, props: any, children: VNodeChild[]): VNode | null

  // 可选
  processVNode?(vnode: VNode): VNode
  onMount?(element: Element, vnode: VNode): void
  processAttribute?(element: Element, key: string, value: any): boolean
  onUnmount?(element: Element, vnode: VNode): void
}
```

### 注册 API

```typescript
// 注册组件处理器
runtime.registerComponentHandler(handler: ComponentHandler): UnregisterFn
```

**为什么集中注册？**
- 概念清晰：注册的是"如何处理某种组件"
- 代码聚合：相关逻辑在一起
- 类型安全：一个接口，TypeScript 类型推导更好

## VNode 结构设计

### VNode 类型定义

```typescript
VNode {
  type: string | Function
  props: Record<string, any> | null
  children: VNodeChild[]
}

VNodeChild = VNode | string | number | boolean | null | undefined | VNodeChild[]
```

### 设计决策

**为什么 children 是数组？**
- 简化遍历逻辑
- 支持数组子节点（map）
- 递归扁平化嵌套数组

**为什么 props 可以为 null？**
- 减少内存占用（无 props 时不创建空对象）
- 性能优化（减少对象创建）

**为什么支持 boolean/null/undefined？**
- JSX 条件渲染兼容性
- 渲染时过滤这些值

**为什么没有 key？**
- 初版不实现 key diff
- 简化实现，降低复杂度
- 未来可通过 props 扩展

**为什么没有 ref 字段？**
- ref 通过 props 传递（props['fukict:ref']）
- 统一属性处理逻辑

## 渲染流程设计

### 核心流程

```
1. hyperscript(type, props, events, ...children)
   ↓ 创建 VNode

2. render(vnode, container)
   ↓ 检测 type 类型

3a. 如果是 string (原生元素)
    ↓ 创建 DOM 元素
    ↓ 设置属性（调用属性设置扩展点）
    ↓ 绑定事件
    ↓ 递归渲染子节点
    ↓ 调用 DOM 挂载前扩展点
    ↓ 插入容器

3b. 如果是 Function
    ↓ 遍历所有处理器，调用 detect
    ↓ 是组件？
       Yes → 调用处理器的 render → 返回 VNode → 回到步骤 2
       No  → 调用函数并渲染返回值
```

### 扩展点介入时机

渲染流程中的关键节点可以通过组件处理器扩展：

- **组件检测时**：handler.detect()
- **组件渲染时**：handler.render()
- **VNode 创建后**：handler.processVNode()
- **DOM 创建后**：handler.onMount()
- **属性设置时**：handler.processAttribute()
- **DOM 移除时**：handler.onUnmount()

## hyperscript 设计

### 签名

```typescript
function hyperscript(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode
```

### 事件处理

**事件作为 props 的一部分**：

babel-plugin 编译时会将 `on:` 前缀的属性编译为普通 props：

```typescript
// 编译前（JSX）
<div class="box" on:click={handleClick}>Hello</div>

// 编译后
hyperscript(
  'div',
  { class: 'box', 'on:click': handleClick },
  'Hello'
)
```

**runtime 渲染时分离**：

```typescript
// runtime 内部处理
function render(vnode) {
  const props = {}
  const events = {}

  for (const [key, value] of Object.entries(vnode.props)) {
    if (key.startsWith('on:')) {
      const eventName = key.slice(3)  // 移除 'on:' 前缀
      events[eventName] = value
    } else {
      props[key] = value
    }
  }

  // 设置属性
  setAttributes(element, props)

  // 绑定事件
  bindEvents(element, events)
}
```

**为什么这样设计？**
- props 统一管理，简化 API
- babel-plugin 只需要编译为 props
- runtime 内部分离事件，用户无感知

## DOM 操作设计

### 原子操作

runtime 提供最基础的 DOM 操作函数：

```typescript
// 创建
createElement(tag: string): Element
createTextNode(text: string): Text

// 操作
appendChild(parent: Node, child: Node): void
removeChild(parent: Node, child: Node): void
replaceChild(parent: Node, newChild: Node, oldChild: Node): void
insertBefore(parent: Node, newChild: Node, referenceNode: Node): void

// 属性
setAttribute(element: Element, key: string, value: any): void
removeAttribute(element: Element, key: string): void
setProperty(element: Element, key: string, value: any): void

// 事件
addEventListener(element: Element, type: string, handler: EventListener): void
removeEventListener(element: Element, type: string, handler: EventListener): void
```

### 设计原则

**为什么是原子操作而非批量？**
- 简化实现
- 调用者可以自行批量
- 扩展点可以精确控制每个操作

**为什么不抽象跨平台？**
- runtime 专注浏览器 DOM
- 跨平台由上层处理
- 保持体积最小

## 包导出策略

### 公开 API

```typescript
// VNode 创建
export { hyperscript, h, jsx, jsxs, jsxDEV, Fragment }

// 渲染函数
export { render }

// 扩展机制
export { registerComponentHandler }

// DOM 工具（可选，供 widget 使用）
export {
  createElement,
  appendChild,
  setAttribute,
  addEventListener,
  ...
}

// 类型定义
export type { VNode, VNodeChild, RenderOptions, ... }
```

### 不导出的内部 API

- VNode 缓存（如果有）
- 渲染器内部状态
- 扩展点执行器实现

## 性能优化策略

### 编译时优化（配合 babel-plugin）

- 静态 VNode 提升
- 事件预分离（on: 前缀）
- 子节点扁平化

### 运行时优化

- 最小化对象创建
- 避免不必要的属性遍历
- 快速路径优化（如纯文本节点）

### 未来优化空间

- 虚拟滚动支持
- 异步渲染
- Fiber 架构（如果需要）

## 类型安全

### TypeScript 支持

- 完整的类型定义
- JSX 类型推导
- 扩展点类型约束

### JSX 命名空间

```typescript
declare namespace JSX {
  interface Element extends VNode {}
  interface IntrinsicElements {
    div: HTMLAttributes
    span: HTMLAttributes
    // ... 所有 HTML 元素
  }
}
```

## 错误处理

### 错误捕获

- 渲染错误不应导致整个应用崩溃
- 提供错误边界机制（通过扩展点）

### 开发提示

- 开发模式下详细的警告信息
- 生产模式下移除所有警告

## 浏览器兼容性

### 目标环境

- 现代浏览器（ES2015+）
- 不支持 IE11

### Polyfill

- 不内置 polyfill
- 用户自行选择（通过构建工具）

## 体积目标

- **核心功能**: < 3KB gzipped
- **包含扩展点机制**: < 5KB gzipped
- **完整导出**: < 5KB gzipped

## 设计权衡记录

### 1. 为什么不实现 VDOM diff？

**决策**：runtime 不内置 diff 算法

**理由**：
- diff 逻辑复杂，增加体积
- widget 可以实现自己的 diff
- 保持 runtime 职责单一

**权衡**：
- widget 需要自己实现 diff
- 但 runtime 保持极简

### 2. 为什么不支持 key？

**决策**：初版不实现 key diff

**理由**：
- key diff 算法复杂
- 大部分场景不需要
- 可以通过后续版本添加

**权衡**：
- 列表渲染性能可能不是最优
- 但降低了初版复杂度

### 3. 为什么扩展机制是必须的？

**决策**：即使增加复杂度也要做扩展机制

**理由**：
- 这是扩展性的核心
- 没有它就无法实现 widget
- 是整个架构的基石

**权衡**：
- 增加了实现复杂度
- 但换来了无限的扩展性

### 4. 为什么用集中注册？

**决策**：注册完整的 ComponentHandler，而非分散注册

**理由**：
- 概念清晰：注册的是"如何处理某种组件"
- 代码聚合：相关逻辑在一起，易于维护
- 类型安全：一个接口包含所有方法，TypeScript 推导更好

**对比**：
```typescript
// ❌ 分散注册（6 次调用）
runtime.registerComponentDetector(...)
runtime.registerComponentRenderer(...)
// ... 4 more

// ✅ 集中注册（1 次调用）
runtime.registerComponentHandler({
  detect, render, processVNode, ...
})
```

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
