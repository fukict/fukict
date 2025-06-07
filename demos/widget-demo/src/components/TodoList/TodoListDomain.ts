/**
 * TodoList 业务逻辑层
 * 负责数据管理、状态变更、业务规则等
 * 与 UI 无关的纯逻辑代码
 */

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoListProps {
  initialTodos?: TodoItem[];
  maxItems?: number;
  autoSave?: boolean;
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
  protected autoSave: boolean;

  // 事件回调
  protected onTodosChange?: (todos: TodoItem[]) => void;
  protected onStatsChange?: (stats: TodoListStats) => void;
  protected onError?: (error: string) => void;

  constructor(props: TodoListProps) {
    this.maxItems = props.maxItems || 50;
    this.autoSave = props.autoSave || false;

    // 初始化数据
    if (props.initialTodos) {
      this.todos = [...props.initialTodos];
      this.nextId = Math.max(...this.todos.map(t => parseInt(t.id))) + 1;
    }

    this.loadFromStorage();
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.todos.push(newTodo);
    this.nextId++;

    this.persistChanges();
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
    this.persistChanges();
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
    todo.updatedAt = new Date();

    this.persistChanges();
    this.notifyDataChange();
    return true;
  }

  /**
   * 编辑待办事项
   */
  editTodo(id: string, newText: string): boolean {
    const trimmedText = newText.trim();

    if (!trimmedText) {
      this.notifyError('待办事项不能为空');
      return false;
    }

    const todo = this.todos.find(todo => todo.id === id);
    if (!todo) {
      this.notifyError('待办事项不存在');
      return false;
    }

    // 检查重复
    if (this.todos.some(t => t.id !== id && t.text === trimmedText)) {
      this.notifyError('该待办事项已存在');
      return false;
    }

    todo.text = trimmedText;
    todo.updatedAt = new Date();

    this.persistChanges();
    this.notifyDataChange();
    return true;
  }

  /**
   * 清除所有已完成项目
   */
  clearCompleted(): number {
    const completedCount = this.todos.filter(todo => todo.completed).length;
    this.todos = this.todos.filter(todo => !todo.completed);

    if (completedCount > 0) {
      this.persistChanges();
      this.notifyDataChange();
    }

    return completedCount;
  }

  /**
   * 全部标记为完成/未完成
   */
  toggleAll(completed: boolean): void {
    let hasChanges = false;

    this.todos.forEach(todo => {
      if (todo.completed !== completed) {
        todo.completed = completed;
        todo.updatedAt = new Date();
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.persistChanges();
      this.notifyDataChange();
    }
  }

  // === 查询方法 ===

  getTodos(): TodoItem[] {
    return [...this.todos];
  }

  getTodo(id: string): TodoItem | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  getStats(): TodoListStats {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, pending, completionRate };
  }

  getFilteredTodos(filter: 'all' | 'active' | 'completed'): TodoItem[] {
    switch (filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return [...this.todos];
    }
  }

  // === 事件注册方法 ===

  setTodosChangeHandler(callback: (todos: TodoItem[]) => void): void {
    this.onTodosChange = callback;
  }

  setStatsChangeHandler(callback: (stats: TodoListStats) => void): void {
    this.onStatsChange = callback;
  }

  setErrorHandler(callback: (error: string) => void): void {
    this.onError = callback;
  }

  // === 私有辅助方法 ===

  private notifyDataChange(): void {
    if (this.onTodosChange) {
      this.onTodosChange(this.getTodos());
    }
    if (this.onStatsChange) {
      this.onStatsChange(this.getStats());
    }
  }

  private notifyError(message: string): void {
    if (this.onError) {
      this.onError(message);
    }
    console.warn('TodoList Error:', message);
  }

  private persistChanges(): void {
    if (this.autoSave) {
      try {
        localStorage.setItem('todolist-data', JSON.stringify(this.todos));
      } catch (_error) {
        this.notifyError('保存数据失败');
      }
    }
  }

  private loadFromStorage(): void {
    if (this.autoSave) {
      try {
        const saved = localStorage.getItem('todolist-data');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.todos = parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }));
          this.nextId = Math.max(...this.todos.map(t => parseInt(t.id))) + 1;
        }
      } catch (_error) {
        this.notifyError('加载数据失败');
      }
    }
  }
}
