import { Fukict } from '@fukict/basic';

import type { TodoItem } from './types';

/**
 * Todo Item 组件 Props
 */
interface TodoItemProps {
  todo: TodoItem;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Todo Item 组件
 *
 * 这个组件会被高性能列表通过 new TodoItemComponent(props) 直接实例化
 * 然后调用 instance.mount(container, placeholder) 进行挂载
 */
export class TodoItemComponent extends Fukict<TodoItemProps> {
  private renderCount = 0;

  /**
   * 手动更新 Todo 数据（用于脱围模式）
   */
  updateTodo(newTodo: TodoItem) {
    // 直接更新 props 并重新渲染
    this.props.todo = newTodo;
    this.update();
  }

  /**
   * 获取当前渲染次数
   */
  getRenderCount() {
    return this.renderCount;
  }

  render() {
    this.renderCount++;
    const { todo, onToggle, onDelete } = this.props;

    return (
      <div
        class={`flex items-center gap-3 rounded border p-3 transition-all ${
          todo.completed
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 bg-white'
        }`}
      >
        <input
          type="checkbox"
          checked={todo.completed}
          on:change={() => onToggle?.(todo.id)}
          class="h-4 w-4 cursor-pointer"
        />
        <span
          class={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
        >
          {todo.text}
        </span>
        <span class="font-mono text-xs text-gray-400">
          渲染#{this.renderCount}
        </span>
        <button
          on:click={() => onDelete?.(todo.id)}
          class="rounded px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          删除
        </button>
      </div>
    );
  }
}
