/**
 * TodoList 业务逻辑层
 * 负责数据管理、状态变更、业务规则等
 * 与 UI 无关的纯逻辑代码
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
 * 专注于数据管理和业务规则，不涉及 UI 渲染
 */
export class TodoListDomain {
  protected todos: TodoItem[] = [];
  protected nextId = 1;

  // 业务配置
  protected maxItems: number;

  // 事件回调
  protected onTodosChange?: (todos: TodoItem[]) => void;
  protected onStatsChange?: (stats: TodoListStats) => void;
  protected onError?: (error: string) => void;

  constructor(props: TodoListProps) {
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
      this.notifyError('待办事项不能为空');
      return false;
    }

    if (this.todos.length >= this.maxItems) {
      this.notifyError(`最多只能添加 ${this.maxItems} 个待办事项`);
      return false;
    }

    if (this.todos.some(todo => todo.text === trimmedText)) {
      this.notifyError('该待办事项已存在');
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

    this.notifyDataChange();
    return true;
  }

  /**
   * 删除待办事项
   */
  removeTodo(id: string): boolean {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) {
      this.notifyError('待办事项不存在');
      return false;
    }

    this.todos.splice(index, 1);
    this.notifyDataChange();
    return true;
  }

  /**
   * 切换完成状态
   */
  toggleTodo(id: string): boolean {
    const todo = this.todos.find(todo => todo.id === id);
    if (!todo) {
      this.notifyError('待办事项不存在');
      return false;
    }

    todo.completed = !todo.completed;
    this.notifyDataChange();
    return true;
  }

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

  // === 事件处理方法设置器 ===

  setTodosChangeHandler(handler: (todos: TodoItem[]) => void): void {
    this.onTodosChange = handler;
  }

  setStatsChangeHandler(handler: (stats: TodoListStats) => void): void {
    this.onStatsChange = handler;
  }

  setErrorHandler(handler: (error: string) => void): void {
    this.onError = handler;
  }

  // === 私有通知方法 ===

  private notifyDataChange(): void {
    this.onTodosChange?.(this.getTodos());
    this.onStatsChange?.(this.getStats());
  }

  private notifyError(message: string): void {
    this.onError?.(message);
  }
} 