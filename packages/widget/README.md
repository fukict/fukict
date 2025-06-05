# @vanilla-dom/widget

组件化抽象层，为 `@vanilla-dom/core` 提供两种编程范式，实现完美的无缝衔接。

## 🎯 核心特性

- **两种编程范式**：简易函数 + 高阶基类，满足不同复杂度需求
- **无缝衔接**：与 `@vanilla-dom/core` 完美集成
- **性能优化**：使用 core 包的精确更新算法
- **类型安全**：完整 TypeScript 支持
- **工具丰富**：提供组件转换和类型检查工具
- **JSX 支持**：完美支持 JSX/TSX 语法，开箱即用

## 📦 安装

```bash
npm install @vanilla-dom/widget @vanilla-dom/core
# 或
pnpm add @vanilla-dom/widget @vanilla-dom/core
```

## 🚀 两种编程范式

### 1. 简易函数范式

适用于 **UI 略微复杂但需要重复渲染** 的场景：

```tsx
import { createWidget } from '@vanilla-dom/widget';

// 创建简易函数组件 - 使用 JSX
const Counter = createWidget((props: { count: number; label: string }) => (
  <div className="counter">
    <span className="label">{props.label}</span>
    <span className="count">{props.count}</span>
    <div className="actions">
      <button onClick={() => console.log('clicked')}>Click me</button>
    </div>
  </div>
));

// 使用
const counter = Counter({ count: 0, label: 'Count' });
counter.mount(document.getElementById('app')!);

// 自动深度监听，变更必定更新
counter.update({ count: 5, label: 'New Count' });

// 销毁
counter.destroy();
```

### 2. 高阶基类范式

适用于 **单个复杂组件封装** 的场景：

```tsx
import { Widget } from '@vanilla-dom/widget';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

class TodoList extends Widget<{ items: TodoItem[]; onToggle: (id: string) => void }> {
  render() {
    return (
      <div className="todo-list">
        <h2>Todo List</h2>
        <ul className="todo-items">
          {this.props.items.map(item => (
            <li 
              key={item.id}
              className={`todo-item ${item.completed ? 'completed' : ''}`}
              onClick={() => this.props.onToggle(item.id)}
              data-id={item.id}
            >
              <span className="text">{item.text}</span>
              {item.completed && <span className="check">✓</span>}
            </li>
          ))}
        </ul>
        <div className="stats">
          Total: {this.props.items.length} | 
          Completed: {this.props.items.filter(i => i.completed).length}
        </div>
      </div>
    );
  }

  // 精细的 DOM 操作
  addHighlight(itemId: string) {
    const item = this.$(`[data-id="${itemId}"]`);
    item?.set('className', item.get('className') + ' highlight');
  }

  clearAllHighlights() {
    const items = this.$$('.todo-item');
    items.batchSet((element, attr, value) => {
      if (attr === 'className') {
        return value.replace(' highlight', '');
      }
      return value;
    });
  }
}

// 使用
const todoList = new TodoList({ 
  items: [
    { id: '1', text: 'Learn Vanilla DOM', completed: true },
    { id: '2', text: 'Build awesome app', completed: false }
  ],
  onToggle: (id) => console.log('Toggle item:', id)
});

todoList.mount(document.getElementById('app')!);
```

## 🔧 DOM 查询 API

高阶基类提供简洁的 DOM 操作接口：

```tsx
class FormWidget extends Widget<{ onSubmit: (data: FormData) => void }> {
  render() {
    return (
      <form className="my-form" onSubmit={this.handleSubmit.bind(this)}>
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            className="form-control"
            placeholder="请输入用户名"
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">提交</button>
      </form>
    );
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    
    // 单个查询
    const submitBtn = this.$('.btn-primary');
    if (submitBtn) {
      submitBtn.set('disabled', true);
      submitBtn.set('textContent', '提交中...');
    }

    // 批量查询和操作
    const inputs = this.$$('input.form-control');
    inputs.batchSet('readonly', true);
    inputs.batchSet({
      className: 'form-control readonly',
      placeholder: '正在处理...'
    });
  }
}
```

## 🔄 无缝衔接工具

### 组件转换

```tsx
import { widgetToComponent, createComponent, embedWidget } from '@vanilla-dom/widget';

// 1. 高阶基类 → 函数组件
const TodoComponent = widgetToComponent(TodoList);

// 2. 简易函数 → 标准组件
const StandardCounter = createComponent((props: { count: number }) => (
  <span className="counter-display">
    Count: {props.count}
  </span>
));

// 3. 混合使用：在函数组件中嵌入高阶基类
const App = createComponent((props: { todos: TodoItem[]; count: number }) => (
  <div className="app">
    <header>
      <h1>My Awesome App</h1>
      <StandardCounter count={props.count} />
    </header>
    
    <main>
      {/* 嵌入高阶基类组件 */}
      {embedWidget(TodoList, { 
        items: props.todos,
        onToggle: (id) => console.log('Toggle:', id)
      })}
    </main>
  </div>
));
```

## 🎨 与 Core 包集成

widget 包重新导出了 core 包的关键功能，提供一站式开发体验：

```tsx
import {
  // Widget 功能
  Widget,
  createWidget,
  
  // Core 功能
  render,
  createDOMFromTree,
  updateDOM,
  createElement,
  
  // 类型
  VNode,
  ComponentFunction,
} from '@vanilla-dom/widget';

// JSX 组件
const MyApp = () => (
  <div className="app">
    <h1>Hello Vanilla DOM!</h1>
    <p>Seamless integration with core package</p>
  </div>
);

// 直接使用 core 功能渲染
render(<MyApp />, { container: document.getElementById('root')! });
```

## ⚡ 性能优化

- **精确更新**：简易函数组件使用 core 包的 `updateDOM` 进行精确 diff
- **深度比较**：自动深度比较 props，避免不必要的重渲染
- **批量操作**：高阶基类支持批量 DOM 操作
- **智能属性处理**：自动区分 DOM 原生属性和 HTML 属性
- **JSX 编译优化**：配合 babel-plugin 实现编译时优化

## 📝 最佳实践

### 选择合适的范式

- **简易函数**：UI 逻辑简单，主要是数据驱动的重复渲染
- **高阶基类**：需要复杂 DOM 操作，生命周期管理，或状态封装

### 组合使用

```tsx
// 主应用使用简易函数
const App = createWidget((props: { user: User; todos: TodoItem[] }) => (
  <div className="app">
    <header className="app-header">
      <h1>Welcome, {props.user.name}!</h1>
    </header>
    
    <main className="app-main">
      {/* 复杂组件使用高阶基类 */}
      {embedWidget(TodoList, { 
        items: props.todos,
        onToggle: (id) => window.app.toggleTodo(id)
      })}
    </main>
  </div>
));
```

### TypeScript 配置

确保 `tsconfig.json` 正确配置 JSX：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@vanilla-dom/core",
    "lib": ["DOM", "ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

## 🔗 相关包

- [`@vanilla-dom/core`](../core) - 核心渲染引擎
- [`@vanilla-dom/babel-plugin`](../babel-plugin) - JSX 编译插件

## 📄 许可证

MIT 