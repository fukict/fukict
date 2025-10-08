/**
 * TodoList UI 层
 * 负责渲染界面、用户交互、事件处理
 * 组合使用 TodoListDomain 业务逻辑层
 */
import type { WidgeFuncInstance } from '@fukict/widget';

import { TodoListDomain, TodoListProps } from './TodoList.domain';
import { ErrorComponent } from './TodoList.ui.error';
import { StatsComponent } from './TodoList.ui.stats';
import { TodosComponent } from './TodoList.ui.todos';

import './TodoList.css';

/**
 * TodoList UI 组件
 * 继承 domain 层，专注于界面渲染和用户交互
 */
export class TodoListUI extends TodoListDomain {
  // 子组件实例
  private todosWidget?: WidgeFuncInstance;
  private statsWidget?: WidgeFuncInstance;
  private errorWidget?: WidgeFuncInstance;

  // DOM 容器
  private todoListContainer?: HTMLElement;
  private statsContainer?: HTMLElement;
  private errorContainer?: HTMLElement;

  constructor(props: TodoListProps) {
    super(props);
  }

  onMounted(): void {
    // 获取 DOM 容器
    this.todoListContainer = this.$('[data-todo-list]')?.element as HTMLElement;
    this.statsContainer = this.$('[data-stats]')?.element as HTMLElement;
    this.errorContainer = this.$('[data-error]')?.element as HTMLElement;

    // 创建子组件
    this.createSubWidgets();

    // 初始渲染
    this.renderTodos();
    this.renderStats();
    this.renderError();
  }

  onUnmounting(): void {
    // 清理子组件
    this.todosWidget?.destroy();
    this.statsWidget?.destroy();
    this.errorWidget?.destroy();
  }

  // === 创建子组件 ===

  private createSubWidgets(): void {
    // 创建组件实例
    this.todosWidget = TodosComponent({
      todos: this.getTodos(),
      onToggle: (id: string) => this.toggleTodo(id),
      onDelete: (id: string) => this.removeTodo(id),
    });

    this.statsWidget = StatsComponent({
      stats: this.getStats(),
    });

    this.errorWidget = ErrorComponent({
      error: this.getError(),
      onClear: () => this.clearError(),
    });
  }

  // === 重写 domain 层钩子，直接更新子组件 ===

  protected onDataChanged(): void {
    this.renderTodos();
    this.renderStats();
  }

  protected onErrorChanged(): void {
    this.renderError();
  }

  // === UI 渲染方法 ===

  private async renderTodos(): Promise<void> {
    if (!this.todosWidget || !this.todoListContainer) return;

    // 挂载组件（如果尚未挂载）
    if (!this.todosWidget.element) {
      await this.todosWidget.mount(this.todoListContainer, true);
    } else {
      // 更新组件 props
      this.todosWidget.update({
        todos: this.getTodos(),
        onToggle: (id: string) => this.toggleTodo(id),
        onDelete: (id: string) => this.removeTodo(id),
      });
    }
  }

  private async renderStats(): Promise<void> {
    if (!this.statsWidget || !this.statsContainer) return;

    // 挂载组件（如果尚未挂载）
    if (!this.statsWidget.element) {
      await this.statsWidget.mount(this.statsContainer, true);
    } else {
      // 更新组件 props
      this.statsWidget.update({
        stats: this.getStats(),
      });
    }
  }

  private async renderError(): Promise<void> {
    if (!this.errorWidget || !this.errorContainer) return;

    // 挂载组件（如果尚未挂载）
    if (!this.errorWidget.element) {
      await this.errorWidget.mount(this.errorContainer, true);
    }

    // 更新组件 props
    this.errorWidget.update({
      error: this.getError(),
      onClear: () => this.clearError(),
    });
  }

  private clearInput(): void {
    const input = this.$('input[data-todo-input]')?.element as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  render() {
    const { title = 'Todo List' } = this.props;

    return (
      <div class="todo-container">
        <h2>{title}</h2>

        {/* 错误提示容器 */}
        <div data-error></div>

        {/* 添加新项目 */}
        <form
          class="add-todo-form"
          on:submit={(e: Event) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.querySelector(
              'input[data-todo-input]',
            ) as HTMLInputElement;
            if (this.addTodo(input.value)) {
              this.clearInput();
            }
          }}
        >
          <input
            type="text"
            placeholder="输入新的待办事项..."
            data-todo-input
            class="todo-input"
          />
          <button type="submit" class="add-btn">
            添加
          </button>
        </form>

        {/* 待办事项列表 */}
        <div class="todo-list" data-todo-list></div>

        {/* 统计信息 */}
        <div class="stats-container" data-stats></div>
      </div>
    );
  }
}
