# Widget Demo

这是 `@vanilla-dom/widget` 包的官方演示项目，展示了组件化开发的最佳实践。

## 🎯 项目特色

### 完整的组件示例

- **SimpleGreeting** - 基础 Widget 类组件
- **Counter** - 带状态管理的交互组件
- **TodoList** - 复杂分层架构组件（Domain + UI）
- **函数组件** - 使用 `createWidget` 创建的轻量组件

### 分层架构演示

项目中的 `TodoList` 组件采用了推荐的分层架构模式：

- `TodoListDomain.ts` - 纯业务逻辑层，不包含 UI
- `TodoListUI.tsx` - UI 层，继承 Widget，组合使用 Domain
- `index.ts` - 统一导出，提供清晰的 API

### 现代化开发配置

- **Vite** - 快速的开发服务器和构建工具
- **Babel** - 使用 `@vanilla-dom/babel-plugin` 处理 JSX 和组件注册
- **TypeScript** - 完整的类型支持

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发服务器

```bash
pnpm run dev
```

### 构建生产版本

```bash
pnpm run build
```

### 预览构建结果

```bash
pnpm run preview
```

## 📁 项目结构

```
widget-demo/
├── src/
│   ├── components/
│   │   ├── Counter.tsx              # 简单交互组件
│   │   ├── SimpleGreeting.tsx       # 基础展示组件
│   │   └── TodoList/               # 分层架构组件
│   │       ├── TodoListDomain.ts   # 业务逻辑层
│   │       ├── TodoListUI.tsx      # UI 层
│   │       └── index.ts            # 统一导出
│   ├── main.tsx                    # 入口文件
│   └── vite-env.d.ts              # Vite 类型声明
├── vite.config.ts                  # Vite 配置
├── package.json
└── README.md
```

## 🎨 组件特性演示

### 1. 基础 Widget 组件

```typescript
export class SimpleGreeting extends Widget<GreetingProps> {
  public render() {
    return (
      <div className="greeting">
        <h2>👋 {this.props.message}</h2>
        <p>来自 {this.props.from}</p>
  </div>
    );
  }
}
```

### 2. 状态管理

```typescript
export class Counter extends Widget<CounterProps> {
  private count: number;

  private increment() {
    this.count++;
    this.updateDisplay();
  }

  private updateDisplay() {
    const display = this.$('.count-display');
    if (display?.element) {
      display.element.textContent = this.count.toString();
    }
  }
}
```

### 3. 分层架构（推荐模式）

```typescript
// Domain 层 - 纯业务逻辑
export class TodoListDomain {
  private todos: TodoItem[] = [];

  addTodo(text: string): boolean {
    // 业务验证和逻辑
    if (!text.trim()) return false;
    this.todos.push({
      /* ... */
    });
    this.notifyDataChange();
    return true;
  }
}

// UI 层 - 组合使用 Domain
export class TodoListUI extends Widget<TodoListProps> {
  private domain: TodoListDomain;

  constructor(props: TodoListProps) {
    super(props);
    this.domain = new TodoListDomain(props);
  }

  private handleAddTodo() {
    // UI 交互处理
    if (this.domain.addTodo(inputValue)) {
      this.clearInput();
    }
  }
}
```

### 4. 函数组件

```typescript
const SimpleWidget = createWidget((props: { message: string }) => {
  return (
    <div className="simple-widget">
      <h3>🎯 函数组件演示</h3>
      <p>{props.message}</p>
  </div>
  );
});
```

## 🔧 配置说明

### Babel 配置

项目使用内联 Babel 配置（在 `vite.config.ts` 中），包含：

- `@babel/plugin-syntax-jsx` - JSX 语法支持
- `@vanilla-dom/babel-plugin` - 组件注册和转换
- `@babel/preset-typescript` - TypeScript 支持

### Vite 配置特点

- `jsx: 'preserve'` - 让 Babel 处理 JSX，不使用 esbuild
- 自定义 Babel 插件 - 实现组件自动注册
- 扩展名解析 - 支持 `.tsx` 自动解析

## 📖 学习资源

- [组件架构指南](../../packages/widget/ARCHITECTURE_GUIDE.md) - 分层架构详细说明
- [Widget API 文档](../../packages/widget/README.md) - 完整 API 参考
- [Babel Plugin 指南](../../packages/babel-plugin/README.md) - JSX 编译配置

## 🚧 开发指南

### 添加新组件

1. 在 `src/components/` 下创建组件文件
2. 简单组件直接使用 `.tsx` 文件
3. 复杂组件创建目录，使用分层架构
4. 在 `main.tsx` 中引入和使用

### 使用分层架构

1. 创建 `ComponentDomain.ts` - 纯业务逻辑，不继承 Widget
2. 创建 `ComponentUI.tsx` - 继承 Widget，组合使用 Domain
3. 创建 `index.ts` - 统一导出

### 组件测试

- Domain 层：纯逻辑测试，易于单元测试
- UI 层：集成测试，验证交互逻辑
- 端到端：完整功能验证

## ⚡ 性能优化

- **按需更新** - 只更新变化的 DOM 节点
- **事件委托** - 合理使用事件绑定
- **内存管理** - 及时清理事件监听器
- **分层设计** - 业务逻辑与 UI 分离，便于优化

## 🔗 相关链接

- [Vanilla DOM 项目主页](../../README.md)
- [Core 包文档](../../packages/core/README.md)
- [Babel Plugin 文档](../../packages/babel-plugin/README.md)
- [更多演示项目](../)

---

**🎉 享受 Vanilla DOM 的组件化开发体验！**
