import { Fukict } from '@fukict/basic';

import type { Priority, TodoItem } from './types';

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; border: string }
> = {
  high: {
    label: '高',
    color: 'text-red-700 bg-red-100',
    border: 'border-red-300',
  },
  medium: {
    label: '中',
    color: 'text-yellow-700 bg-yellow-100',
    border: 'border-yellow-300',
  },
  low: {
    label: '低',
    color: 'text-green-700 bg-green-100',
    border: 'border-green-300',
  },
};

const PRIORITY_CYCLE: Priority[] = ['low', 'medium', 'high'];

const TAG_COLORS = [
  'text-blue-700 border-blue-300',
  'text-purple-700 border-purple-300',
  'text-teal-700 border-teal-300',
  'text-orange-700 border-orange-300',
];

function formatRelativeTime(timestamp: number): string {
  const diff = timestamp - Date.now();
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;

  if (absDiff < 60_000) return isPast ? '刚刚过期' : '即将到期';
  if (absDiff < 3_600_000) {
    const mins = Math.floor(absDiff / 60_000);
    return isPast ? `${mins}分钟前到期` : `${mins}分钟后到期`;
  }
  if (absDiff < 86_400_000) {
    const hours = Math.floor(absDiff / 3_600_000);
    return isPast ? `${hours}小时前到期` : `${hours}小时后到期`;
  }
  const days = Math.floor(absDiff / 86_400_000);
  return isPast ? `${days}天前到期` : `${days}天后到期`;
}

/**
 * Todo Item 组件 Props
 */
interface TodoItemProps {
  todo: TodoItem;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPriorityChange?: (id: string, priority: Priority) => void;
  onProgressChange?: (id: string, progress: number) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

/**
 * Todo Item 组件
 *
 * 复杂渲染：优先级、标签、进度条、截止时间、展开/折叠
 * 用于体现高性能模式与传统模式在复杂子组件下的性能差异
 */
export class TodoItemComponent extends Fukict<TodoItemProps> {
  private renderCount = 0;
  private expanded = false;
  private rootEl: HTMLDivElement | null = null;

  /**
   * 获取组件根 DOM 元素
   */
  getElement(): HTMLDivElement | null {
    return this.rootEl;
  }

  /**
   * 手动更新 Todo 数据（用于脱围模式）
   */
  updateTodo(newTodo: TodoItem) {
    this.props.todo = newTodo;
    this.update();
  }

  /**
   * 获取当前渲染次数
   */
  getRenderCount() {
    return this.renderCount;
  }

  private toggleExpand() {
    this.expanded = !this.expanded;
    this.update();
  }

  private cyclePriority() {
    const { todo, onPriorityChange } = this.props;
    const currentIndex = PRIORITY_CYCLE.indexOf(todo.priority);
    const nextPriority =
      PRIORITY_CYCLE[(currentIndex + 1) % PRIORITY_CYCLE.length];
    onPriorityChange?.(todo.id, nextPriority);
  }

  private incrementProgress() {
    const { todo, onProgressChange } = this.props;
    const next = Math.min(100, todo.progress + 10);
    onProgressChange?.(todo.id, next);
  }

  render() {
    this.renderCount++;
    const { todo, onToggle, onDelete } = this.props;
    const priorityCfg = PRIORITY_CONFIG[todo.priority];
    const isOverdue =
      todo.dueDate !== null && todo.dueDate < Date.now() && !todo.completed;

    return (
      <div
        ref={(el: HTMLDivElement) => (this.rootEl = el)}
        class={`rounded border p-3 transition-all ${
          todo.completed
            ? 'border-gray-200 bg-gray-50 opacity-70'
            : `${priorityCfg.border} bg-white`
        }`}
      >
        {/* 主行 */}
        <div class="flex items-center gap-2">
          {/* 复选框 */}
          <input
            type="checkbox"
            checked={todo.completed}
            on:change={() => onToggle?.(todo.id)}
            class="h-4 w-4 shrink-0 cursor-pointer"
          />

          {/* 优先级徽章 */}
          <span
            class={`shrink-0 cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium ${priorityCfg.color}`}
            on:click={() => this.cyclePriority()}
            title="点击切换优先级"
          >
            {priorityCfg.label}
          </span>

          {/* 标题 */}
          <span
            class={`min-w-0 flex-1 truncate ${
              todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'
            }`}
          >
            {todo.text}
          </span>

          {/* 标签 */}
          <div class="flex shrink-0 gap-1">
            {todo.tags.map((tag, i) => (
              <span
                class={`rounded border px-1.5 py-0.5 text-xs ${TAG_COLORS[i % TAG_COLORS.length]}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 截止时间 */}
          {todo.dueDate !== null && (
            <span
              class={`shrink-0 text-xs ${isOverdue ? 'font-medium text-red-600' : 'text-gray-400'}`}
            >
              {formatRelativeTime(todo.dueDate)}
            </span>
          )}

          {/* 渲染计数 */}
          <span class="shrink-0 font-mono text-xs text-gray-400">
            #{this.renderCount}
          </span>

          {/* 上移/下移 */}
          <button
            on:click={() => this.props.onMoveUp?.(todo.id)}
            class="shrink-0 rounded px-1 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
            title="上移"
          >
            ↑
          </button>
          <button
            on:click={() => this.props.onMoveDown?.(todo.id)}
            class="shrink-0 rounded px-1 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
            title="下移"
          >
            ↓
          </button>

          {/* 展开/折叠 */}
          <button
            on:click={() => this.toggleExpand()}
            class="shrink-0 rounded px-1.5 py-0.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
          >
            {this.expanded ? '收起' : '展开'}
          </button>

          {/* 删除 */}
          <button
            on:click={() => onDelete?.(todo.id)}
            class="shrink-0 rounded px-2 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-50"
          >
            删除
          </button>
        </div>

        {/* 进度条 */}
        <div class="mt-2 flex items-center gap-2">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              class={`h-full rounded-full transition-all ${
                todo.progress >= 100
                  ? 'bg-green-500'
                  : todo.progress >= 50
                    ? 'bg-blue-500'
                    : 'bg-orange-400'
              }`}
              style={`width: ${todo.progress}%`}
            />
          </div>
          <span class="w-8 text-right text-xs text-gray-500">
            {todo.progress}%
          </span>
          <button
            on:click={() => this.incrementProgress()}
            class="rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-100"
          >
            +10%
          </button>
        </div>

        {/* 展开区域 */}
        {this.expanded && (
          <div class="mt-2 space-y-1 border-t border-gray-100 pt-2">
            <p class="text-xs text-gray-600">{todo.description}</p>
            <div class="flex items-center gap-3 text-xs text-gray-400">
              <span>创建: {new Date(todo.createdAt).toLocaleString()}</span>
              {todo.dueDate !== null && (
                <span>截止: {new Date(todo.dueDate).toLocaleString()}</span>
              )}
              <span>ID: {todo.id}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
