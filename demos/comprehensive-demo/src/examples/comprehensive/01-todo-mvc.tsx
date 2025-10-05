import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

class TodoMVC extends Widget {
  private state = createState({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed',
    nextId: 1,
  });

  private inputText = '';

  onMounted() {
    this.state.subscribe(() => this.forceUpdate());
  }

  render() {
    const todos = this.state.get('todos');
    const filter = this.state.get('filter');
    const filtered = todos.filter(t =>
      filter === 'all' ? true : filter === 'active' ? !t.done : t.done
    );

    return (
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-3xl font-bold text-center mb-6 text-gray-800">Todo MVC</h2>

          {/* 输入框 */}
          <div class="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="输入待办事项..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && this.addTodo()}
              ref={(el) => el && (this.inputText = (el as HTMLInputElement).value)}
            />
            <button
              on:click={() => this.addTodo()}
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              添加
            </button>
          </div>

          {/* 过滤器 */}
          <div class="flex gap-2 mb-4">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                on:click={() => this.state.set('filter', f)}
                class={`px-4 py-2 rounded-lg ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
              >
                {f === 'all' ? '全部' : f === 'active' ? '未完成' : '已完成'}
              </button>
            ))}
          </div>

          {/* 列表 */}
          <div class="space-y-2">
            {filtered.map(todo => (
              <div key={todo.id} class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => this.toggleTodo(todo.id)}
                  class="w-5 h-5"
                />
                <span class={`flex-1 ${todo.done ? 'line-through text-gray-400' : ''}`}>
                  {todo.text}
                </span>
                <button
                  on:click={() => this.deleteTodo(todo.id)}
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          <div class="mt-4 text-sm text-gray-600 text-center">
            {todos.length} 个任务，{todos.filter(t => !t.done).length} 个未完成
          </div>
        </div>
      </div>
    );
  }

  private addTodo() {
    const input = this.$('input');
    if (!input) return;
    const text = input.get('value') as string;
    if (!text.trim()) return;

    const todos = this.state.get('todos');
    this.state.set('todos', [
      ...todos,
      { id: this.state.get('nextId'), text, done: false },
    ]);
    this.state.set('nextId', this.state.get('nextId') + 1);
    input.set('value', '');
  }

  private toggleTodo(id: number) {
    const todos = this.state.get('todos');
    this.state.set('todos', todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  private deleteTodo(id: number) {
    const todos = this.state.get('todos');
    this.state.set('todos', todos.filter(t => t.id !== id));
  }

  private forceUpdate() {
    if (!this.vnode || !this.root) return;
    updateDOM(this.vnode, this.render(), this.root);
    this.vnode = this.render();
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout title="01. TodoMVC" description="经典 Todo 应用示例">
      <TodoMVC />
      </ExampleLayout>
    );
  }
}
