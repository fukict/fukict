# 🚀 Fukict + Webpack Demo

这是一个使用 **Webpack** 构建工具的 Fukict 演示项目，展示了如何通过 Babel 插件实现 JSX 到 `hyperscript` 的编译时转换。

## ✨ 特性

- **📦 成熟稳定**: Webpack 5 的成熟构建生态
- **🔧 高度可配置**: 灵活的构建配置和插件系统
- **🎯 生产就绪**: 完整的开发和生产环境配置
- **📱 代码分割**: 支持动态导入和代码分割
- **🔥 热重载**: Webpack Dev Server 的 HMR 支持

## 📚 项目结构

```
webpack-demo/
├── src/
│   ├── main.tsx           # 主入口文件
│   ├── Counter.tsx        # 计数器组件
│   └── types.d.ts        # 类型定义
├── public/
│   └── index.html        # HTML 模板
├── webpack.config.js     # Webpack 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目配置
```

## 🛠️ 核心配置

### Webpack 配置 (webpack.config.js)

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: [
              '@fukict/babel-plugin', // JSX 转换插件
            ],
          },
        },
      },
    ],
  },
};
```

### TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "jsx": "preserve", // 保持 JSX 不被 TypeScript 转换
    "jsxImportSource": "@fukict/core" // 指定 JSX 运行时导入源
  }
}
```

### 依赖配置 (package.json)

```json
{
  "dependencies": {
    "@fukict/core": "workspace:*"
  },
  "devDependencies": {
    "@fukict/babel-plugin": "workspace:*",
    "webpack": "^5.0.0",
    "babel-loader": "^9.0.0"
  }
}
```

## 📝 JSX 转换示例

### 输入 JSX

```jsx
function App() {
  const handleClick = () => alert('clicked');

  return (
    <div className="app">
      <h1>Hello Webpack!</h1>
      <button on:click={handleClick}>Click me</button>
    </div>
  );
}
```

### 输出 JavaScript

```javascript
import { Fragment, hyperscript } from '@fukict/core';

function App() {
  const handleClick = () => alert('clicked');

  return hyperscript(
    'div',
    { className: 'app' },
    null,
    hyperscript('h1', null, null, 'Hello Webpack!'),
    hyperscript('button', null, { click: handleClick }, 'Click me'),
  );
}
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式 (http://localhost:3001)
pnpm run dev
# 或
pnpm start

# 生产构建
pnpm run build
```

## 🎯 性能对比

| 构建工具    | 冷启动  | 热重载 | 构建时间 | 包大小  | 配置复杂度 |
| ----------- | ------- | ------ | -------- | ------- | ---------- |
| **Webpack** | 2-3s    | 200ms  | 3.2s     | 15.1 kB | 复杂       |
| Vite        | < 100ms | < 50ms | 0.85s    | 12.3 kB | 简单       |
| Rsbuild     | < 100ms | < 50ms | 0.11s    | 10.7 kB | 极简       |

## 🎨 演示功能

- ✅ **JSX 语法支持** - 完整的 JSX 转换
- ✅ **TypeScript 支持** - 类型安全开发
- ✅ **Babel 插件自动转换** - JSX → hyperscript
- ✅ **自动导入运行时** - 自动导入 hyperscript 和 Fragment
- ✅ **事件处理分离** - `on:event` 语法转换
- ✅ **组件化开发** - 函数式组件支持
- ✅ **Webpack 热重载** - 开发时热更新
- ✅ **生产构建优化** - 代码压缩和优化

## 🔧 技术栈

- **构建工具**: Webpack 5
- **编译器**: Babel 7
- **语言**: TypeScript 5
- **JSX 运行时**: @fukict/core
- **JSX 编译**: @fukict/babel-plugin

## ⚙️ 工作原理

1. **TypeScript 处理**: 保留 JSX 语法（`jsx: "preserve"`）
2. **Babel 转换**: @fukict/babel-plugin 将 JSX 转换为 `hyperscript()` 调用
3. **运行时注入**: 自动导入 `hyperscript` 和 `Fragment` 从 @fukict/core
4. **事件分离**: `on:event` 语法自动转换为第三个参数的事件对象
5. **DOM 渲染**: @fukict/core 创建真实 DOM 元素并渲染到页面

## 🔄 与其他工具对比

### 适用场景

| 工具        | 适用场景             | 优势                           | 劣势                 |
| ----------- | -------------------- | ------------------------------ | -------------------- |
| **Webpack** | 大型项目、企业级应用 | 成熟稳定、插件丰富、高度可配置 | 配置复杂、启动较慢   |
| Vite        | 中小型项目、现代开发 | 快速启动、简单配置、现代化     | 插件生态相对较新     |
| Rsbuild     | 性能敏感项目         | 极速构建、零配置、基于 Rust    | 新兴工具、生态待完善 |

## 🚀 部署建议

```bash
# 构建优化版本
pnpm run build

# 构建产物在 dist/ 目录
# 可部署到任何静态托管服务
# 如：Nginx、Apache、CDN 等
```

## 🔗 相关链接

- [Webpack 官方文档](https://webpack.js.org/)
- [Fukict 核心库](../../packages/core/)
- [Babel 插件源码](../../packages/babel-plugin/)

## �� 许可证

MIT License
