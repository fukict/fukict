# 构建配置

## Vite 配置

```ts
// vite.config.ts
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukict()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

## TypeScript

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 环境变量

```bash
# .env
VITE_API_URL=https://api.example.com
```

```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

## 构建

```bash
pnpm build
pnpm preview
```

## 构建优化

```ts
export default defineConfig({
  plugins: [fukict()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@fukict/basic'],
        },
      },
    },
  },
});
```
