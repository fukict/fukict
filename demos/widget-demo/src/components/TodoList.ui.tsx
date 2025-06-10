/**
 * TodoList UI 层
 * 负责渲染界面、用户交互、事件处理
 * 组合使用 TodoListDomain 业务逻辑层
 */
import type { WidgeFuncInstance } from '@vanilla-dom/widget';

import { createWidget } from '@vanilla-dom/widget';

import {
  TodoItem,
  TodoListDomain,
  TodoListProps,
  TodoListStats,
} from './TodoList.domain';

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

  // 状态比较缓存
  private prevTodos?: TodoItem[];
  private prevStats?: ReturnType<typeof this.getStats>;
  private prevError?: string;

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
    // 创建待办列表组件
    const TodosWidget = createWidget(
      (props: {
        todos: TodoItem[];
        onToggle: (id: string) => void;
        onDelete: (id: string) => void;
      }) => {
        if (props.todos.length === 0) {
          return <div class="empty-state">暂无待办事项</div>;
        }

        return (
          <div>
            {props.todos.map((todo: TodoItem) => (
              <div
                key={todo.id}
                class={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    data-todo-id={todo.id}
                    on:change={() => props.onToggle(todo.id)}
                  />
                  <span class="todo-text">{todo.text}</span>
                </label>
                <button
                  class="delete-btn"
                  data-todo-id={todo.id}
                  title="删除"
                  on:click={() => props.onDelete(todo.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        );
      },
    );

    // 创建统计信息组件
    const StatsWidget = createWidget((props: { stats: TodoListStats }) => (
      <div>
        <div class="stats-item">
          <span class="stats-label">总计:</span>
          <span class="stats-value">{props.stats.total}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">已完成:</span>
          <span class="stats-value">{props.stats.completed}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">待完成:</span>
          <span class="stats-value">{props.stats.pending}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">完成率:</span>
          <span class="stats-value">
            {props.stats.completionRate.toFixed(1)}%
          </span>
        </div>
      </div>
    ));

    // 创建错误提示组件
    const ErrorWidget = createWidget<{ error?: string; onClear: () => void }>(
      props => {
        if (!props.error) {
          return <div style="display: none;"></div>;
        }

        // 3秒后自动清除错误
        setTimeout(() => {
          props.onClear();
        }, 3000);

        return (
          <div class="error-message" style="display: block;">
            {props.error}
          </div>
        );
      },
    );

    // 创建组件实例
    this.todosWidget = TodosWidget({
      todos: this.getTodos(),
      onToggle: (id: string) => this.toggleTodo(id),
      onDelete: (id: string) => this.removeTodo(id),
    });

    this.statsWidget = StatsWidget({
      stats: this.getStats(),
    });

    this.errorWidget = ErrorWidget({
      error: this.getError(),
      onClear: () => this.clearError(),
    });
  }

  // === 重写 domain 层钩子，实现优化的 UI 更新 ===

  protected onDataChanged(): void {
    const todos = this.getTodos();
    const stats = this.getStats();

    // 只有数据真正变化时才重渲染
    if (!this.isEqual(todos, this.prevTodos)) {
      this.renderTodos();
      this.prevTodos = [...todos];
    }

    if (!this.isEqual(stats, this.prevStats)) {
      this.renderStats();
      this.prevStats = { ...stats };
    }
  }

  protected onErrorChanged(): void {
    const error = this.getError();

    // 只有错误状态变化时才重渲染
    if (error !== this.prevError) {
      this.renderError();
      this.prevError = error;
    }
  }

  // === 工具方法 ===

  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    // 数组比较
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }

    // 对象比较
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this.isEqual(a[key], b[key]));
    }

    return false;
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
    } else {
      // 更新组件 props
      this.errorWidget.update({
        error: this.getError(),
        onClear: () => this.clearError(),
      });
    }
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

        {/* 错误提示 */}
        <div class="error-message" data-error style="display: none;"></div>

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
