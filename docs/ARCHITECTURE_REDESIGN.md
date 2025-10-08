# Fukict 架构重构设计方案

> **版本**: v2.1
> **日期**: 2025-10-08
> **状态**: 设计确认完成，待实施

---

## 一、核心变更概述

### 1.1 设计目标

本次重构旨在解决以下核心问题：

1. **职责分离不清晰**：DOM 更新逻辑分散在 runtime 和 widget 层
2. **Children 类型支持不友好**：缺乏具名插槽机制
3. **组件实例管理无范式**：开发者需要手动管理子组件实例
4. **更新粒度控制缺失**：无法精确控制组件更新传播
5. **列表操作不便**：缺乏列表 Widget 的操作范式

### 1.2 架构分层重新定义

#### Runtime 层职责（简化）
- **唯一职责**：VNode → DOM 的首次渲染
- JSX 编译产物到 VNode 的转换
- VNode 树到真实 DOM 的初始创建
- Pattern Registry 扩展机制
- VNode-DOM 映射维护（WeakMap）
- 基础 DOM 工具函数

**移除**：
- 所有 DOM diff/patch 逻辑
- 所有 DOM 更新相关 API

#### Widget 层职责（增强）
- **新增职责**：DOM diff/patch 算法实现
- 组件实例生命周期管理（mount/unmount/update）
- Refs 机制（单组件引用）
- Slots 机制（具名插槽）
- 脱围机制（控制更新传播）
- 自更新/被父更新机制
- List 操作辅助 API（WidgetList）

### 1.3 设计原则

1. **Runtime 层保持极简**：职责单一，体积 < 10KB
2. **Widget 层提供高级抽象**：开发者友好的 API
3. **框架与用户平衡**：框架自动管理，用户可扩展
4. **类型安全优先**：充分利用 TypeScript 类型系统
5. **性能可控**：提供精细的更新控制机制

---

## 二、Slots 机制设计

### 2.1 设计背景

**现状问题**：
- `children` 类型是 `VNodeChild | VNodeChild[]`，类型推断困难
- 无法支持具名插槽
- 组件内部只能通过 `props.children` 统一接收

**设计目标**：
- 支持具名插槽（类似 Vue/Svelte）
- 保持 JSX 语法的自然性
- 编译期优化，运行时开销最小

### 2.2 语法设计

**约定**：
- 使用 `fukict:slot="name"` 属性标记具名插槽
- 未标记的子元素归入 `default` 插槽
- 组件通过 `this.slots` 访问

**实现策略**：
- Babel 插件识别 `fukict:slot` 属性
- 编译期将 children 转换为 `slots` 对象
- Widget 基类提供 `this.slots` 访问器

### 2.3 核心概念

- **Slots 提取**：框架在 mount 阶段自动提取
- **Slots 访问**：通过 `this.slots.slotName` 读取
- **默认内容**：支持 `this.slots.header ?? <DefaultHeader />`
- **类型扩展**：用户可通过 `declare slots` 扩展类型

---

## 三、Refs 机制设计

### 3.1 设计背景

**现状问题**：
- 组件实例缓存无统一范式
- 类组件手动在实例上挂载子组件
- 函数组件用闭包常量管理

**设计目标**：
- 框架统一管理子组件实例
- 支持单组件引用（同名覆盖）
- 用户可扩展 refs 类型

### 3.2 核心设计

**存储设计**：
- 使用普通对象：`refs: Record<string, Widget>`
- 同名 ref 会被后来者覆盖
- 用户通过 `declare` 扩展类型

**语法**：
- `fukict:ref="name"` - 标记组件引用
- 只支持单个组件/DOM，不支持列表

### 3.3 生命周期

- **Mount 阶段**：识别 `fukict:ref`，自动挂载并注册
- **Update 阶段**：根据 `fukict:detach` 决定是否调用子组件 `update()`
- **Unmount 阶段**：自动卸载所有 refs，清理引用

---

## 四、更新机制设计（核心）

### 4.1 更新机制的本质

**关键认知**：所有子组件本质都是脱围的，通过 `onPropsUpdate` 默认实现产生"自动更新"的假象。

```
父组件 forceUpdate()
  ↓
框架 diff VNode
  ↓
发现子组件 props 变化
  ↓
调用子组件 update(newProps)
  ↓
子组件 onPropsUpdate(oldProps, newProps)
  ↓
默认实现：this.forceUpdate()  ← 产生"自动更新"的假象
```

### 4.2 三种更新模式

#### 模式 1：完全自动（默认）

**特征**：
- 不重写 `onPropsUpdate`
- 使用默认实现

**行为**：
- 父组件 `forceUpdate()` → 框架调用子组件 `update()` → `onPropsUpdate` 默认调用 `forceUpdate()`

**适用场景**：常规 UI 组件

#### 模式 2：Re-render 脱围

**特征**：
- 重写 `onPropsUpdate` 自定义更新逻辑
- 不使用 `fukict:detach`

**行为**：
- 父组件 `forceUpdate()` → 框架调用子组件 `update()` → 自定义 `onPropsUpdate` → 用户决定是否 `forceUpdate()` 或手动 DOM 操作

**适用场景**：需要优化更新性能的组件

#### 模式 3：完全脱围

**特征**：
- 使用 `fukict:detach` 标记
- 父组件主动控制

**行为**：
- 父组件 `forceUpdate()` → 框架**不调用**子组件 `update()` → 父组件通过 `this.refs.xxx` 手动控制

**适用场景**：视频播放器、Canvas 渲染器等需要精确控制的复杂组件

### 4.3 脱围机制

**语法**：
- `fukict:detach` - 不需要赋值，配置即脱围
- 未配置即非脱围

**关键点**：
- mount/unmount 不受脱围影响，总是由框架自动管理
- 脱围仅影响 props 更新传播

---

## 五、列表操作设计

### 5.1 设计原则

**核心理念**：
- 列表不需要特殊的 ref 机制
- 框架整体 diff 列表（简单更新）
- 脱围组件内部自行管理列表（精细更新）

### 5.2 两种列表范式

#### 范式 1：框架整体 diff（简单更新）

**特点**：
- 直接在 `render()` 中 `map` 渲染列表
- 修改 state → `forceUpdate()` → 框架整体 diff
- 无需 ref 访问列表实例

**适用场景**：常规列表，更新频率不高

#### 范式 2：WidgetList 辅助（精细更新）

**特点**：
- 脱围组件内部使用 `WidgetList` 管理
- 提供 `add/remove/update/move` 等方法
- 支持最小粒度更新

**适用场景**：高频更新的复杂列表

### 5.3 WidgetList 设计

**核心职责**：
- 管理 Widget 实例数组
- 自动处理 mount/unmount
- 提供列表操作 API

**关键方法**：
- `attachTo(container)` - 绑定 DOM 容器
- `add(widget, index?)` - 添加实例
- `remove(index)` - 移除实例
- `update(index, props)` - 更新实例
- `move(ops)` - 批量移动，ops 类型为 `Array<{from: number; to: number}>`
- `getItem(index)` - 获取实例

---

## 六、Widget 泛型设计

### 6.1 设计方案

**采用方案**：单泛型 + declare 扩展

```
Widget<TProps>
  - props: TProps
  - slots: Record<string, VNode | VNode[]>
  - refs: Record<string, Widget>
```

**用户扩展**：
```
class MyWidget extends Widget<MyProps> {
  protected declare refs: {
    header: Header;
    footer: Footer;
  };

  protected declare slots: {
    content: VNode;
    header?: VNode;
  };
}
```

### 6.2 设计理由

1. **简洁直观**：只有一个必需泛型参数
2. **按需扩展**：用户可选择性扩展 refs/slots 类型
3. **TypeScript 原生**：利用 `declare` 覆盖父类字段类型
4. **符合生态**：与现有 TypeScript 习惯一致

---

## 七、生命周期与钩子设计

### 7.1 生命周期钩子

**三个核心钩子**：
1. `onMounted()` - 组件挂载后，DOM 已创建，refs 已注册
2. `onUnmounting()` - 组件卸载前，DOM 即将移除
3. `onPropsUpdate(oldProps, newProps)` - Props 更新时

**钩子特性**：
- 默认实现：`onPropsUpdate` 调用 `forceUpdate()`，其他为空
- 子类覆盖：可完全自定义逻辑
- 返回值：无返回值，直接在内部操作

### 7.2 Final 方法约束

**核心决策**：`mount` 和 `unmount` 不允许子类覆盖

**实现方式**：
- 运行时检查（开发环境）：constructor 中检测原型链
- 文档约定：`@final` 注释 + CLAUDE.md 说明
- ESLint 规则（可选）：静态检查

**理由**：
- mount/unmount 是框架生命周期核心
- 子类只能通过 `onMounted/onUnmounting` 钩子介入
- 避免开发者破坏框架逻辑

---

## 八、函数组件设计

### 8.1 保留理由

- 适用于简单的无状态组件
- 提供简洁的语法
- 与类组件共享生命周期概念

### 8.2 特性限制

**支持**：
- 生命周期钩子（通过 props 传递）：`onMounted/onUnmounting/onPropsUpdate`
- `update()` API
- 自动更新机制

**不支持**：
- 脱围机制（`fukict:detach`）- 仅类组件支持
- Refs - 仅类组件支持
- Slots - 仅类组件支持

### 8.3 实现策略

- 使用 Widget 层的 `patchDOM` 实现更新
- 移除对 runtime `updateDOM` 的依赖
- 保持 API 向后兼容

---

## 九、实施计划

### 阶段 1：Runtime 层清理
- 移除 `renderer/differ.ts`
- 移除 `updateDOM` 导出
- 保留首次渲染能力

### 阶段 2：Widget 层基础设施
- 创建 `WidgetList` 辅助类
- 创建 refs 管理模块
- 创建 slots 提取模块
- 迁移并增强 differ 逻辑

### 阶段 3：Widget 基类改造
- 实现泛型设计（单泛型 + declare）
- 添加 `refs` 字段和辅助方法
- 添加 `slots` 字段
- 实现新的 mount/unmount（含 final 检查）
- 实现 update/forceUpdate
- 实现 onPropsUpdate 钩子（默认调用 forceUpdate）
- 实现 updateChildren（脱围支持）

### 阶段 4：函数组件改造
- 移除 runtime 依赖
- 使用 Widget 层 patchDOM
- 添加生命周期 hook 支持

### 阶段 5：Babel 插件改造
- 识别 `fukict:slot`
- 识别 `fukict:ref`
- 识别 `fukict:detach`
- 编译期转换

### 阶段 6：类型定义更新
- 更新 DOMProps（添加 fukict:* 属性）
- 导出新类型（WidgetList）
- 更新 Widget 泛型定义

### 阶段 7：文档与 Demo
- 更新 CLAUDE.md
- 更新 API 文档
- 更新所有 demos
- 添加迁移指南

---

## 十、向后兼容性分析

### 10.1 破坏性变更

| 变更 | 影响范围 | 迁移难度 |
|-----|---------|---------|
| Runtime `updateDOM()` 移除 | 直接使用 runtime 的代码 | 中 |
| Widget mount/unmount 不可覆盖 | 覆盖了这两个方法的子类 | 低 |
| 移除列表 ref 机制 | 使用 `fukict:ref-list` 的代码 | 中 |
| 内部实现变化 | 无（public API 不变） | 无 |

### 10.2 保持兼容

- Widget 类组件的 public API 保持不变
- 函数组件的 public API 保持不变
- Runtime `render()` API 保持不变
- JSX 语法向后兼容（除非使用新特性）

### 10.3 迁移路径

**对于 Widget 类组件**：
- 检查是否覆盖了 `mount/unmount` → 改为使用 `onMounted/onUnmounting`
- 检查是否使用了 `fukict:ref-list` → 改为普通列表渲染或使用 WidgetList

**对于函数组件**：
- 无需修改，完全兼容

**对于直接使用 runtime 的代码**：
- 如果使用了 `updateDOM()`，改为使用 Widget 层或手动 DOM 操作

---

## 十一、性能目标

### 11.1 优化点

1. **精确更新边界**：只更新当前组件的 DOM，子组件根据 diff 决定
2. **脱围机制**：避免不必要的子组件更新传播
3. **自定义更新策略**：通过 `onPropsUpdate` 手动控制 DOM 操作
4. **WidgetList 优化**：提供高效的增删改操作，最小粒度更新
5. **Refs 轻量化**：普通对象存储，无额外开销

### 11.2 监控指标

- Widget 层 `patchDOM` 平均执行时间
- Refs 管理内存开销
- Slots 提取耗时
- 组件实例化速率
- Bundle 体积（runtime < 10KB，widget 合理增长）

---

## 十二、设计决策记录

### 12.1 为何将 DOM diff 移至 Widget 层？

**决策**：Runtime 层移除所有 DOM 更新逻辑，Widget 层承担 diff/patch

**理由**：
- Runtime 层职责单一：只负责首次渲染
- Widget 层需要精确控制更新粒度
- 组件实例管理与 DOM 更新紧密相关，应在同一层
- 保持 Runtime < 10KB 的性能目标

### 12.2 为何 refs 使用普通对象而非 Map？

**决策**：`refs: Record<string, Widget>`

**理由**：
- 直接属性访问更自然：`this.refs.header` vs `this.refs.get('header')`
- 用户可通过 `declare refs` 获得完美的类型推断
- 辅助方法提供 Map-like 功能
- 用户可自由扩展：`this.refs.custom = new Widget()`

### 12.3 为何移除列表 ref 机制？

**决策**：移除 `fukict:ref-list` 和 `WidgetRefList`

**理由**：
- 列表不需要特殊 ref 机制，框架整体 diff 即可
- 脱围组件可用 WidgetList 自行管理
- 简化概念，降低学习成本
- refs 只存单个组件，同名覆盖，语义清晰

### 12.4 为何 mount/unmount 设计为 final？

**决策**：禁止子类覆盖 `mount/unmount` 方法

**理由**：
- 这两个方法是框架生命周期核心
- 包含 refs 注册、slots 提取等关键逻辑
- 用户需求通过 `onMounted/onUnmounting` 完全满足
- 避免开发者破坏框架逻辑导致难以调试的问题

### 12.5 为何保留函数组件？

**决策**：保留 `defineWidget` 但不支持高级特性

**理由**：
- 适用于简单无状态组件
- 提供更轻量的选择
- 与类组件共享生命周期概念
- 学习曲线更平缓

### 12.6 为何更新机制设计为"本质脱围"？

**决策**：所有子组件本质都是脱围的，通过 `onPropsUpdate` 默认实现产生"自动更新"假象

**理由**：
- 提供灵活的更新控制：完全自动 / re-render 脱围 / 完全脱围
- 用户可重写 `onPropsUpdate` 自定义更新策略
- 框架提供便利，用户保留控制权
- 符合"最小粒度更新"的设计目标

---

## 附录：关键术语表

| 术语 | 定义 |
|-----|-----|
| **自更新** | 组件内部调用 `forceUpdate()` 触发的重新渲染 |
| **被父更新** | 父组件调用子组件 `update(newProps)` 触发的更新 |
| **完全脱围** | 使用 `fukict:detach`，父组件不调用子组件 `update()` |
| **Re-render 脱围** | 重写 `onPropsUpdate`，自定义更新逻辑 |
| **本质脱围** | 所有子组件本质都是脱围的，通过默认 `onPropsUpdate` 产生自动更新假象 |
| **Slots** | 具名插槽机制，通过 `fukict:slot` 标记 |
| **Refs** | 子组件实例的引用，存储在 `this.refs` 中（只存单个，同名覆盖） |
| **WidgetList** | 列表 Widget 管理的辅助类，用于脱围组件内部 |
| **Final 方法** | 不允许子类覆盖的方法（mount/unmount） |
| **Pattern Registry** | Runtime 层提供的组件编码范式扩展机制 |

---

**文档版本历史**

- v2.1 (2025-10-08) - 核心机制重新设计，移除列表 ref，明确更新机制本质
- v2.0 (2025-10-08) - 初始设计完成
