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
} from './TodoListDomain';
import { Widget } from '@vanilla-dom/widget';

/**
 * TodoList UI 组件
 * 继承自 Widget，组合使用 Domain 业务逻辑层
 */
export class TodoListUI extends Widget<TodoListProps> {
  private domain: TodoListDomain;
  private currentFilter: 'all' | 'active' | 'completed' = 'all';
  private editingId: string | null = null;
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
    this.updateTodosList();
    this.updateStats();
  }

  private handleStatsChange(stats: TodoListStats): void {
    this.currentStats = stats;
    this.updateStats();
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.showError();
    // 3秒后清除错误信息
    setTimeout(() => {
      this.errorMessage = '';
      this.hideError();
    }, 3000);
  }

  // === 用户交互方法 ===

  private handleAddTodo(): void {
    const input = this.$('.todo-input');
    if (input && input.element) {
      const text = (input.element as HTMLInputElement).value;
      if (this.domain.addTodo(text)) {
        // 调用 domain 的方法
        (input.element as HTMLInputElement).value = '';
      }
    }
  }

  private handleToggleTodo(id: string): void {
    this.domain.toggleTodo(id);
  }

  private handleRemoveTodo(id: string): void {
    this.domain.removeTodo(id);
  }

  private handleEditStart(id: string): void {
    this.editingId = id;
    this.updateTodosList();

    // 聚焦到编辑输入框
    setTimeout(() => {
      const editInput = this.$(`.edit-input[data-id="${id}"]`);
      if (editInput && editInput.element) {
        (editInput.element as HTMLInputElement).focus();
      }
    }, 10);
  }

  private handleEditSave(id: string): void {
    const editInput = this.$(`.edit-input[data-id="${id}"]`);
    if (editInput && editInput.element) {
      const newText = (editInput.element as HTMLInputElement).value;
      if (this.domain.editTodo(id, newText)) {
        this.editingId = null;
      }
    }
  }

  private handleEditCancel(): void {
    this.editingId = null;
    this.updateTodosList();
  }

  private handleFilterChange(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter = filter;
    this.updateTodosList();
    this.updateFilterButtons();
  }

  private handleClearCompleted(): void {
    const cleared = this.domain.clearCompleted();
    if (cleared > 0) {
      console.log(`清除了 ${cleared} 个已完成项目`);
    }
  }

  private handleToggleAll(): void {
    const allCompleted =
      this.currentStats.pending === 0 && this.currentStats.total > 0;
    this.domain.toggleAll(!allCompleted);
  }

  // === UI 更新方法 ===

  private updateTodosList(): void {
    const todosContainer = this.$('.todo-items');
    if (!todosContainer || !todosContainer.element) return;

    const filteredTodos = this.domain.getFilteredTodos(this.currentFilter);
    const todosHTML = filteredTodos
      .map(todo => this.renderTodoItem(todo))
      .join('');

    todosContainer.element.innerHTML = todosHTML;
    this.bindTodoEvents();
  }

  private updateStats(): void {
    const statsElement = this.$('.todo-stats');
    if (statsElement && statsElement.element) {
      statsElement.element.innerHTML = this.renderStats();
    }
  }

  private updateFilterButtons(): void {
    const filters = ['all', 'active', 'completed'];
    filters.forEach(filter => {
      const btn = this.$(`.filter-btn[data-filter="${filter}"]`);
      if (btn && btn.element) {
        if (filter === this.currentFilter) {
          btn.element.classList.add('active');
        } else {
          btn.element.classList.remove('active');
        }
      }
    });
  }

  private showError(): void {
    const errorElement = this.$('.error-message');
    if (errorElement && errorElement.element) {
      errorElement.element.textContent = this.errorMessage;
      (errorElement.element as HTMLElement).style.display = 'block';
    }
  }

  private hideError(): void {
    const errorElement = this.$('.error-message');
    if (errorElement && errorElement.element) {
      (errorElement.element as HTMLElement).style.display = 'none';
    }
  }

  // === 渲染辅助方法 ===

  private renderTodoItem(todo: TodoItem): string {
    if (this.editingId === todo.id) {
      return `
        <li class="todo-item editing" data-id="${todo.id}">
          <div class="todo-content">
            <input 
              type="text" 
              class="edit-input" 
              data-id="${todo.id}"
              value="${this.escapeHtml(todo.text)}"
            />
            <div class="edit-actions">
              <button class="btn btn-save" data-id="${todo.id}">保存</button>
              <button class="btn btn-cancel">取消</button>
            </div>
          </div>
        </li>
      `;
    }

    return `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-content">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            data-id="${todo.id}" 
            ${todo.completed ? 'checked' : ''}
          />
          <span class="todo-text" data-id="${todo.id}">${this.escapeHtml(todo.text)}</span>
        </div>
        <div class="todo-actions">
          <button class="btn btn-edit" data-id="${todo.id}">编辑</button>
          <button class="btn btn-delete" data-id="${todo.id}">删除</button>
        </div>
      </li>
    `;
  }

  private renderStats(): string {
    const { total, completed, pending, completionRate } = this.currentStats;
    return `
      <span class="stat-item">总数: ${total}</span>
      <span class="stat-item">已完成: ${completed}</span>
      <span class="stat-item">待完成: ${pending}</span>
      <span class="stat-item">完成率: ${completionRate.toFixed(1)}%</span>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // === 事件绑定 ===

  private bindTodoEvents(): void {
    // 复选框事件
    const checkboxes = this.element?.querySelectorAll('.todo-checkbox');
    checkboxes?.forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) this.handleToggleTodo(id);
      });
    });

    // 编辑按钮事件
    const editBtns = this.element?.querySelectorAll('.btn-edit');
    editBtns?.forEach(btn => {
      btn.addEventListener('click', e => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) this.handleEditStart(id);
      });
    });

    // 删除按钮事件
    const deleteBtns = this.element?.querySelectorAll('.btn-delete');
    deleteBtns?.forEach(btn => {
      btn.addEventListener('click', e => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) this.handleRemoveTodo(id);
      });
    });

    // 保存编辑按钮事件
    const saveBtns = this.element?.querySelectorAll('.btn-save');
    saveBtns?.forEach(btn => {
      btn.addEventListener('click', e => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) this.handleEditSave(id);
      });
    });

    // 取消编辑按钮事件
    const cancelBtns = this.element?.querySelectorAll('.btn-cancel');
    cancelBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleEditCancel();
      });
    });

    // 双击编辑
    const todoTexts = this.element?.querySelectorAll('.todo-text');
    todoTexts?.forEach(text => {
      text.addEventListener('dblclick', e => {
        const id = (e.target as HTMLElement).dataset.id;
        if (id) this.handleEditStart(id);
      });
    });

    // 编辑输入框回车保存
    const editInputs = this.element?.querySelectorAll('.edit-input');
    editInputs?.forEach(input => {
      input.addEventListener('keydown', e => {
        if ((e as KeyboardEvent).key === 'Enter') {
          const id = (e.target as HTMLElement).dataset.id;
          if (id) this.handleEditSave(id);
        } else if ((e as KeyboardEvent).key === 'Escape') {
          this.handleEditCancel();
        }
      });
    });
  }

  protected onMounted(): void {
    super.onMounted();

    // 绑定全局事件
    const addBtn = this.$('.add-todo-btn');
    if (addBtn && addBtn.element) {
      addBtn.element.addEventListener('click', () => {
        this.handleAddTodo();
      });
    }

    const todoInput = this.$('.todo-input');
    if (todoInput && todoInput.element) {
      todoInput.element.addEventListener('keydown', e => {
        if ((e as KeyboardEvent).key === 'Enter') {
          this.handleAddTodo();
        }
      });
    }

    // 过滤按钮事件
    const filterBtns = this.element?.querySelectorAll('.filter-btn');
    filterBtns?.forEach(btn => {
      btn.addEventListener('click', e => {
        const filter = (e.target as HTMLElement).dataset.filter as
          | 'all'
          | 'active'
          | 'completed';
        if (filter) this.handleFilterChange(filter);
      });
    });

    // 其他操作按钮
    const clearBtn = this.$('.clear-completed-btn');
    if (clearBtn && clearBtn.element) {
      clearBtn.element.addEventListener('click', () => {
        this.handleClearCompleted();
      });
    }

    const toggleAllBtn = this.$('.toggle-all-btn');
    if (toggleAllBtn && toggleAllBtn.element) {
      toggleAllBtn.element.addEventListener('click', () => {
        this.handleToggleAll();
      });
    }

    // 初始化 UI
    this.updateTodosList();
    this.updateStats();
    this.updateFilterButtons();
  }

  // === 公开 API ===

  // 暴露一些业务方法给外部使用
  getStats(): TodoListStats {
    return this.domain.getStats();
  }

  addTodo(text: string): boolean {
    return this.domain.addTodo(text);
  }

  // === Widget 渲染方法 ===

  public render() {
    return (
      <div className="todo-list-widget">
        <div className="error-message" style="display: none;"></div>

        <div className="todo-header">
          <h3>📝 待办事项列表</h3>
          <div className="todo-stats"></div>
        </div>

        <div className="todo-add">
          <input
            type="text"
            className="todo-input"
            placeholder="添加新的待办事项..."
            maxLength="100"
          />
          <button className="btn btn-primary add-todo-btn">添加</button>
        </div>

        <div className="todo-filters">
          <button className="filter-btn active" data-filter="all">
            全部
          </button>
          <button className="filter-btn" data-filter="active">
            未完成
          </button>
          <button className="filter-btn" data-filter="completed">
            已完成
          </button>
        </div>

        <ul className="todo-items"></ul>

        <div className="todo-footer">
          <button className="btn btn-secondary toggle-all-btn">全部切换</button>
          <button className="btn btn-warning clear-completed-btn">
            清除已完成
          </button>
        </div>

        <style>{`
          .todo-list-widget {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
          }
          
          .error-message {
            background: #fee;
            color: #c33;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            border: 1px solid #fcc;
          }
          
          .todo-header {
            margin-bottom: 20px;
            text-align: center;
          }
          
          .todo-header h3 {
            margin: 0 0 10px 0;
            color: #333;
          }
          
          .todo-stats {
            display: flex;
            gap: 15px;
            justify-content: center;
            font-size: 0.9rem;
            color: #666;
            flex-wrap: wrap;
          }
          
          .todo-add {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .todo-input {
            flex: 1;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }
          
          .todo-input:focus {
            outline: none;
            border-color: #4facfe;
          }
          
          .todo-filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
          }
          
          .filter-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .filter-btn:hover {
            background: #f0f0f0;
          }
          
          .filter-btn.active {
            background: #4facfe;
            color: white;
            border-color: #4facfe;
          }
          
          .todo-items {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
            max-height: 300px;
            overflow-y: auto;
          }
          
          .todo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin-bottom: 8px;
            background: #f9f9f9;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .todo-item:hover {
            background: #f0f0f0;
          }
          
          .todo-item.completed {
            opacity: 0.7;
          }
          
          .todo-item.completed .todo-text {
            text-decoration: line-through;
            color: #999;
          }
          
          .todo-content {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
          }
          
          .todo-checkbox {
            width: 18px;
            height: 18px;
          }
          
          .todo-text {
            flex: 1;
            font-size: 1rem;
            cursor: pointer;
          }
          
          .todo-actions {
            display: flex;
            gap: 8px;
          }
          
          .edit-input {
            flex: 1;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }
          
          .edit-actions {
            display: flex;
            gap: 8px;
          }
          
          .todo-footer {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          
          .btn:hover {
            transform: translateY(-1px);
          }
          
          .btn-primary {
            background: #4facfe;
            color: white;
          }
          
          .btn-primary:hover {
            background: #3da1e8;
          }
          
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .btn-secondary:hover {
            background: #5a6268;
          }
          
          .btn-warning {
            background: #ffc107;
            color: #212529;
          }
          
          .btn-warning:hover {
            background: #e0a800;
          }
          
          .btn-edit {
            background: #17a2b8;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
          }
          
          .btn-edit:hover {
            background: #138496;
          }
          
          .btn-delete {
            background: #dc3545;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
          }
          
          .btn-delete:hover {
            background: #c82333;
          }
          
          .btn-save {
            background: #28a745;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
          }
          
          .btn-save:hover {
            background: #218838;
          }
          
          .btn-cancel {
            background: #6c757d;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
          }
          
          .btn-cancel:hover {
            background: #5a6268;
          }
        `}</style>
      </div>
    );
  }
}
