# Fukict 架构设计总览

## 设计哲学

**轻量、灵活、可控**

- **轻量**：核心运行时 < 5KB，完整框架 < 12KB
- **灵活**：内置函数组件和类组件，简化架构
- **可控**：精细化控制渲染粒度和更新时机

## 核心原则

### 1. 分层架构

```
应用层
  ├─ @fukict/router (路由)
  ├─ @fukict/flux (状态管理)
  └─ @fukict/scheduler (调度器)
       ↓ 可选依赖
核心层
  └─ @fukict/basic (组件渲染引擎)
       ↓ 无依赖
编译层
  └─ @fukict/babel-preset (JSX 编译)
```

### 2. 职责边界

**@fukict/basic** - 组件渲染引擎

- 负责 VNode → DOM
- 内置函数组件和类组件支持
- 无依赖，体积极小
- 支持生命周期、refs、slots、脱围渲染

**@fukict/scheduler** - 调度器

- 独立包，可选使用
- 提供优先级调度
- 与 core 松耦合

**其他包** - 按需加载

- router：路由管理
- flux：状态管理
- babel-preset：JSX 转换、优化

## 包依赖策略

### Direct Dependencies

**@fukict/basic** 作为核心包：

- 用户直接安装 core，无需额外依赖
- 内置函数组件和类组件支持
- 避免版本冲突和 peer dependency 问题

### 用户安装

```bash
# 最小安装
pnpm add @fukict/basic

# 完整功能
pnpm add @fukict/basic @fukict/scheduler @fukict/router @fukict/flux

# 开发工具
pnpm add -D @fukict/babel-preset
```

### 用户引用

**统一从 core 引用**：

```typescript
// ✅ 正确：从 core 引用所有 API
import { Fukict, defineFukict, render, h } from '@fukict/basic'

// 或者使用解构引用
import {
  Fukict,           // 类组件基类
  defineFukict      // 函数组件类型
  render,           // 渲染函数
  h                 // hyperscript 函数
} from '@fukict/basic'
```

**理由**：

- 降低心智负担（只需知道 core）
- core 内置所有必要功能
- 保持类型完整性
- 版本管理简单直接

## 关键设计决策

### 1. 为什么 scheduler 独立？

**决策**：scheduler 从 core 剥离为独立包

**理由**：

- 不是所有场景都需要调度
- 某些场景需要自定义调度策略
- 减少 core 体积

**权衡**：

- 用户需要额外安装
- 但提供了选择权

## 设计目标

### 性能目标

**体积目标**：

- **core**: < 5KB gzipped
- **完整框架** (core + scheduler): < 12KB gzipped

**运行时性能目标**：

- **首次渲染**：快速渲染
- **更新性能**：高效的更新机制
- **内存占用**：低内存开销
- **无注册机制开销**：消除处理器查找时间

**性能基准测试**：

- 使用 js-framework-benchmark 作为基准
- 核心场景验证性能表现

**性能权衡说明**：

- ✅ 初版不实现 key-based diff：降低复杂度
- ✅ 无注册机制开销：性能更优
- ✅ 简化的调度器：无时间切片，但体积小、实现简单

### 功能目标

- **核心层**: VNode 创建、DOM 渲染、函数组件、类组件
- **组件能力**: 类组件、函数组件、生命周期、refs、slots、脱围渲染
- **工具链**: JSX 编译优化、调度器、路由、状态管理
- **开发体验**: 类型完整、错误清晰、调试友好

### 兼容性目标

- **浏览器**: 现代浏览器（ES2015+）
- **TypeScript**: 5.0+
- **构建工具**: Vite、Webpack、Rsbuild

### 不支持的功能

- **SSR（服务端渲染）**：Fukict 专注于客户端渲染。未来如需 SSR，会使用高性能语言（如 Rust）实现独立的 SSR 方案，而非基于 Node.js。

## 未来演进

### 短期规划

1. 完成核心包设计和实现
2. 完善工具链（babel-preset、scheduler）
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
