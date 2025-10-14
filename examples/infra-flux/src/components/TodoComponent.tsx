import { Fukict, type VNode } from '@fukict/basic';

import {
  type Todo,
  getFilteredTodos,
  getTodoStats,
  todoStore,
} from '../stores/todoStore';

/**
 * Todo Component
 *
 * Demonstrates:
 * - Array state management
 * - Selector usage
 * - CRUD operations
 */
export class TodoComponent extends Fukict {
  private unsubscribe?: () => void;
  private inputText: string = '';

  mounted(): void {
    this.unsubscribe = todoStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount(): void {
    this.unsubscribe?.();
  }

  private handleSubmit = (e: Event): void => {
    e.preventDefault();
    if (this.inputText.trim()) {
      todoStore.actions.addTodo(this.inputText);
      this.inputText = '';
      this.update();
    }
  };

  render(): VNode {
    const state = todoStore.getState();
    const filteredTodos = getFilteredTodos(state);
    const stats = getTodoStats(state);
    const { toggleTodo, deleteTodo, setFilter, clearCompleted } =
      todoStore.actions;

    return (
      <div class="border rounded-lg p-6 bg-white shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Todo List Example</h2>
        <p class="text-gray-600 mb-4">
          Complex state management with arrays and selectors
        </p>

        {/* Input Form */}
        <form on:submit={this.handleSubmit} class="flex gap-2 mb-4">
          <input
            type="text"
            value={this.inputText}
            placeholder="What needs to be done?"
            class="flex-1 px-3 py-2 border rounded"
            on:input={(e: Event) => {
              this.inputText = (e.target as HTMLInputElement).value;
              this.update();
            }}
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </form>

        {/* Filter Tabs */}
        <div class="flex gap-2 mb-4">
          {(['all', 'active', 'completed'] as const).map(filter => (
            <button
              class={`px-3 py-1 rounded ${
                state.filter === filter
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              on:click={() => setFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div class="space-y-2 mb-4">
          {filteredTodos.length === 0 ? (
            <p class="text-gray-400 text-center py-4">No todos</p>
          ) : (
            filteredTodos.map((todo: Todo) => (
              <div
                key={todo.id}
                class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  class="w-4 h-4"
                  on:change={() => toggleTodo(todo.id)}
                />
                <span
                  class={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}
                >
                  {todo.text}
                </span>
                <button
                  class="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                  on:click={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Stats and Actions */}
        <div class="flex justify-between items-center text-sm text-gray-600">
          <span>
            {stats.active} active / {stats.total} total
          </span>
          {stats.completed > 0 && (
            <button
              class="text-red-500 hover:underline"
              on:click={() => clearCompleted()}
            >
              Clear completed
            </button>
          )}
        </div>
      </div>
    );
  }
}
