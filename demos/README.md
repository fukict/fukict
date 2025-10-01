# 🎨 Fukict Demos

这里包含了多个演示项目，展示了 Fukict 在不同场景和构建工具下的使用方式。每个 demo 都有详细的文档和完整的示例代码。

## 📚 演示目录

### 🚀 [basic-demo](./basic-demo/) - 无需编译的基础演示

- **特点**: 直接使用 ES 模块，无需任何构建工具
- **技术栈**: 原生 JavaScript/TypeScript + ES 模块
- **适用于**: 快速原型、学习核心概念、轻量级项目
- **启动方式**: 静态文件服务器或直接打开 HTML

### ⚡ [vite-demo](./vite-demo/) - Vite 构建演示

- **特点**: 快速开发体验，现代构建工具
- **技术栈**: Vite + TypeScript + Babel
- **适用于**: 中小型项目、现代开发环境
- **性能**: 冷启动 < 100ms，热重载 < 50ms

### 🔥 [rsbuild-demo](./rsbuild-demo/) - Rsbuild 极速构建

- **特点**: 基于 Rust 的极速构建，零配置
- **技术栈**: Rsbuild + TypeScript + Babel
- **适用于**: 性能敏感项目、大型应用
- **性能**: 构建时间 < 0.11s，包大小最小

### 📦 [webpack-demo](./webpack-demo/) - Webpack 成熟方案

- **特点**: 成熟稳定，高度可配置
- **技术栈**: Webpack 5 + TypeScript + Babel
- **适用于**: 企业级项目、复杂构建需求
- **优势**: 插件生态丰富，配置灵活

### 🔧 [babel-transform-demo](./babel-transform-demo/) - Babel 转换测试

- **特点**: 测试和验证 JSX 转换效果
- **技术栈**: Babel + JSX 转换插件
- **适用于**: 插件开发、转换验证、调试
- **功能**: 各种 JSX 语法的转换测试

## 🎯 选择指南

### 按项目类型选择

| 项目类型     | 推荐 Demo                    | 理由                       |
| ------------ | ---------------------------- | -------------------------- |
| **学习入门** | basic-demo                   | 无需配置，直接体验核心 API |
| **快速原型** | basic-demo 或 vite-demo      | 快速启动，简单配置         |
| **小型项目** | vite-demo                    | 现代开发体验，配置简单     |
| **中型项目** | rsbuild-demo 或 vite-demo    | 性能和开发体验并重         |
| **大型项目** | webpack-demo 或 rsbuild-demo | 成熟稳定或极致性能         |
| **插件开发** | babel-transform-demo         | 测试转换效果，验证功能     |

### 按性能需求选择

| 需求         | 推荐 Demo    | 性能特点           |
| ------------ | ------------ | ------------------ |
| **极速构建** | rsbuild-demo | 构建时间 < 0.11s   |
| **快速开发** | vite-demo    | 冷启动 < 100ms     |
| **生产稳定** | webpack-demo | 成熟可靠，插件丰富 |
| **零配置**   | basic-demo   | 无需构建工具       |

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd fukict/demos
```

### 2. 安装依赖

```bash
# 在项目根目录安装所有依赖
pnpm install
```

### 3. 选择并运行 Demo

```bash
# Basic Demo - 无需编译
cd basic-demo
npx serve .

# Vite Demo - 现代开发
cd vite-demo
pnpm run dev

# Rsbuild Demo - 极速构建
cd rsbuild-demo
pnpm run dev

# Webpack Demo - 成熟方案
cd webpack-demo
pnpm run dev

# Babel Transform Demo - 转换测试
cd babel-transform-demo
pnpm run test
```

## 🛠️ 核心技术栈

### 共同特性

- **TypeScript**: 完整的类型支持
- **JSX**: 现代组件语法
- **事件分离**: `on:event` 语法自动转换
- **无虚拟 DOM**: 直接 DOM 操作，性能优异
- **函数式组件**: 简洁的组件定义方式

### API 对比

```javascript
// 核心 API - hyperscript
hyperscript(type, props, events, ...children)

// 示例：创建一个按钮
hyperscript('button',
  { class: 'btn', id: 'submit' },      // props
  { click: handleClick },              // events
  'Click Me'                           // children
)

// JSX 语法 (需要构建工具)
<button
  className="btn"
  id="submit"
  on:click={handleClick}
>
  Click Me
</button>
```

## 📊 性能对比

| Demo             | 冷启动  | 热重载 | 构建时间 | 包大小 | 配置复杂度 |
| ---------------- | ------- | ------ | -------- | ------ | ---------- |
| **basic-demo**   | 即时    | N/A    | N/A      | 6KB    | 无         |
| **rsbuild-demo** | < 100ms | < 50ms | 0.11s    | 10.7KB | 极简       |
| **vite-demo**    | < 100ms | < 50ms | 0.85s    | 12.3KB | 简单       |
| **webpack-demo** | 2-3s    | 200ms  | 3.2s     | 15.1KB | 复杂       |

## 🎨 功能演示

### 所有 Demo 共同包含

- ✅ **计数器组件** - 基础状态管理
- ✅ **Todo 应用** - 动态列表操作
- ✅ **事件处理** - 各种 DOM 事件
- ✅ **表单交互** - 输入和提交处理
- ✅ **性能测试** - 大量节点渲染测试

### 特色功能

- **basic-demo**: API 使用示例和调试接口
- **构建工具 demos**: JSX 语法和 TypeScript 支持
- **babel-transform-demo**: 转换过程可视化

## 🔧 开发指南

### 添加新的 Demo

1. 创建新的目录
2. 参考现有 demo 的结构
3. 添加 README.md 文档
4. 在此文件中更新说明

### 调试技巧

```javascript
// 在浏览器控制台中调试
window.fukictDemo.appState; // 查看状态
window.fukictDemo.updateState(); // 更新状态
window.fukictDemo.hyperscript; // 使用 API
```

## 🔗 相关资源

- [Fukict 核心库](../packages/core/)
- [Babel 插件](../packages/babel-plugin/)
- [项目主文档](../README.md)

## 🤝 贡献指南

欢迎贡献新的 demo 或改进现有示例：

1. Fork 项目
2. 创建新的 demo 目录
3. 添加完整的文档和示例代码
4. 提交 Pull Request

## �� 许可证

MIT License
