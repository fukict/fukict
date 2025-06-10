import { Widget } from '@vanilla-dom/widget';

/**
 * TodoList 业务逻辑层
 * 继承 Widget，提供业务逻辑和基础的生命周期管理
 */

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoListProps {
  title?: string;
  initialTodos?: TodoItem[];
  maxItems?: number;
}

export interface TodoListStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

/**
 * TodoList 业务逻辑核心类
 * 继承 Widget，专注于数据管理和业务规则
 */
export class TodoListDomain extends Widget<TodoListProps> {
  protected todos: TodoItem[] = [];
  protected nextId = 1;
  protected maxItems: number;
  protected currentError?: string;

  constructor(props: TodoListProps) {
    super(props);
    this.maxItems = props.maxItems || 50;

    // 初始化数据
    if (props.initialTodos) {
      this.todos = [...props.initialTodos];
      this.nextId = Math.max(...this.todos.map(t => parseInt(t.id))) + 1;
    }
  }

  // === 核心业务方法 ===

  /**
   * 添加新待办事项
   */
  addTodo(text: string): boolean {
    const trimmedText = text.trim();

    // 业务规则验证
    if (!trimmedText) {
      this.setError('待办事项不能为空');
      return false;
    }

    if (this.todos.length >= this.maxItems) {
      this.setError(`最多只能添加 ${this.maxItems} 个待办事项`);
      return false;
    }

    if (this.todos.some(todo => todo.text === trimmedText)) {
      this.setError('该待办事项已存在');
      return false;
    }

    // 创建新项目
    const newTodo: TodoItem = {
      id: this.nextId.toString(),
      text: trimmedText,
      completed: false,
    };

    this.todos.push(newTodo);
    this.nextId++;

    this.clearError();
    this.onDataChanged();
    return true;
  }

  /**
   * 删除待办事项
   */
  removeTodo(id: string): boolean {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      this.setError('待办事项不存在');
      return false;
    }

    this.todos.splice(index, 1);
    this.clearError();
    this.onDataChanged();
    return true;
  }

  /**
   * 切换完成状态
   */
  toggleTodo(id: string): boolean {
    const todo = this.todos.find(todo => todo.id === id);
    if (!todo) {
      this.setError('待办事项不存在');
      return false;
    }

    todo.completed = !todo.completed;
    this.clearError();
    this.onDataChanged();
    return true;
  }

  /**
   * 清除错误信息
   */
  clearError(): void {
    if (this.currentError) {
      this.currentError = undefined;
      this.onErrorChanged();
    }
  }

  // === 数据获取方法 ===

  /**
   * 获取所有待办事项
   */
  getTodos(): TodoItem[] {
    return [...this.todos];
  }

  /**
   * 获取统计信息
   */
  getStats(): TodoListStats {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
    };
  }

  /**
   * 获取当前错误
   */
  getError(): string | undefined {
    return this.currentError;
  }

  // === 生命周期钩子（供子类覆盖） ===

  /**
   * 数据变化时调用，子类可覆盖此方法来更新 UI
   */
  protected onDataChanged(): void {
    // 默认为空，UI 层可以覆盖
  }

  /**
   * 错误状态变化时调用，子类可覆盖此方法来更新 UI
   */
  protected onErrorChanged(): void {
    // 默认为空，UI 层可以覆盖
  }

  // === 私有方法 ===

  private setError(message: string): void {
    this.currentError = message;
    this.onErrorChanged();
  }
} 