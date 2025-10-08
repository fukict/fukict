# Fukict 架构设计总览

## 设计哲学

**轻量、灵活、可扩展**

- **轻量**：核心运行时 < 5KB，完整框架 < 15KB
- **灵活**：通过注册机制扩展，而非硬编码功能
- **可扩展**：清晰的包边界，支持按需加载

## 核心原则

### 1. 分层架构

```
应用层
  ├─ @fukict/router (路由)
  ├─ @fukict/flux (状态管理)
  └─ @fukict/scheduler (调度器)
       ↓ 可选依赖
组件层
  └─ @fukict/widget (组件抽象)
       ↓ direct 依赖
运行时层
  └─ @fukict/runtime (渲染引擎)
       ↓ 无依赖
编译层
  ├─ @fukict/babel-plugin
  └─ @fukict/babel-preset-widget
```

### 2. 职责边界

**@fukict/runtime** - 最小运行时

- 仅负责 VNode → DOM
- 提供注册机制，不内置组件概念
- 无依赖，体积极小

**@fukict/widget** - 组件抽象

- 通过注册机制扩展 runtime
- 提供 Widget 类组件和函数组件
- 管理生命周期、refs、slots

**@fukict/scheduler** - 调度器

- 独立包，可选使用
- 提供优先级调度
- 与 widget 松耦合

**其他包** - 按需加载

- router：路由管理
- flux：状态管理
- 编译工具：JSX 转换

### 3. 扩展性设计

**核心：注册机制**

runtime 不内置任何高级功能，所有扩展通过注册实现：

- widget 注册组件渲染逻辑
- scheduler 注册调度逻辑
- devtools 注册调试钩子

这种设计允许：

- 多种组件范式共存
- 按需加载功能
- 第三方扩展

## 包依赖策略

### Direct Dependencies

**@fukict/widget** 直接依赖 @fukict/runtime：

- 用户只需安装 widget，runtime 自动安装
- widget 锁定兼容的 runtime 版本
- 避免版本冲突和 peer dependency 警告

### 用户安装

```bash
# 最小安装（runtime 自动安装）
pnpm add @fukict/widget

# 完整功能
pnpm add @fukict/widget @fukict/scheduler @fukict/router @fukict/flux

# 开发工具
pnpm add -D @fukict/babel-preset-widget
```

### 用户引用

**统一从 widget 引用**：

```typescript
// ✅ 正确：从 widget 引用所有 API
import { Widget, render, h } from '@fukict/widget'

// ❌ 错误：不应直接使用 runtime
import { render } from '@fukict/runtime'
```

**理由**：

- 降低心智负担（只需知道 widget）
- widget 重新导出 runtime 必要 API
- 保持类型完整性
- 版本管理由 widget 统一负责

## 关键设计决策

### 1. 为什么 runtime 不内置组件？

**决策**：runtime 只提供 VNode → DOM，组件概念由 widget 提供

**理由**：

- 保持 runtime 极简（< 5KB）
- 支持多种组件范式
- 按需加载高级功能

**权衡**：

- 需要注册机制的复杂度
- 但换来了极大的灵活性

### 2. 为什么 scheduler 独立？

**决策**：scheduler 从 widget 剥离为独立包

**理由**：

- 不是所有场景都需要调度
- 某些场景需要自定义调度策略
- 减少 widget 体积

**权衡**：

- 用户需要额外安装
- 但提供了选择权

### 3. 为什么 widget 直接依赖 runtime？

**决策**：widget 直接依赖 runtime，用户只需安装 widget

**理由**：

- 降低用户心智负担（只需知道 widget）
- 避免版本管理问题
- 避免 peer dependency 警告
- Fukict 定位是组件框架，不是纯渲染库

**权衡**：

- ✅ 优势：简化用户安装，99% 用户使用 widget，体验大幅提升
- ⚠️ 劣势：widget 与 runtime 紧耦合
  - runtime 重构会影响 widget
  - 无法单独升级 runtime 版本
  - 但这是可接受的代价，因为两者本就是配套设计
- 📝 风险缓解：
  - runtime API 保持稳定
  - 主版本号同步升级
  - 通过 semver 管理兼容性

### 4. 为什么需要注册机制？

**决策**：runtime 提供 ComponentHandler 注册，widget 注册实现

**理由**：

- runtime 保持纯粹（VNode → DOM）
- 支持多种扩展（widget、devtools、第三方）
- 按需加载，未使用零开销

**权衡**：

- ✅ 优势：极大的扩展性和灵活性
- ⚠️ 劣势：运行时性能开销
  - 每次组件渲染需要遍历处理器
  - 多个处理器可能产生冲突
- 📝 性能优化策略：
  - 处理器按优先级排序，检测到匹配立即停止遍历
  - 缓存组件类型检测结果
  - 生产环境移除调试相关的处理器
  - 预期开销 < 5% 渲染时间

## 设计目标

### 性能目标

**体积目标**：

- **runtime**: < 5KB gzipped
- **widget**: < 8KB gzipped
- **完整框架** (runtime + widget + scheduler): < 15KB gzipped

**运行时性能目标**：

- **首次渲染**：优于 React/Preact（目标：快 10-20%）
- **更新性能**：与 Vue 3 相当（无 key diff 情况下）
- **内存占用**：比 React 低 30%（无 Fiber 架构开销）
- **注册机制开销**：< 5% 渲染时间

**性能基准测试**：

- 使用 js-framework-benchmark 作为基准
- 重点对比：React、Preact、Vue 3、Solid
- 必须通过的场景：
  - 创建 1000 行表格
  - 替换所有行
  - 部分更新（每 10 行）
  - 选择行
  - 交换行
  - 删除行
  - 清空表格

**性能权衡说明**：

- ✅ 初版不实现 key-based diff：降低复杂度，但列表性能可能不如竞品
- ✅ 扩展机制有运行时开销：但通过优化保持在可接受范围
- ✅ 简化的调度器：无时间切片，但体积小、实现简单

### 功能目标

- **运行时层**: VNode 创建、DOM 渲染、注册机制
- **组件层**: 类组件、函数组件、生命周期、refs、slots、脱围渲染
- **工具链**: JSX 编译优化、调度器、路由、状态管理
- **开发体验**: 类型完整、错误清晰、调试友好

### 兼容性目标

- **浏览器**: 现代浏览器（ES2015+）
- **TypeScript**: 5.0+
- **构建工具**: Vite、Webpack、Rsbuild

### 不支持的功能

- **SSR（服务端渲染）**：Fukict 专注于客户端渲染。未来如需 SSR，会使用高性能语言（如 Rust）实现独立的 SSR 方案，而非基于 Node.js。

## 扩展点

### Runtime 注册钩子

- 组件检测
- 组件渲染
- VNode 后处理
- DOM 挂载前
- 子节点渲染
- 属性设置
- 卸载清理

详见：`packages/runtime/docs/DESIGN.md`

### Widget 扩展机制

- 自定义生命周期钩子
- 自定义 refs 管理
- 自定义 slots 处理
- 自定义更新策略

详见：`packages/widget/docs/DESIGN.md`

## 未来演进

### 短期规划

1. 完成核心包设计和实现
2. 完善工具链（babel-plugin、scheduler）
3. 实现 router 和 flux
4. 建立示例项目和文档

### 中期规划

1. 性能优化和 benchmark
2. 开发者工具（devtools）
3. 脚手架工具（create）
4. 生态建设初期探索

### 长期规划

1. 生态建设（UI 库、工具集）
2. 社区驱动的插件系统
3. 多平台支持（小程序、桌面）

## 设计参考

- **React**: 组件设计、Hooks 思想
- **Vue**: 响应式系统、模板优化
- **Preact**: 体积控制、API 简洁性
- **Solid**: 编译时优化、无 VDOM 思想（未来方向）

## 设计评审记录

### 2025-01-XX 初版设计

- ✅ 分层架构清晰
- ✅ 注册机制可行
- ✅ 包依赖合理
- ⚠️ 待完善：各包详细设计

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
**负责人**：Fukict Team
