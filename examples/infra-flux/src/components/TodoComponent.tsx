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
    const state = todoStore.state;
    const filteredTodos = getFilteredTodos(state);
    const stats = getTodoStats(state);
    const { toggleTodo, deleteTodo, setFilter, clearCompleted } =
      todoStore.actions;

    return (
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-2xl font-bold">Todo List Example</h2>
        <p class="mb-4 text-gray-600">
          Complex state management with arrays and selectors
        </p>

        {/* Input Form */}
        <form on:submit={this.handleSubmit} class="mb-4 flex gap-2">
          <input
            type="text"
            value={this.inputText}
            placeholder="What needs to be done?"
            class="flex-1 rounded border px-3 py-2"
            on:input={(e: Event) => {
              this.inputText = (e.target as HTMLInputElement).value;
              this.update();
            }}
          />
          <button
            type="submit"
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add
          </button>
        </form>

        {/* Filter Tabs */}
        <div class="mb-4 flex gap-2">
          {(['all', 'active', 'completed'] as const).map(filter => (
            <button
              class={`rounded px-3 py-1 ${
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
        <div class="mb-4 space-y-2">
          {filteredTodos.length === 0 ? (
            <p class="py-4 text-center text-gray-400">No todos</p>
          ) : (
            filteredTodos.map((todo: Todo) => (
              <div
                key={todo.id}
                class="flex items-center gap-2 rounded border p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  class="h-4 w-4"
                  on:change={() => toggleTodo(todo.id)}
                />
                <span
                  class={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : ''}`}
                >
                  {todo.text}
                </span>
                <button
                  class="rounded px-2 py-1 text-red-500 hover:bg-red-50"
                  on:click={() => deleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Stats and Actions */}
        <div class="flex items-center justify-between text-sm text-gray-600">
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
