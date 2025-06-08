# 🚀 Vanilla DOM

一个专为现代Web应用设计的高性能客户端渲染库，通过编译时优化和组件化架构，提供接近原生DOM操作性能的开发体验。

## 🎯 项目宗旨

Vanilla DOM 专注于为现代Web应用提供高性能的客户端渲染解决方案：

### 🎯 核心优势

- **高性能**: 编译时优化 + 精确DOM更新，接近手写原生代码性能
- **轻量级**: 核心运行时 < 10KB，按需加载增强功能
- **渐进式**: 从基础JSX支持到完整组件编码范式，灵活选择
- **类型安全**: 完整TypeScript支持，优秀的开发体验

### 🏗️ 架构图

```
                  Vanilla DOM 分层架构
                         
    ┌─────────────────────────────────────────────┐
    │              增强层(开发体验)                 │
    │  ┌─────────────────┐  ┌─────────────────┐   │
    │  │  @vanilla-dom/  │  │  @vanilla-dom/  │   │
    │  │     widget      │  │ babel-preset-   │   │
    │  │  (组件编码范式)   │  │    widget       │   │
    │  └─────────────────┘  └─────────────────┘   │
    └─────────────────┬─────────────┬─────────────┘
                      │             │
    ┌─────────────────┼─────────────┼─────────────┐
    │                 │             │             │
    │  ┌─────────────────┐  ┌─────────────────┐   │
    │  │  @vanilla-dom/  │  │  @vanilla-dom/  │   │
    │  │      core       │  │  babel-plugin   │   │
    │  │   (渲染引擎)     │  │   (JSX编译)      │   │
    │  └─────────────────┘  └─────────────────┘   │
    │              基础层 (核心功能)                │
    └─────────────────────────────────────────────┘

    使用路径:
    路径1: 基础层独立使用 → core + babel-plugin
    路径2: 完整开发体验   → widget + babel-preset-widget
```

### 🔧 架构特色

- **分层设计**: 基础层(core+babel-plugin) + 增强层(widget+preset)
- **编译时优化**: 静态分析、模板提取、零配置组件识别
- **纯客户端**: 专为浏览器环境优化，无服务端包袱
- **可扩展**: 支持第三方组件编码范式库扩展

## 📦 核心包

| 包名 | 功能 | 状态 |
|------|------|------|
| [`@vanilla-dom/core`](./packages/core) | 核心渲染引擎和DOM工具集 | ✅ |
| [`@vanilla-dom/babel-plugin`](./packages/babel-plugin) | JSX编译插件 | ✅ |
| [`@vanilla-dom/widget`](./packages/widget) | 组件开发编码范式 | ✅ |
| [`@vanilla-dom/babel-preset-widget`](./packages/babel-preset-widget) | Widget开发预设 | ✅ |

## 🚀 快速开始

```bash
# 安装核心包
pnpm install @vanilla-dom/core

# 或安装完整Widget开发套件
pnpm install @vanilla-dom/widget @vanilla-dom/babel-preset-widget
```

```tsx
import { render } from '@vanilla-dom/core';

// 简单应用
const app = <div>Hello Vanilla DOM!</div>;
render(app, { container: document.getElementById('root')! });
```

## 🎮 演示项目

- [`basic-demo`](./demos/basic-demo/) - 无需编译的基础演示
- [`webpack-demo`](./demos/webpack-demo/) - Webpack集成演示  
- [`vite-demo`](./demos/vite-demo/) - Vite开发环境演示

## 🏗️ 详细架构

### 基础层 (可独立使用)

#### `@vanilla-dom/core` - 核心渲染引擎
- **职责**: VNode 转换、DOM 操作、类型支持
- **特点**: 轻量级、高性能、纯客户端专注
- **使用场景**: 需要最小运行时开销、手动控制渲染逻辑

#### `@vanilla-dom/babel-plugin` - JSX 编译插件  
- **职责**: JSX 转换、编译时优化、组件标志检测
- **特点**: 静态分析、零配置组件识别
- **使用场景**: 需要 JSX 语法支持的项目

### 增强层 (提升开发体验)

#### `@vanilla-dom/widget` - 组件编码范式
- **职责**: 提供 Widget 类和 createWidget 函数
- **特点**: 结构化组件开发、分层架构支持
- **使用场景**: 复杂应用、团队开发、需要组件生命周期管理

#### `@vanilla-dom/babel-preset-widget` - 零配置预设
- **职责**: 预配置开发环境、开箱即用体验
- **特点**: 自动组件注册、完整构建配置
- **使用场景**: Widget 编码范式项目的快速启动

## 📦 包依赖关系

```
@vanilla-dom/babel-preset-widget
├── @vanilla-dom/babel-plugin
└── @vanilla-dom/core

@vanilla-dom/widget
└── @vanilla-dom/core

@vanilla-dom/babel-plugin
└── @vanilla-dom/core (peer dependency)
```

## 🔧 技术特点

### 编译时 + 运行时分离
- **编译时**: babel-plugin 处理 JSX 转换和静态优化
- **运行时**: core 专注 DOM 操作和渲染性能

### 渐进式增强
- **核心功能**: core + babel-plugin 提供基本 JSX 支持
- **开发体验**: widget + preset 提供完整开发环境

### 纯客户端设计
- 专为浏览器环境优化
- 无服务端渲染包袱
- 接近原生 DOM 操作性能

## 📚 文档

- [组件开发指南](./packages/widget/ARCHITECTURE_GUIDE.md) - 复杂组件的分层架构模式
- [Core 包使用说明](./packages/core/README.md) - 基础渲染引擎
- [Babel Plugin 配置](./packages/babel-plugin/README.md) - JSX 编译插件
- [Widget 编码范式](./packages/widget/README.md) - 组件开发模式
- [Preset 快速开始](./packages/babel-preset-widget/README.md) - 零配置使用

## 🛣️ 发展路线

查看 [TODOLIST.md](./TODOLIST.md) 了解项目后续发展计划。

## 🤝 参与贡献

```bash
# 克隆项目
git clone https://github.com/vanilla-dom/vanilla-dom
cd vanilla-dom

# 安装依赖（推荐使用 pnpm，更快的安装速度）
pnpm install

# 开发模式
pnpm run dev

# 构建项目
pnpm run build
```

## 📄 许可证

[MIT](LICENSE) © 2025

---

**让Web开发回归简单高效** ⚡
