# Fukict 开发指南

轻量级前端框架，手动更新 + 直接 DOM 操作，性能优先。

## 包结构

```
@fukict/basic        核心库：组件、渲染、diff
@fukict/router       路由：SPA 路由管理
@fukict/babel-preset JSX 编译：构建时转换
@fukict/vite-plugin  Vite 集成：自动应用 babel-preset
```

## 快速开始

### 1. 创建项目

```bash
pnpm create vite my-app --template vanilla-ts
cd my-app
pnpm add @fukict/basic @fukict/vite-plugin
```

### 2. 配置 Vite

```ts
// vite.config.ts
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukict()],
});
```

### 3. 编写组件

```tsx
// src/App.tsx
import { Fukict, attach } from '@fukict/basic';

class App extends Fukict {
  count = 0;

  render() {
    return (
      <div>
        <h1>Count: {this.count}</h1>
        <button on:click={() => this.increment()}>+1</button>
      </div>
    );
  }

  increment() {
    this.count++;
    this.update(); // 手动触发更新
  }
}

attach(<App />, document.getElementById('app')!);
```

## 文档导航

| 文档                                  | 内容                     |
| ------------------------------------- | ------------------------ |
| [01-setup](./01-setup.md)             | 项目搭建、配置、目录结构 |
| [02-components](./02-components.md)   | 组件开发、生命周期、通信 |
| [03-performance](./03-performance.md) | 脱围模式、性能优化       |
| [04-lists](./04-lists.md)             | 列表渲染、虚拟滚动       |
| [05-state](./05-state.md)             | 状态管理、Store 模式     |
| [06-routing](./06-routing.md)         | 路由配置、导航守卫       |
| [07-build](./07-build.md)             | 构建配置、发布部署       |

## 核心特点

- **手动更新**：调用 `this.update()` 触发渲染
- **脱围模式**：`fukict:detach` 跳过自动更新
- **直接 DOM**：复杂场景直接操作 DOM
- **TypeScript**：完整类型支持
