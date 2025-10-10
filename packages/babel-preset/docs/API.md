# @fukict/babel-preset API 文档

## 概述

`@fukict/babel-preset` 是 Fukict 的零配置 Babel 预设，提供 JSX 编译和自动组件包裹功能。

## 安装

```bash
pnpm add -D @fukict/babel-preset
```

## 基本使用

### Babel 配置

**babel.config.js**：

```javascript
module.exports = {
  presets: ['@fukict/babel-preset'],
};
```

**或 .babelrc.json**：

```json
{
  "presets": ["@fukict/babel-preset"]
}
```

**或 package.json**：

```json
{
  "babel": {
    "presets": ["@fukict/babel-preset"]
  }
}
```

## 预设行为

### 自动 defineFukict 包裹

**识别规则**：

1. 变量声明 + 函数表达式/箭头函数
2. 函数名首字母大写
3. 返回值包含 JSX
4. 未被 `defineFukict` 包裹
5. 未标记 `@nofukict`

**转换示例**：

```tsx
// 输入
const Greeting = ({ name }) => <div>Hello {name}</div>;

// 输出
import { defineFukict } from '@fukict/basic';
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);
```

### JSX 编译

**基本转换**：

```tsx
// 输入
<div class="container" on:click={handleClick}>
  Hello {name}
</div>;

// 输出
hyperscript(
  'div',
  { class: 'container', 'on:click': handleClick },
  'Hello ',
  name,
);
```

**事件处理**：

```tsx
// 输入
<button on:click={handleClick} on:mouseenter={handleEnter}>
  Click
</button>;

// 输出
hyperscript(
  'button',
  { 'on:click': handleClick, 'on:mouseenter': handleEnter },
  'Click',
);
```

**Fragment**：

```tsx
// 输出
import { Fragment } from '@fukict/basic';

// 输入
<>
  <div>First</div>
  <div>Second</div>
</>;

hyperscript(
  Fragment,
  null,
  hyperscript('div', null, 'First'),
  hyperscript('div', null, 'Second'),
);
```

### 开发模式增强

**自动注入 displayName**（仅 `NODE_ENV=development`）：

```tsx
// 输入
const Greeting = ({ name }) => <div>Hello {name}</div>;

// 输出（开发模式）
import { defineFukict } from '@fukict/basic';
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);
Greeting.displayName = 'Greeting';

// 输出（生产模式）
import { defineFukict } from '@fukict/basic';
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);
// 不注入 displayName
```

## 注释标记

### @nofukict

**用途**：阻止自动 `defineFukict` 包裹

**语法**：

```tsx
/** @nofukict */
const MyFunction = () => <div>test</div>;
```

**使用场景**：

1. **工具函数返回 JSX**：

```tsx
/** @nofukict */
const createIcon = (name: string) => <i class={`icon-${name}`} />;

// 不会被包裹为组件
```

2. **手动控制组件包裹**：

```tsx
/** @nofukict */
const MyComponent = () => <div />;

// 用户自己决定何时包裹
export default defineFukict(MyComponent);
```

## 不支持的场景

### 函数声明

**不会自动包裹**：

```tsx
function Greeting({ name }) {
  return <div>Hello {name}</div>;
}

// 不会转换为 defineFukict
```

**推荐写法**：

```tsx
const Greeting = ({ name }) => {
  return <div>Hello {name}</div>;
};

// ✅ 自动包裹
```

### 小写函数名

**不会识别为组件**：

```tsx
const greeting = ({ name }) => <div>Hello {name}</div>;

// 不会被 defineFukict 包裹（小写开头）
```

### 已包裹的组件

**不会重复包裹**：

```tsx
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);

// 不会再次包裹
```

## 与构建工具集成

### Vite

**vite.config.ts**：

```typescript
import { transformSync } from '@babel/core';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'fukict-babel',
      transform(code, id) {
        if (!/\.(tsx|jsx)$/.test(id)) return;

        const result = transformSync(code, {
          presets: ['@fukict/babel-preset'],
          filename: id,
        });

        return {
          code: result.code,
          map: result.map,
        };
      },
    },
  ],
});
```

### Webpack

**webpack.config.js**：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@fukict/babel-preset'],
          },
        },
      },
    ],
  },
};
```

### Rsbuild

**rsbuild.config.ts**：

```typescript
export default {
  tools: {
    babel: config => {
      config.presets = ['@fukict/babel-preset'];
      return config;
    },
  },
};
```

## TypeScript 配置

**tsconfig.json**：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic"
  }
}
```

**说明**：

- `"jsx": "preserve"` - 保留 JSX 语法，交给 Babel 处理
- `"jsxImportSource": "@fukict/basic"` - 指定 JSX 类型来源

## 环境变量

### NODE_ENV

**开发模式**（`NODE_ENV=development`）：

- 注入 `displayName`
- 更详细的错误提示

**生产模式**（`NODE_ENV=production`）：

- 不注入 `displayName`
- 最小化输出代码

**示例**：

```bash
# 开发模式
NODE_ENV=development babel src -d dist

# 生产模式
NODE_ENV=production babel src -d dist
```

## 配置选项

### development

**类型**：`boolean`
**默认值**：`process.env.NODE_ENV !== 'production'`

控制是否启用开发模式功能（如 displayName 注入）。

**用法**：

```json
{
  "presets": [
    [
      "@fukict/babel-preset",
      {
        "development": true
      }
    ]
  ]
}
```

### typescript

**类型**：`boolean`
**默认值**：`true`

控制是否启用 TypeScript 支持。preset 内置了 `@babel/preset-typescript`，默认自动处理 TypeScript 语法。

**用法**：

```json
{
  "presets": [
    [
      "@fukict/babel-preset",
      {
        "typescript": false // 禁用 TypeScript 支持
      }
    ]
  ]
}
```

**说明**：

- 启用时（默认）：自动处理 `.tsx`/`.ts` 文件中的 TypeScript 语法
- 禁用时：仅处理 JSX 转换，不解析 TypeScript 类型注解
- 如果项目使用纯 JavaScript，可以禁用此选项以获得更快的编译速度

## 调试

### 查看编译输出

**命令行**：

```bash
npx babel src/App.tsx --presets @fukict/babel-preset
```

**输出示例**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const Greeting = defineFukict(({ name }) =>
  hyperscript('div', null, 'Hello ', name),
);

Greeting.displayName = 'Greeting';
```

### 常见问题

#### Q1: 为什么组件没有被自动包裹？

**可能原因**：

1. 函数名小写 → 改为大写开头
2. 使用函数声明 → 改为箭头函数
3. 标记了 `@nofukict` → 移除标记

#### Q2: 为什么提示 "Nested defineFukict"？

**原因**：手动包裹了组件，preset 又自动包裹

**解决方案**：

```tsx
// ❌ 错误
const Greeting = defineFukict(() => <div />);

// ✅ 方案 1：移除手动包裹
const Greeting = () => <div />;

// ✅ 方案 2：添加 @nofukict 标记
/** @nofukict */
const Greeting = defineFukict(() => <div />);
```

#### Q3: JSX 编译报错

**可能原因**：

- Babel 未正确配置
- TypeScript 配置冲突（`jsx: "react"` 等）

**检查**：

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve" // 必须是 preserve
  }
}
```

## 版本兼容性

### Babel 版本

- 要求：`@babel/core` >= 7.0.0

### Node.js 版本

- 要求：Node.js >= 16.0.0

### TypeScript 版本

- 要求：TypeScript >= 5.0.0

## 相关包

- **@fukict/basic** - Fukict 核心运行时（必须安装）
- **@babel/core** - Babel 核心（必须安装）

**安装示例**：

```bash
# 运行时依赖
pnpm add @fukict/basic

# 开发依赖
pnpm add -D @fukict/babel-preset @babel/core
```

---

**文档状态**：设计阶段
**最后更新**：2025-10-11
