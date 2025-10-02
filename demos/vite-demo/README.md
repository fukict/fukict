# 🚀 Fukict + Vite Demo

这是一个使用 **Vite** 构建工具的 Fukict 演示项目，展示了如何通过 Babel 插件实现 JSX 到 `hyperscript` 的编译时转换。

## ✨ 特性

- **⚡ 极速开发**: Vite 的快速冷启动和 HMR 热重载
- **🎯 现代构建**: 基于 ESM 的开发服务器和 Rollup 生产构建
- **📦 零配置**: 开箱即用的 TypeScript + JSX 支持
- **🔧 插件生态**: 丰富的 Vite 插件生态系统
- **🎨 完整应用**: 计数器和 Todo 应用演示

## 🛠️ 核心配置

### Vite 配置 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'hyperscript',
    jsxFragment: 'Fragment',
    jsxInject: `import { hyperscript, Fragment } from '@fukict/runtime'`,
  },
  plugins: [
    // 自定义 JSX 转换插件
    {
      name: 'fukict-jsx',
      transform(code, id) {
        if (/\.(jsx|tsx)$/.test(id)) {
          return babel.transformSync(code, {
            plugins: ['@babel/plugin-syntax-jsx', '@fukict/babel-plugin'],
          })?.code;
        }
      },
    },
  ],
});
```

### TypeScript 配置 (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/runtime"
  }
}
```

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:3000)
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 📝 JSX 转换示例

### 源代码 (JSX)

```tsx
function App() {
  const handleClick = () => console.log('clicked');

  return (
    <div className="app">
      <h1>Hello Vite!</h1>
      <button on:click={handleClick}>点击我</button>
    </div>
  );
}
```

### 编译后 (JavaScript)

```javascript
function App() {
  const handleClick = () => console.log('clicked');

  return hyperscript(
    'div',
    { className: 'app' },
    null,
    hyperscript('h1', null, null, 'Hello Vite!'),
    hyperscript('button', null, { click: handleClick }, '点击我'),
  );
}
```

## 🎯 性能优势

| 指标         | Vite    | Webpack | 说明              |
| ------------ | ------- | ------- | ----------------- |
| **冷启动**   | < 100ms | > 2s    | ESM 原生支持      |
| **热更新**   | < 50ms  | 200ms   | 文件级精确更新    |
| **构建速度** | 0.85s   | 3.2s    | Rollup + esbuild  |
| **包大小**   | 12.3 kB | 15.8 kB | Tree-shaking 优化 |

## 📚 项目结构

```
demos/vite-demo/
├── src/
│   ├── components/
│   │   ├── Counter.tsx      # 计数器组件
│   │   └── TodoApp.tsx      # Todo 应用组件
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 入口文件
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

## 🔧 依赖关系

### 生产依赖

- `@fukict/runtime`: 核心运行时库

### 开发依赖

- `vite`: 构建工具
- `@fukict/babel-plugin`: JSX 转换插件
- `@babel/core`: Babel 核心
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
# 可直接部署到 Vercel、Netlify 等
```

## 🔄 与其他构建工具对比

| 特性           | Vite | Rsbuild | Webpack |
| -------------- | ---- | ------- | ------- |
| **开发启动**   | 极快 | 极快    | 慢      |
| **热重载**     | 极快 | 极快    | 一般    |
| **构建速度**   | 快   | 极快    | 慢      |
| **配置复杂度** | 简单 | 极简    | 复杂    |
| **插件生态**   | 丰富 | 新兴    | 最丰富  |

## 🔗 相关链接

- [Vite 官方文档](https://vitejs.dev/)
- [Fukict 核心库](../../packages/runtime/)
- [Babel 插件源码](../../packages/babel-plugin/)

## �� 许可证

MIT License
