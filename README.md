# Vanilla DOM

一个专注于性能场景的轻量级 DOM 渲染库。

## 特点

- **轻量**：< 10KB 压缩后体积
- **高性能**：适合需要频繁 DOM 操作的场景
- **编译时优化**：JSX 编译期转换，减少运行时开销
- **TypeScript**：完整类型支持
- **渐进式**：可以在现有项目中局部使用

## 快速开始

### 安装

```bash
npm install @vanilla-dom/core @vanilla-dom/babel-plugin
# 或
pnpm add @vanilla-dom/core @vanilla-dom/babel-plugin
```

### 基础用法

```jsx
import { render } from '@vanilla-dom/core';

function App() {
  return (
    <div class="container">
      <h1>Hello Vanilla DOM</h1>
      <button onClick={() => console.log('clicked')}>点击我</button>
    </div>
  );
}

render(<App />, document.getElementById('app'));
```

### 基础配置

**Vite 项目**：

```js
// vite.config.js
import * as babel from '@babel/core';

import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'preserve', // 让 babel 处理 JSX
  },
  plugins: [
    {
      name: 'vanilla-dom-babel',
      async transform(code, id) {
        if (!/\.(tsx?|jsx?)$/.test(id)) return;
        if (id.includes('node_modules')) return;
        if (!/<[A-Za-z]/.test(code)) return;

        const result = await babel.transformAsync(code, {
          filename: id,
          plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
          sourceMaps: true,
        });

        return {
          code: result?.code || code,
          map: result?.map,
        };
      },
    },
  ],
});
```

**Webpack 项目**：

```js
// .babelrc.js
module.exports = {
  plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
        onlyRemoveTypeImports: true,
      },
    ],
  ],
};
```

**使用 Widget 组件**：

```bash
npm install @vanilla-dom/widget @vanilla-dom/babel-preset-widget
```

```js
// vite.config.js (使用 preset)
presets: [['@vanilla-dom/babel-preset-widget']];
```

## 适用场景

- **性能敏感**的应用（如数据可视化、游戏UI）
- **大量DOM操作**的场景（如表格、列表渲染）
- **需要精确控制**渲染时机的应用
- **现有项目**中的性能热点优化

## 架构

- `@vanilla-dom/core` - 核心渲染引擎
- `@vanilla-dom/babel-plugin` - JSX 编译插件
- `@vanilla-dom/widget` - 组件抽象（可选）

## 示例

查看 `demos/` 目录中的示例：

- `basic-demo/` - 基础使用
- `vite-demo/` - Vite 集成
- `webpack-demo/` - Webpack 集成

## 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 本地开发 Vite 示例
cd demos/vite-demo && pnpm dev
```

## License

MIT
