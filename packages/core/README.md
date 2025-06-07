# @vanilla-dom/core

专注于 Web 客户端渲染的高性能 DOM 库核心包，采用编译时优化 + 运行时渲染的分离架构。

## 🎯 设计理念

- **编译时优化**：通过 Babel 插件将 JSX 转换为优化的 VNode 树结构  
- **运行时轻量**：专注于高效的 DOM 创建与更新，核心包 < 10KB gzipped
- **纯客户端**：专为 Web 浏览器环境优化，无 SSR 包袱
- **类型安全**：完整 TypeScript 支持，`.tsx` 文件开箱即用

## ✨ 核心特性

- 🚀 **高性能渲染**：接近手写 DOM 操作的性能
- 📦 **轻量级体积**：运行时 < 10KB gzipped，编译时优化
- 🔧 **完整工具集**：内置 DOM 操作工具函数和批量更新优化
- 📘 **TypeScript 优先**：全局 JSX 命名空间，无需手动导入
- 🎯 **精确更新**：只更新实际变化的 DOM 节点和属性
- ⚡ **零配置**：`.tsx` 文件无需手动导入即可使用

## 安装

```bash
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

## 🚀 性能优化策略

### 编译时优化
- **静态模板提取**：识别静态 HTML 部分，生成可复用模板
- **动态插值标记**：标记需要运行时更新的节点位置
- **事件优化**：自动识别可委托的事件处理

### 运行时策略
- **模板克隆**：复用静态模板，减少 DOM 创建开销
- **精确更新**：只更新变化的节点属性/内容
- **批量操作**：使用 `batchUpdate` 自动合并 DOM 操作减少重排重绘
- **内存管理**：自动清理事件监听器和引用

### 使用建议
```typescript
// 批量更新优化
batchUpdate(() => {
  setProperty(element, 'className', 'updated');
  appendChild(element, createTextNode('New content'));
  setProperty(element, 'data-id', '123');
});

// 组件缓存 - 相同 props 的组件会复用渲染结果
const Button = props => h('button', props, props.children);
```

## 浏览器支持

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## 🔗 相关包

- [`@vanilla-dom/babel-plugin`](../babel-plugin) - JSX 编译插件，将 JSX 转换为优化的 VNode 调用
- [`@vanilla-dom/widget`](../widget) - 组件开发编码范式，提供 Widget 类和 createWidget 函数
- [`@vanilla-dom/babel-preset-widget`](../babel-preset-widget) - Widget 开发预设，开箱即用的 Babel 配置

## 🏗️ 架构说明

`@vanilla-dom/core` 是整个生态系统的基础设施：

- **底层渲染引擎**：处理 VNode 到真实 DOM 的转换
- **DOM 工具集**：提供高性能的 DOM 操作函数
- **类型支持**：全局 JSX 命名空间和完整 TypeScript 类型
- **组件注册机制**：支持第三方组件编码范式库扩展

## 🎯 使用场景

### 基础层独立使用
`@vanilla-dom/core` 可以与 `@vanilla-dom/babel-plugin` 配合，提供完整的基础 JSX 支持：

```bash
pnpm add @vanilla-dom/core @vanilla-dom/babel-plugin
```

**适合场景**：
- 轻量级应用，需要最小运行时开销
- 性能敏感场景，希望手动控制渲染逻辑
- 作为其他组件库的底层基础设施

### 与增强层配合使用
也可以与 `@vanilla-dom/widget` 配合，获得更好的开发体验：

```bash
pnpm add @vanilla-dom/widget @vanilla-dom/babel-preset-widget
```

**适合场景**：复杂应用、团队开发、需要结构化组件模式

## 许可证

MIT
