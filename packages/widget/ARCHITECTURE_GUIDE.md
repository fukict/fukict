# 🏗️ Vanilla DOM 组件架构指南

## 概述

本指南介绍 Vanilla DOM 生态系统中的组件开发最佳实践，特别是复杂组件的分层架构模式。

## 📂 分层架构

### 适用场景

- **简单组件** (< 100 行): 单文件 `.tsx`
- **复杂组件** (> 100 行): **推荐** Domain + UI 分层架构

### 文件结构

```
components/
├── SimpleComponent.tsx           # 简单组件
└── ComplexComponent/            # 复杂组件，分层架构
    ├── ComplexComponent.domain.ts    # 业务逻辑层
    ├── ComplexComponent.ui.tsx       # UI 层
    └── ComplexComponent.ts           # 统一导出
```

### 🔧 VSCode 编辑器配置

为了让分层文件在侧边栏中嵌套显示，在 VSCode 设置中添加：

```json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.expand": false,
  "explorer.fileNesting.patterns": {
    "*.ts": "${capture}.domain.ts,${capture}.ui.tsx,${capture}.test.ts"
  }
}
```

配置后效果：
```
📁 components/
  📄 TodoList.ts
    📄 TodoList.domain.ts
    📄 TodoList.ui.tsx
  📄 Counter.tsx
```

**配置方法**: 
1. 打开 VSCode 设置 (`Cmd/Ctrl + ,`)
2. 搜索 "file nesting" 
3. 启用相关选项并编辑 patterns

## 🎯 分层架构详解

### Domain 层 (.domain.ts)

**职责**: 数据管理、业务规则、核心逻辑

```typescript
export class TodoListDomain {
  protected todos: TodoItem[] = [];

  addTodo(text: string): boolean {
    // 业务规则验证
    if (!text.trim()) {
      this.notifyError('待办事项不能为空');
      return false;
    }

    // 数据操作
    const newTodo = { id: Date.now().toString(), text: text.trim(), completed: false };
    this.todos.push(newTodo);
    this.notifyDataChange();
    return true;
  }

  // 事件通知机制
  private notifyDataChange(): void {
    this.onTodosChange?.(this.getTodos());
  }
}
```

### UI 层 (.ui.tsx)

**职责**: 界面渲染、用户交互、事件绑定

```typescript
export class TodoListUI extends Widget<TodoListProps> {
  private domain: TodoListDomain;

  constructor(props: TodoListProps) {
    super(props);
    // 组合模式：使用 Domain 层
    this.domain = new TodoListDomain(props);
    this.domain.setTodosChangeHandler(this.handleTodosChange.bind(this));
  }

  private handleAddTodo = (e: Event): void => {
    e.preventDefault();
    const input = this.$('.todo-input');
    if (input?.element) {
      const text = (input.element as HTMLInputElement).value;
      if (this.domain.addTodo(text)) {
        (input.element as HTMLInputElement).value = '';
      }
    }
  };

  render() {
    return (
      <div className="todo-widget">
        <form on:submit={this.handleAddTodo}>
          <input className="todo-input" placeholder="输入待办事项..." />
          <button type="submit">添加</button>
        </form>
        <style>{`/* CSS 样式 */`}</style>
      </div>
    );
  }
}
```

### 统一导出 (.ts)

```typescript
// 导出业务逻辑层
export { TodoListDomain } from './TodoList.domain';

// 导出 UI 层  
export { TodoListUI } from './TodoList.ui';

// 导出类型定义
export type { TodoItem, TodoListProps } from './TodoList.domain';

// 默认导出 UI 组件
export { TodoListUI as TodoList } from './TodoList.ui';
```

## 📋 开发指南

### 设计原则

- **单一职责**: Domain 管业务，UI 管界面
- **组合优于继承**: UI 层组合使用 Domain
- **可测试性**: 业务逻辑独立，便于单元测试

### 命名约定

- Domain 文件: `ComponentName.domain.ts`
- UI 文件: `ComponentName.ui.tsx`  
- 导出文件: `ComponentName.ts`

### 使用场景

```jsx
// 静态组件 → JSX 渲染
<TodoList maxItems={20} />

// 动态组件 → 直接实例化
const modal = new ModalWidget({ title: '确认' });
modal.mount(document.body);
modal.unmount(); // 使用完毕后销毁
```

### 最佳实践

#### 1. 错误处理
- **Domain 层**：统一错误处理和用户通知
- **UI 层**：通过回调响应错误状态，更新界面提示

#### 2. 状态管理
- **所有状态变更**：通过 Domain 层方法，保证数据一致性
- **状态同步**：使用事件回调通知 UI 层更新

#### 3. 事件通信
- **UI → Domain**：直接调用 Domain 方法
- **Domain → UI**：使用回调函数，避免直接 DOM 操作
- **用户交互**：在 JSX 中使用 `on:event` 绑定

#### 4. 样式管理
- **CSS 定义**：在 UI 层的 `<style>` 标签中
- **动态样式**：通过 className 切换，避免直接修改 style

#### 5. 类型安全
- **严格接口**：定义完整的 Props、State 类型
- **泛型支持**：Widget<Props> 确保类型正确传递

### 性能考虑

- **Domain 层**：避免频繁 DOM 操作，专注数据处理
- **UI 层**：使用批量更新减少重绘
- **事件处理**：合理使用防抖/节流，及时清理监听器
- **内存管理**：及时清理定时器、监听器、大对象引用

### 内存管理

两种组件类型在销毁时有不同的处理方式：

- **Class 组件**: 提供 `onUnmounting()` 钩子，销毁前手动清空可能存在内存泄漏的变量存储（定时器、监听器、大对象引用等）
- **Function 组件**: 不提供销毁钩子，避免内部定义可能导致内存泄漏的变量；事件监听直接在 JSX 上处理，随 DOM 销毁自动清理

#### Class 组件 - 手动清理

```typescript
  export class TimerWidget extends Widget<TimerProps> {
    private timer: NodeJS.Timeout | null = null;
    private domain: TimerDomain;
    private eventListeners: Array<() => void> = [];
    private heavyData: Map<string, any> | null = null;

  constructor(props: TimerProps) {
    super(props);
    this.domain = new TimerDomain(props);
    this.timer = setInterval(() => this.domain.tick(), 1000);
  }

  protected onUnmounting(): void {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // 清理事件监听器
    if (this.eventListeners) {
      this.eventListeners.forEach(cleanup => cleanup());
      this.eventListeners = [];
    }
    
    // 清理大对象引用
    this.heavyData = null;
    
    // 清理 Domain 层引用
    this.domain.destroy?.();
    this.domain = null as any;
  }

  render() {
    return (
      <div>
        <button on:click={this.handleClick}>
          {this.domain.getTime()}
        </button>
      </div>
    );
  }
}
```

#### Function 组件 - 避免复杂状态

Function 组件不提供销毁钩子，因此要避免创建需要手动清理的资源：

```typescript
// ✅ 推荐：轻量级，事件在 JSX 中处理
const SimpleButton = createWidget<{ label: string; onClick: () => void }>(
  ({ label, onClick }) => (
    <button on:click={onClick}>
      {label}
    </button>
  )
);

// ✅ 推荐：接收外部状态，不内部维护
const TodoItem = createWidget<{ todo: TodoItem; onToggle: (id: string) => void }>(
  ({ todo, onToggle }) => (
    <li className={todo.completed ? 'completed' : ''}>
      <input 
        type="checkbox" 
        checked={todo.completed}
        on:change={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
    </li>
  )
);

// ❌ 避免：无法清理的复杂状态
const ComplexWidget = createWidget<Props>(props => {
  const timer = setInterval(() => {}, 1000); // ❌ 无法清理，会内存泄漏
  const heavyData = new Map(); // ❌ 可能泄漏
  const listeners = []; // ❌ 无法清理事件监听器
  
  return <div>...</div>;
});
```

**Function 组件核心原则**：
- ✅ 纯展示逻辑，无状态管理
- ✅ 事件处理通过 props 传入
- ✅ 事件绑定直接在 JSX 上，自动清理
- ❌ 不创建定时器、监听器、大对象

### 迁移指南

#### 从单文件组件重构为分层架构

```typescript
// 重构前：单文件组件
export class TodoList extends Widget {
  private todos: TodoItem[] = [];

  addTodo(text: string) {
    // ❌ 业务逻辑与 UI 更新混合
    this.todos.push({ id: Date.now(), text, completed: false });
    this.updateUI(); // 直接操作 DOM
  }

  render() {
    return <div>{/* JSX */}</div>;
  }
}

// 重构后：分层架构
// TodoList.domain.ts - 纯业务逻辑
export class TodoListDomain {
  private todos: TodoItem[] = [];

  addTodo(text: string): boolean {
    // ✅ 纯业务逻辑，数据验证
    if (!text.trim()) return false;
    
    this.todos.push({ id: Date.now(), text, completed: false });
    this.notifyDataChange(); // 通知 UI 层
    return true;
  }
}

// TodoList.ui.tsx - 纯 UI 逻辑
export class TodoListUI extends Widget<TodoListProps> {
  private domain: TodoListDomain;

  constructor(props: TodoListProps) {
    super(props);
    this.domain = new TodoListDomain(props);
    // ✅ 通过回调响应数据变化
    this.domain.setTodosChangeHandler(this.handleDataChange.bind(this));
  }
}
```

#### 重构步骤

1. **提取业务逻辑** → 创建 Domain 类
2. **保留 UI 逻辑** → 改造为组合 Domain
3. **重构事件处理** → 使用回调模式
4. **创建统一导出** → 便于使用

## 📚 最佳实践总结

### ✅ 优势

- **可维护性**: 职责分离，代码清晰
- **可测试性**: 业务逻辑独立测试  
- **可复用性**: Domain 层可在不同 UI 间复用
- **团队协作**: 前端/后端逻辑分工明确

### 🎯 关键要点

1. **Domain 层**: 纯 TypeScript，无 JSX，专注业务逻辑
2. **UI 层**: 继承 Widget，组合 Domain，专注界面交互
3. **事件处理**: 类组件用 `on:event`，函数组件保持简单
4. **内存管理**: 类组件在 `onUnmounting` 中清理，函数组件避免复杂状态
5. **文件组织**: 使用 VSCode 嵌套显示，提升开发体验

对于复杂组件（> 100 行代码），强烈推荐采用这种分层架构模式。
