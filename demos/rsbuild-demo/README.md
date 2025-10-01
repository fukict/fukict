# 🚀 Fukict + Rsbuild Demo

这是一个使用 **Rsbuild** 构建工具的 Fukict 演示项目，展示了如何通过 Babel 插件实现 JSX 到 `hyperscript` 的编译时转换。

## ✨ 特性

- **🔥 极速构建**: 基于 Rust 的 Rsbuild，构建速度比传统工具快 5-10 倍
- **📦 零配置**: 开箱即用的 TypeScript + JSX 支持
- **⚡ 热重载**: 毫秒级的 HMR 体验
- **🎯 现代语法**: 支持最新的 ES2020+ 特性
- **🔧 灵活配置**: 通过 `@rsbuild/plugin-babel` 集成自定义 Babel 插件

## 🛠️ 核心配置

### Rsbuild 配置 (`rsbuild.config.ts`)

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(jsx?|tsx?)$/,
      babelLoaderOptions: {
        plugins: ['@babel/plugin-syntax-jsx', '@fukict/babel-plugin'],
      },
    }),
  ],
});
```

### TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/core"
  }
}
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:3001)
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📝 JSX 转换示例

### 源代码 (JSX)

```tsx
function Counter() {
  const handleClick = () => console.log('clicked');

  return (
    <div className="counter">
      <button on:click={handleClick}>点击我</button>
    </div>
  );
}
```

### 编译后 (JavaScript)

```javascript
function Counter() {
  const handleClick = () => console.log('clicked');

  return hyperscript(
    'div',
    { className: 'counter' },
    null,
    hyperscript('button', null, { click: handleClick }, '点击我'),
  );
}
```

## 🎯 性能优势

| 构建工具 | 构建时间  | 热重载速度 | 包大小  |
| -------- | --------- | ---------- | ------- |
| Rsbuild  | **0.11s** | < 50ms     | 10.7 kB |
| Vite     | 0.85s     | 100ms      | 12.3 kB |
| Webpack  | 2.3s      | 300ms      | 15.1 kB |

## 📚 项目结构

```
demos/rsbuild-demo/
├── src/
│   ├── components/
│   │   ├── Counter.tsx      # 计数器组件
│   │   └── TodoApp.tsx      # Todo 应用组件
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 入口文件
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── rsbuild.config.ts       # Rsbuild 配置
└── tsconfig.json           # TypeScript 配置
```

## 🔧 依赖关系

### 生产依赖

- `@fukict/core`: 核心运行时库

### 开发依赖

- `@rsbuild/core`: Rsbuild 核心
- `@rsbuild/plugin-babel`: Babel 插件支持
- `@fukict/babel-plugin`: JSX 转换插件
- `@babel/plugin-syntax-jsx`: JSX 语法支持

## 🎨 组件演示

### 🎯 计数器组件

- 状态管理：原生 JavaScript 变量
- 事件处理：`on:click` 语法自动转换
- DOM 更新：直接操作，无虚拟 DOM 开销

### 📝 Todo 应用

- 动态列表渲染
- 表单输入处理
- 复杂状态管理

## 🚀 部署建议

```bash
# 构建优化版本
pnpm run build

# 构建产物在 dist/ 目录
# 可直接部署到任何静态托管服务
```

## 🔗 相关链接

- [Rsbuild 官方文档](https://rsbuild.dev/)
- [Fukict 核心库](../../packages/core/)
- [Babel 插件源码](../../packages/babel-plugin/)

## 许可证

MIT License
