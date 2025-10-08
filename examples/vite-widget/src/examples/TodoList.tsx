import { Widget, type VNode } from '@fukict/widget';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export class TodoList extends Widget<{}> {
  private todos: Todo[] = [
    { id: 1, text: '学习 Fukict Runtime', completed: true },
    { id: 2, text: '学习 Fukict Widget', completed: false },
    { id: 3, text: '构建应用', completed: false },
  ];

  private inputRef: HTMLInputElement | null = null;

  addTodo = () => {
    if (!this.inputRef || !this.inputRef.value.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: this.inputRef.value,
      completed: false,
    };

    this.todos.push(newTodo);
    this.inputRef.value = '';
    this.forceUpdate();
  };

  toggleTodo = (id: number) => {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.forceUpdate();
    }
  };

  removeTodo = (id: number) => {
    this.todos = this.todos.filter(t => t.id !== id);
    this.forceUpdate();
  };

  render(): VNode {
    return (
      <div class="todo-example">
        <h2>类组件: Todo List</h2>
        <div class="todo-list">
          <div class="todo-input">
            <input
              type="text"
              placeholder="添加待办事项..."
              ref={el => {
                this.inputRef = el as HTMLInputElement;
              }}
              on:keypress={(e: KeyboardEvent) => {
                if (e.key === 'Enter') this.addTodo();
              }}
            />
            <button on:click={this.addTodo}>添加</button>
          </div>
          <ul>
            {this.todos.map(todo => (
              <li class={todo.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  on:change={() => this.toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
                <button class="delete" on:click={() => this.removeTodo(todo.id)}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
