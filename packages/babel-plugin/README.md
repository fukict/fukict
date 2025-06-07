# @vanilla-dom/babel-plugin

Babel 插件，将 JSX 语法编译为优化的 @vanilla-dom/core VNode 调用，支持编译时优化和组件自动注册。

## Installation

```bash
pnpm install --save-dev @vanilla-dom/babel-plugin
# 推荐使用 pnpm
pnpm add -D @vanilla-dom/babel-plugin
# 或
yarn add -D @vanilla-dom/babel-plugin
```

## Usage

### Basic Setup

Add the plugin to your Babel configuration:

```json
{
  "plugins": ["@vanilla-dom/babel-plugin"]
}
```

### With Options

```json
{
  "plugins": [
    [
      "@vanilla-dom/babel-plugin",
      {
        "importSource": "@vanilla-dom/core",
        "development": false
      }
    ]
  ]
}
```

## Options

- **`importSource`** (string, default: `"@vanilla-dom/core"`): The module to import hyperscript and Fragment from
- **`development`** (boolean, default: `false`): Enable development mode features (reserved for future use)

## Transformation Examples

### Basic Elements

**Input:**

```jsx
<div className="container">Hello World</div>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript('div', { className: 'container' }, null, 'Hello World');
```

### Custom Components

**Input:**

```jsx
<MyComponent prop="value">
  <span>Child</span>
</MyComponent>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript(
  MyComponent,
  { prop: 'value' },
  null,
  hyperscript('span', null, null, 'Child'),
);
```

### Fragments

**Input:**

```jsx
<>
  <div>First</div>
  <div>Second</div>
</>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript(
  Fragment,
  null,
  null,
  hyperscript('div', null, null, 'First'),
  hyperscript('div', null, null, 'Second'),
);
```

### Props and Expressions

**Input:**

```jsx
<button onClick={handleClick} disabled={isDisabled}>
  {buttonText}
</button>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript(
  'button',
  {
    onClick: handleClick,
    disabled: isDisabled,
  },
  null,
  buttonText,
);
```

### Event Syntax (on: prefix)

**Input:**

```jsx
<button on:click={handleClick} className="btn">
  Click me
</button>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript('button', { className: 'btn' }, { click: handleClick }, 'Click me');
```

### Spread Attributes

**Input:**

```jsx
<div {...props} className="extra">
  Content
</div>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript('div', { ...props, className: 'extra' }, null, 'Content');
```

## Integration with Build Tools

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'hyperscript',
    jsxFragment: 'Fragment',
  },
  plugins: [
    // ... other plugins
  ],
  babel: {
    plugins: ['@vanilla-dom/babel-plugin'],
  },
});
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['@vanilla-dom/babel-plugin'],
          },
        },
      },
    ],
  },
};
```

### Rollup

```javascript
// rollup.config.js
import babel from '@rollup/plugin-babel';

export default {
  plugins: [
    babel({
      plugins: ['@vanilla-dom/babel-plugin'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};
```

## TypeScript Support

The plugin works seamlessly with TypeScript. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```

## 🚀 编译时优化特性

### 静态分析优化
- **静态内容识别**：编译时识别静态 HTML 部分
- **动态插值标记**：标记需要运行时更新的位置
- **事件优化**：自动识别可委托的事件处理

### 组件自动注册
- **标志检测**：自动检测 `__COMPONENT_TYPE__` 标志
- **零配置**：无需手动列举组件类型
- **第三方扩展**：支持任何第三方组件编码范式库

### 转换优化
```jsx
// 编译前
<div className="container" onClick={handler}>
  <span>{text}</span>
</div>

// 编译后
hyperscript('div', 
  { className: 'container', onClick: handler }, 
  null,
  hyperscript('span', null, null, text)
);
```

## 🔧 高级配置

### 组件注册支持

```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      '@vanilla-dom/babel-plugin',
      {
        // 启用组件自动注册（推荐）
        enableComponentRegistry: true,
        // 自定义导入源
        importSource: '@vanilla-dom/core',
        // 开发模式调试
        development: process.env.NODE_ENV === 'development'
      }
    ]
  ]
};
```

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建插件
pnpm run build

# 运行测试
pnpm run test

# 开发模式
pnpm run dev
```

## License

MIT
