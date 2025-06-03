import { hyperscript } from '@vanilla-dom/core';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoApp() {
  let todos: Todo[] = [
    { id: 1, text: '学习 Vanilla DOM', completed: false },
    { id: 2, text: '构建 JSX 应用', completed: true },
    { id: 3, text: '部署项目', completed: false },
  ];

  let nextId = 4;
  let todoListElement: HTMLUListElement;
  let inputElement: HTMLInputElement;

  const renderTodos = () => {
    if (!todoListElement) return;

    todoListElement.innerHTML = '';
    todos.forEach(todo => {
      const item = document.createElement('li');
      item.className = `todo-item ${todo.completed ? 'completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.onchange = () => {
        todo.completed = !todo.completed;
        renderTodos();
      };

      const text = document.createElement('span');
      text.className = `todo-text ${todo.completed ? 'completed' : ''}`;
      text.textContent = todo.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '删除';
      deleteBtn.onclick = () => {
        todos = todos.filter(t => t.id !== todo.id);
        renderTodos();
      };

      item.appendChild(checkbox);
      item.appendChild(text);
      item.appendChild(deleteBtn);
      todoListElement.appendChild(item);
    });
  };

  const handleAdd = () => {
    if (!inputElement) return;

    if (inputElement.value.trim()) {
      todos.push({
        id: nextId++,
        text: inputElement.value.trim(),
        completed: false,
      });
      inputElement.value = '';
      renderTodos();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAdd();
    }
  };

  // 在DOM挂载后进行初始化
  setTimeout(() => {
    todoListElement = document.querySelector('.todo-list') as HTMLUListElement;
    inputElement = document.querySelector('.todo-input') as HTMLInputElement;
    renderTodos();
  }, 0);

  return (
    <div className="todo-app">
      <div>
        <input
          type="text"
          className="todo-input"
          placeholder="添加新的待办事项..."
          on:keydown={handleKeyDown}
        />
        <button className="btn" on:click={handleAdd}>
          添加
        </button>
      </div>
      <ul className="todo-list"></ul>
    </div>
  );
}
