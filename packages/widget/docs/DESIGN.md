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

## 详细设计文档

- [生命周期设计](./LIFECYCLE.md)
- [更新机制](./UPDATE_MECHANISM.md)
- [Refs 机制](./REFS.md)
- [Slots 机制](./SLOTS.md)
- [脱围渲染](./DETACH.md)
- [命名约定](./NAMING_CONVENTIONS.md)
- [与 runtime 集成](./INTEGRATION.md)

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

## 体积目标

- **核心功能**: < 6KB gzipped
- **包含 diff**: < 8KB gzipped
- **完整导出**: < 8KB gzipped

## 设计权衡记录

### 1. 为什么只有 2 个生命周期钩子？

**决策**：只保留 `onMounted`、`onBeforeUnmount`

**理由**：

- Fukict 更新是显式的（非响应式）
- 用户在 `update()` 方法中完全控制更新逻辑
- **不需要 onPropsUpdated**：`update()` 方法本身就是 props 更新的钩子
- 不需要额外的 `onBeforeUpdate`/`onUpdated` 拦截自动更新
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

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
