# 项目搭建

## Vite 项目（推荐）

### 初始化

```bash
pnpm create vite my-app --template vanilla-ts
cd my-app
pnpm install
```

### 安装依赖

```bash
pnpm add @fukict/basic @fukict/vite-plugin @fukict/router
```

### 配置 Vite

```ts
// vite.config.ts
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukict()],
});
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### 入口文件

```tsx
// src/main.tsx
import { attach } from '@fukict/basic';

import App from './App';

attach(<App />, document.getElementById('app')!);
```

## 项目结构

```
src/
├── main.tsx          # 入口
├── App.tsx           # 根组件
├── pages/            # 页面组件
│   ├── Home.tsx
│   └── About.tsx
├── components/       # 通用组件
│   ├── Button.tsx
│   └── Header.tsx
├── stores/           # 状态管理
│   └── appStore.ts
├── router/           # 路由配置
│   └── index.tsx
└── types/            # 类型定义
    └── index.ts
```

## 路由项目

使用 `@fukict/router` 创建 SPA：

```tsx
// src/router/index.tsx
import { Router, RouterView } from '@fukict/router';

const routes = [
  {
    path: '/',
    component: () => import('../pages/Home.tsx'),
  },
  {
    path: '/about',
    component: () => import('../pages/About.tsx'),
  },
];

export const router = new Router({
  mode: 'history',
  routes,
});

// App.tsx
class App extends Fukict {
  render() {
    return <RouterView router={router} />;
  }
}
```

## 开发命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 预览
pnpm preview
```
