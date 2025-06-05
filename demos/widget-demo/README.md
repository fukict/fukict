# Vanilla DOM Widget Demo

这个 demo 展示了 `@vanilla-dom/widget` 包的简易函数范式功能，使用 Vite 作为构建工具。

## 🎯 功能特性

### 简易函数范式演示
- 展示如何使用 `createWidget` 创建函数组件
- 演示 JSX 语法在 vanilla-dom 中的使用
- 响应式数据渲染和模板语法
- 与 core 包无缝衔接

### UI 组件示例
- **计数器组件**: 展示基础交互功能
- **Todo List**: 演示列表渲染和状态管理
- **表单处理**: 展示表单元素和验证功能

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000 查看 demo。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

### 类型检查

```bash
pnpm type-check
```

## 📁 项目结构

```
widget-demo/
├── src/
│   ├── App.tsx              # 主应用组件，包含所有示例
│   └── main.ts              # 入口文件
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置
```

## 🎨 核心技术

- **Vite**: 快速的前端构建工具
- **TypeScript**: 类型安全的 JavaScript
- **@vanilla-dom/widget**: 组件化抽象层
- **@vanilla-dom/core**: 核心渲染引擎
- **JSX**: 声明式 UI 语法

## 📝 代码示例

### 简易函数组件

```tsx
import { createWidget } from '@vanilla-dom/widget';

const App = createWidget(() => (
  <div className="app">
    <h1>Hello Vanilla DOM!</h1>
    <p>这是一个简易函数组件示例</p>
  </div>
));

// 使用组件
const app = App({});
(app as any).mount(document.getElementById('root')!);
```

### 动态数据渲染

```tsx
const todos = [
  { id: '1', text: '学习 Vanilla DOM', completed: true },
  { id: '2', text: '构建 Widget Demo', completed: false }
];

const TodoApp = createWidget(() => (
  <div className="todo-app">
    <ul>
      {todos.map(todo => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          {todo.text}
        </li>
      ))}
    </ul>
  </div>
));
```

### JSX 和样式

```tsx
const StyledComponent = createWidget(() => (
  <div className="container">
    <h2>样式示例</h2>
    <button className="btn btn-primary">点击我</button>
    
    <style jsx>{`
      .container {
        padding: 20px;
        background: white;
        border-radius: 8px;
      }
      
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .btn-primary {
        background: #007bff;
        color: white;
      }
    `}</style>
  </div>
));
```

## 🔧 配置说明

### Vite 配置

```ts
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',  // 使用 hyperscript 函数
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from '@vanilla-dom/core'`,
  },
});
```

**重要提示**: 必须使用 `h` 作为 JSX 工厂函数，而不是 `createElement`，因为 `h` 是 vanilla-dom 的正确 JSX 编译函数。

### TypeScript 配置

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@vanilla-dom/core"
  }
}
```

## 🎯 学习要点

1. **简易函数范式**: 理解如何使用 `createWidget` 创建组件
2. **JSX 语法**: 掌握 JSX 在 vanilla-dom 中的使用方法
3. **数据渲染**: 学习动态数据和列表渲染
4. **样式处理**: 了解如何在组件中使用样式
5. **类型安全**: 体验完整的 TypeScript 支持
6. **配置要点**: 正确配置 JSX 工厂函数以避免 DOM 属性冲突

## ⚠️ 常见问题

### JSX 配置错误
如果遇到 `Cannot set property children of #<Element> which has only a getter` 错误，请确保：

1. 使用 `h` 作为 JSX 工厂函数，而不是 `createElement`
2. 正确导入 `import { h, Fragment } from '@vanilla-dom/core'`
3. TypeScript 配置使用 `jsxImportSource: "@vanilla-dom/core"`

## 🔗 相关链接

- [Vanilla DOM 核心包](../../packages/core)
- [Widget 包文档](../../packages/widget)
- [Vite 官方文档](https://vitejs.dev/)

## 📄 许可证

MIT 