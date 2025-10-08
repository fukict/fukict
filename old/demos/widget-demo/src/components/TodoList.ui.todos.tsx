import { defineWidget } from '@fukict/widget';

import type { TodoItem } from './TodoList.domain';

export interface TodosProps {
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodosComponent = defineWidget<TodosProps>(props => {
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
});
