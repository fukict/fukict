import { Fukict, type VNode } from '@fukict/basic';
import type { FetchResponse } from '@fukict/fetch';

import { http } from '../http';
import type { Todo } from '../types';

export class CrudDemo extends Fukict {
  private todos: Todo[] = [];
  private inputText: string = '';
  private lastStatus: string = '';
  private loading: boolean = false;

  mounted(): void {
    this.loadTodos();
  }

  private async loadTodos(): Promise<void> {
    this.loading = true;
    this.update();
    try {
      const res: FetchResponse<Todo[]> = await http.get<Todo[]>('/todos');
      this.todos = res.data;
      this.lastStatus = `GET ${res.status} ${res.statusText}`;
    } catch {
      this.lastStatus = 'Failed to load todos';
    }
    this.loading = false;
    this.update();
  }

  private handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();
    const title = this.inputText.trim();
    if (!title) return;
    try {
      const res = await http.post<Todo>('/todos', { title });
      this.todos.push(res.data);
      this.inputText = '';
      this.lastStatus = `POST ${res.status} ${res.statusText}`;
    } catch {
      this.lastStatus = 'Failed to add todo';
    }
    this.update();
  };

  private handleToggle = async (todo: Todo): Promise<void> => {
    try {
      const res = await http.put<Todo>(`/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      const index = this.todos.findIndex(t => t.id === todo.id);
      if (index !== -1) this.todos[index] = res.data;
      this.lastStatus = `PUT ${res.status} ${res.statusText}`;
    } catch {
      this.lastStatus = 'Failed to update todo';
    }
    this.update();
  };

  private handleDelete = async (id: number): Promise<void> => {
    try {
      const res = await http.delete<Todo>(`/todos/${id}`);
      this.todos = this.todos.filter(t => t.id !== id);
      this.lastStatus = `DELETE ${res.status} ${res.statusText}`;
    } catch {
      this.lastStatus = 'Failed to delete todo';
    }
    this.update();
  };

  render(): VNode {
    return (
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-2xl font-bold">CRUD Demo</h2>
        <p class="mb-4 text-sm text-gray-600">
          GET / POST / PUT / DELETE with typed responses
        </p>

        {/* Status */}
        {this.lastStatus && (
          <div class="mb-4 rounded bg-gray-100 px-3 py-2 font-mono text-sm text-gray-700">
            {this.lastStatus}
          </div>
        )}

        {/* Add Form */}
        <form on:submit={this.handleSubmit} class="mb-4 flex gap-2">
          <input
            type="text"
            value={this.inputText}
            placeholder="New todo title..."
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

        {/* Todo List */}
        <div class="space-y-2">
          {this.loading ? (
            <p class="py-4 text-center text-gray-400">Loading...</p>
          ) : this.todos.length === 0 ? (
            <p class="py-4 text-center text-gray-400">No todos</p>
          ) : (
            this.todos.map((todo: Todo) => (
              <div
                key={todo.id}
                class="flex items-center gap-2 rounded border p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  class="h-4 w-4"
                  on:change={() => this.handleToggle(todo)}
                />
                <span
                  class={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : ''}`}
                >
                  {todo.title}
                </span>
                <button
                  class="rounded px-2 py-1 text-red-500 hover:bg-red-50"
                  on:click={() => this.handleDelete(todo.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Reload */}
        <div class="mt-4">
          <button
            class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            on:click={() => this.loadTodos()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
