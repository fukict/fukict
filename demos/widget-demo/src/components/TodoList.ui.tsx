/**
 * TodoList UI 层
 * 负责渲染界面、用户交互、事件处理
 * 组合使用 TodoListDomain 业务逻辑层
 */
import {
  TodoItem,
  TodoListDomain,
  TodoListProps,
  TodoListStats,
} from './TodoList.domain';
import { Widget } from '@vanilla-dom/widget';

/**
 * TodoList UI 组件
 * 继承自 Widget，组合使用 Domain 业务逻辑层
 */
export class TodoListUI extends Widget<TodoListProps> {
  private domain: TodoListDomain;
  private errorMessage: string = '';
  private currentStats: TodoListStats = {
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  };

  constructor(props: TodoListProps) {
    super(props);

    // 创建业务逻辑层实例（组合，而不是继承）
    this.domain = new TodoListDomain(props);

    // 注册业务逻辑层的事件回调
    this.domain.setTodosChangeHandler(this.handleTodosChange.bind(this));
    this.domain.setStatsChangeHandler(this.handleStatsChange.bind(this));
    this.domain.setErrorHandler(this.handleError.bind(this));

    // 初始化统计信息
    this.currentStats = this.domain.getStats();
  }

  // === UI 事件处理方法 ===

  private handleTodosChange(_todos: TodoItem[]): void {
    // 当数据变化时，更新待办事项列表显示
    this.updateTodoList();
  }

  private handleStatsChange(stats: TodoListStats): void {
    this.currentStats = stats;
    // 更新统计信息显示
    this.updateStatsDisplay();
  }

  private handleError(error: string): void {
    this.errorMessage = error;
    this.showErrorMessage();
    
    // 3秒后清除错误信息
    setTimeout(() => {
      this.errorMessage = '';
      this.hideErrorMessage();
    }, 3000);
  }

  // === 用户交互方法 ===

  private handleAddTodo = (e: Event): void => {
    e.preventDefault();
    const input = this.$('.todo-input');
    if (input && input.element) {
      const text = (input.element as HTMLInputElement).value;
      if (this.domain.addTodo(text)) {
        // 调用 domain 的方法成功后清空输入框
        (input.element as HTMLInputElement).value = '';
      }
    }
  };

  private handleToggleTodo = (id: string): void => {
    this.domain.toggleTodo(id);
  };

  private handleRemoveTodo = (id: string): void => {
    this.domain.removeTodo(id);
  };

  // === UI 更新方法 ===

  private updateStatsDisplay(): void {
    const statsElement = this.$('.todo-stats');
    if (statsElement?.element) {
      const { total, completed, pending } = this.currentStats;
      statsElement.element.textContent = `总计: ${total} | 已完成: ${completed} | 待完成: ${pending}`;
    }
  }

  private showErrorMessage(): void {
    const errorElement = this.$('.error-message');
    if (errorElement?.element) {
      errorElement.element.textContent = this.errorMessage;
      errorElement.set('style', 'display: block;');
    }
  }

  private hideErrorMessage(): void {
    const errorElement = this.$('.error-message');
    if (errorElement?.element) {
      errorElement.set('style', 'display: none;');
    }
  }

  private updateTodoList(): void {
    const container = this.$('.todo-items');
    if (container?.element) {
      const todos = this.domain.getTodos();
      container.element.innerHTML = todos
        .map(
          todo => `
          <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <label class="todo-label">
              <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''}
                data-id="${todo.id}"
              />
              <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            </label>
            <button 
              class="remove-btn" 
              data-id="${todo.id}"
            >
              ×
            </button>
          </li>
        `,
        )
        .join('');

      // 重新绑定事件
      this.bindTodoEvents();
    }
  }

  private bindTodoEvents(): void {
    // 绑定复选框事件
    const checkboxes = this.element?.querySelectorAll('.todo-item input[type="checkbox"]');
    checkboxes?.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = (e.target as HTMLElement).getAttribute('data-id');
        if (id) this.handleToggleTodo(id);
      });
    });

    // 绑定删除按钮事件
    const removeBtns = this.element?.querySelectorAll('.remove-btn');
    removeBtns?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).getAttribute('data-id');
        if (id) this.handleRemoveTodo(id);
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // === 生命周期方法 ===

  protected onMounted(): void {
    super.onMounted();
    
    // 初始化待办事项列表显示
    this.updateTodoList();
    this.updateStatsDisplay();
  }

  // === 渲染辅助方法 ===

  // === Widget 渲染方法 ===

  public render() {
    const { total, completed, pending } = this.currentStats;
    
    return (
      <div className="simple-todo-widget">
        <div className="error-message" style="display: none;">
        </div>

        <h3>{this.props.title || '📝 简化版待办列表'}</h3>

        <form className="todo-form" on:submit={this.handleAddTodo}>
          <input
            type="text"
            className="todo-input"
            placeholder="输入待办事项..."
            required
          />
          <button type="submit" className="add-btn">
            添加
          </button>
        </form>

        <ul className="todo-items">
        </ul>

        <div className="todo-stats">
          总计: {total} | 已完成: {completed} | 待完成: {pending}
        </div>

        <style>{`
          .simple-todo-widget {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            max-width: 500px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }

          .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            border: 1px solid #f5c6cb;
          }

          .simple-todo-widget h3 {
            margin: 0 0 20px 0;
            color: #495057;
            font-size: 18px;
          }

          .todo-form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }

          .todo-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          }

          .todo-input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .add-btn {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.15s ease-in-out;
          }

          .add-btn:hover {
            background: #0056b3;
          }

          .add-btn:active {
            background: #004085;
          }

          .todo-items {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
          }

          .todo-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
            transition: background-color 0.15s ease-in-out;
          }

          .todo-item:hover {
            background-color: #f1f3f4;
          }

          .todo-item.completed .todo-text {
            text-decoration: line-through;
            opacity: 0.6;
          }

          .todo-label {
            display: flex;
            align-items: center;
            flex: 1;
            cursor: pointer;
          }

          .todo-label input {
            margin-right: 10px;
            cursor: pointer;
          }

          .todo-text {
            font-size: 14px;
            line-height: 1.5;
          }

          .remove-btn {
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.15s ease-in-out;
          }

          .remove-btn:hover {
            background: #c82333;
          }

          .remove-btn:active {
            background: #bd2130;
          }

          .todo-stats {
            font-size: 14px;
            color: #6c757d;
            text-align: center;
            padding: 10px;
            background: #e9ecef;
            border-radius: 4px;
          }
        `}</style>
      </div>
    );
  }
} 