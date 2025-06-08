# 🏗️ Vanilla DOM 组件架构指南

## 概述

本指南介绍了在 Vanilla DOM 生态系统中组件开发的最佳实践，特别是针对复杂组件的文件分离模式。

## 📂 组件分层架构

### 适用场景

- **简单组件** (< 100 行代码): 单文件 `.tsx` 即可
- **中等复杂度** (100-300 行): 考虑使用 hooks 或 mixin 模式
- **高复杂度** (> 300 行): **强烈推荐** Domain + UI 分层架构

### 文件结构

```
components/
├── SimpleComponent.tsx           # 简单组件，单文件
├── MediumComponent/             # 中等复杂度组件
│   ├── index.tsx
│   └── hooks.ts
└── ComplexComponent/            # 复杂组件，分层架构
    ├── ComponentDomain.ts       # 业务逻辑层
    ├── ComponentUI.tsx          # UI 层
    └── index.ts                 # 统一导出
```

## 🎯 分层架构详解

### Domain 层 (.ts 文件)

**职责:**

- 数据管理和状态维护
- 业务规则验证
- 核心业务逻辑
- 与外部服务交互
- 事件回调管理

**特点:**

- 纯 TypeScript，不包含 JSX
- **不继承 Widget**，纯业务逻辑类
- 通过组合模式被 UI 层使用
- 易于单元测试

**示例:**

```typescript
export class TodoListDomain {
  protected todos: TodoItem[] = [];

  // 业务方法
  addTodo(text: string): boolean {
    // 业务规则验证
    if (!text.trim()) {
      this.notifyError('待办事项不能为空');
      return false;
    }

    // 数据操作
    const newTodo = {
      /* ... */
    };
    this.todos.push(newTodo);
    this.notifyDataChange();
    return true;
  }

  // 事件通知
  private notifyDataChange(): void {
    this.onTodosChange?.(this.getTodos());
  }
}
```

### UI 层 (.tsx 文件)

**职责:**

- 界面渲染 (JSX)
- 用户交互处理
- 事件绑定
- DOM 操作
- 样式管理

**特点:**

- 继承自 Widget 基类
- 通过组合模式使用 Domain 层
- 专注于视觉呈现
- 响应业务层的数据变化
- 包含样式定义

**示例:**

```typescript
export class TodoListUI extends Widget<TodoListProps> {
  private domain: TodoListDomain;

  constructor(props: TodoListProps) {
    super(props);

    // 组合：创建业务逻辑实例
    this.domain = new TodoListDomain(props);

    // 注册业务层事件
    this.domain.setTodosChangeHandler(this.handleTodosChange.bind(this));
    this.domain.setErrorHandler(this.handleError.bind(this));
  }

  // UI 事件处理
  private handleAddTodo(): void {
    const input = this.$('.todo-input');
    if (input && input.element) {
      const text = (input.element as HTMLInputElement).value;
      if (this.domain.addTodo(text)) {  // 调用业务层方法
        (input.element as HTMLInputElement).value = '';
      }
    }
  }

  // JSX 渲染
  public render() {
    return (
      <div className="todo-widget">
        <input className="todo-input" />
        <button on:click={this.handleAddTodo.bind(this)}>添加</button>
        {/* 样式定义 */}
        <style>{/* CSS */}</style>
      </div>
    );
  }
}
```

### 统一导出 (index.ts)

```typescript
export { ComponentDomain } from './ComponentDomain';
export { ComponentUI } from './ComponentUI';
export type { ComponentProps, ComponentState } from './ComponentDomain';

// 默认导出 UI 组件
export { ComponentUI as Component } from './ComponentUI';
```

## 🔧 组件注册机制

### 自动识别标志

所有继承自 `Widget` 的类会自动获得组件标志：

```typescript
export class MyWidget extends Widget {
  static __COMPONENT_TYPE__ = 'WIDGET_CLASS'; // 自动添加
}

const MyFactory = createWidget(() => {
  /* */
});
MyFactory.__COMPONENT_TYPE__ = 'WIDGET_FUNCTION'; // 自动添加
```

### Babel 插件转换

在 JSX 中使用注册的组件：

```jsx
// 编译前
<TodoList maxItems={20} />;

// 编译后 (babel-plugin 自动转换)
hyperscript(
  TodoList,
  {
    maxItems: 20,
  },
  null,
);
```

组件的识别和实例化由 @vanilla-dom/core 的编码范式注册机制在运行时处理。

## 📋 开发指南

### 1. 设计原则

- **单一职责**: Domain 管业务，UI 管界面
- **组合优于继承**: UI 层组合使用 Domain，而不是继承
- **依赖倒置**: UI 层依赖 Domain 层接口，不依赖具体实现
- **开闭原则**: 易于扩展，无需修改核心逻辑
- **可测试性**: 业务逻辑独立，便于单元测试

### 2. 命名约定

- Domain 文件: `ComponentNameDomain.ts`
- UI 文件: `ComponentNameUI.tsx`
- 导出文件: `index.ts`
- 组件标志: `__COMPONENT_TYPE__` (全大写 + 下划线)

### 3. 使用场景指导

#### 静态/固定组件 → JSX

```jsx
// 适用于布局中的固定组件
<TodoList maxItems={20} />
```

#### 动态组件 → 直接实例化

```typescript
// 适用于运行时动态创建/销毁
const modal = new ModalWidget({ title: '确认' });
modal.mount(document.body);

// 使用完毕后销毁
modal.destroy();
```

### 4. 最佳实践

1. **错误处理**: Domain 层统一错误处理和用户通知
2. **状态管理**: 所有状态变更通过 Domain 层方法
3. **事件通信**: 使用回调函数而非直接 DOM 事件
4. **样式管理**: CSS 定义在 UI 层的 `<style>` 标签中
5. **类型安全**: 严格定义接口，使用 TypeScript

### 5. 性能考虑

- Domain 层避免频繁 DOM 操作
- UI 层使用批量更新减少重绘
- 合理使用事件防抖/节流
- 及时清理事件监听器

## 🚀 迁移指南

### 从单文件组件迁移

1. 创建 Domain 层，移动业务逻辑
2. 保留 UI 层，改为组合 Domain 类
3. 重构事件处理，使用回调模式
4. 创建统一导出文件
5. 更新导入语句

### 示例对比

**迁移前 (单文件):**

```typescript
export class TodoList extends Widget {
  private todos: TodoItem[] = [];

  addTodo(text: string) {
    // 业务逻辑 + UI 更新混合
    this.todos.push({ /* */ });
    this.updateUI();
  }

  render() {
    return <div>{/* JSX */}</div>;
  }
}
```

**迁移后 (分层):**

```typescript
// Domain 层
export class TodoListDomain {
  protected todos: TodoItem[] = [];

  addTodo(text: string): boolean {
    // 纯业务逻辑
    this.todos.push({ /* */ });
    this.notifyDataChange();
    return true;
  }
}

// UI 层
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

  render() {
    return <div>{/* JSX */}</div>;
  }
}
```

## 📚 总结

这种分层架构模式提供了：

✅ **更好的可维护性** - 职责分离，代码清晰  
✅ **更强的可测试性** - 业务逻辑独立测试  
✅ **更高的可复用性** - Domain 层可复用  
✅ **更好的团队协作** - 前端/后端逻辑分工明确  
✅ **更强的类型安全** - 严格的接口定义

对于复杂组件，强烈建议采用这种分层架构模式。
