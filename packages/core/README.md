# @vanilla-dom/core

高性能的 Web 客户端渲染库核心包，提供基于 VNode 的 DOM 操作和 JSX 支持。

## 特性

- 🚀 **高性能渲染**：基于 VNode 树的精确 DOM 更新
- 📦 **轻量级**：核心运行时 < 10KB gzipped
- 🔧 **完整工具集**：内置 DOM 操作工具函数
- 📘 **TypeScript 优先**：完整的类型支持
- 🎯 **JSX 支持**：开箱即用的 JSX 类型声明
- ⚡ **零配置**：`.tsx` 文件无需手动导入

## 安装

```bash
npm install @vanilla-dom/core
# 或
pnpm add @vanilla-dom/core
```

## 快速开始

### 基础使用

```typescript
import { h, render } from '@vanilla-dom/core';

// 使用 h 函数创建 VNode
const app = h(
  'div',
  { class: 'app' },
  h('h1', null, 'Hello Vanilla DOM!'),
  h('p', null, 'High-performance client-side rendering'),
);

// 渲染到页面
render(app, {
  container: document.getElementById('root')!,
});
```

### JSX 支持

配置 TypeScript 和 Babel 后，可以直接使用 JSX：

```tsx
// 无需导入，直接使用 JSX
function App() {
  return (
    <div className="app">
      <h1>Hello Vanilla DOM!</h1>
      <p>High-performance client-side rendering</p>
    </div>
  );
}

render(<App />, { container: document.getElementById('root')! });
```

## API 参考

### 渲染引擎

#### `render(vnode, options)`

将 VNode 渲染到指定容器。

```typescript
import { render } from '@vanilla-dom/core';

render(vnode, {
  container: document.getElementById('root')!,
  replace: false, // 是否替换容器内容，默认 false
});
```

#### `createDOMFromTree(vnode)`

将 VNode 树转换为 DOM 元素。

```typescript
import { createDOMFromTree, h } from '@vanilla-dom/core';

const vnode = h('div', { id: 'test' }, 'Hello');
const domElement = createDOMFromTree(vnode);
```

#### `updateDOM(oldVNode, newVNode, domNode)`

基于新旧 VNode 的差异更新 DOM。

```typescript
import { updateDOM } from '@vanilla-dom/core';

updateDOM(oldVNode, newVNode, existingDOMNode);
```

### DOM 工具集

```typescript
import {
  appendChild,
  batchUpdate,
  createElement,
  createTextNode,
  removeNode,
  setProperty,
} from '@vanilla-dom/core';

// 创建元素
const div = createElement('div');

// 批量更新优化
batchUpdate(() => {
  setProperty(div, 'className', 'updated');
  appendChild(div, createTextNode('New content'));
});
```

### VNode 创建

#### `h(type, props, ...children)`

创建 VNode 的辅助函数。

```typescript
import { h } from '@vanilla-dom/core';

const vnode = h(
  'div',
  { class: 'container', onClick: handleClick },
  h('span', null, 'Child 1'),
  'Text child',
  h('span', null, 'Child 2'),
);
```

### 组件支持

```typescript
import type { ComponentFunction } from '@vanilla-dom/core';
import { h } from '@vanilla-dom/core';

const Button: ComponentFunction = props => {
  return h(
    'button',
    {
      class: `btn ${props.variant}`,
      onClick: props.onClick,
    },
    props.children,
  );
};

// 使用组件
const app = h(
  Button,
  {
    variant: 'primary',
    onClick: () => console.log('clicked'),
  },
  'Click me',
);
```

## TypeScript 配置

### tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@vanilla-dom/core",
    "lib": ["DOM", "ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

### Babel 配置 (babel.config.js)

```javascript
module.exports = {
  presets: [['@babel/preset-typescript']],
  plugins: [
    // 需要配合 @vanilla-dom/babel-plugin 使用
    ['@vanilla-dom/babel-plugin'],
  ],
};
```

## 类型定义

```typescript
interface VNode {
  type: string | ComponentFunction;
  props: Record<string, any> | null;
  children: VNodeChild[];
  key?: string | number;
}

type VNodeChild = VNode | string | number | boolean | null | undefined;

type ComponentFunction = (props: Record<string, any>) => VNode;
```

## 性能优化

- **批量更新**：使用 `batchUpdate` 包装多个 DOM 操作
- **组件缓存**：相同 props 的组件会复用渲染结果
- **精确更新**：只更新实际变化的 DOM 节点和属性
- **事件委托**：自动优化事件监听器的绑定

## 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## 相关包

- [`@vanilla-dom/babel-plugin`](../babel-plugin) - JSX 编译插件
- [`@vanilla-dom/widget`](../widget) - 组件化开发抽象

## 许可证

MIT
