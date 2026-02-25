import { defineStore } from '@fukict/flux';

/**
 * Todo Store
 *
 * Demonstrates flux usage with complex state (arrays) and CRUD operations
 */

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

let nextId = 1;

export const todoStore = defineStore({
  scope: 'todo',
  state: {
    todos: [],
    filter: 'all',
  } as TodoState,

  actions: {
    addTodo: (state, text: string) => ({
      todos: [...state.todos, { id: nextId++, text, completed: false }],
    }),

    toggleTodo: (state, id: number) => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    }),

    deleteTodo: (state, id: number) => ({
      todos: state.todos.filter(todo => todo.id !== id),
    }),

    setFilter: (_state, filter: TodoState['filter']) => ({ filter }),

    clearCompleted: state => ({
      todos: state.todos.filter(todo => !todo.completed),
    }),
  },
});

// Selector example: computed values
export function getFilteredTodos(state: TodoState): Todo[] {
  switch (state.filter) {
    case 'active':
      return state.todos.filter(t => !t.completed);
    case 'completed':
      return state.todos.filter(t => t.completed);
    default:
      return state.todos;
  }
}

export function getTodoStats(state: TodoState) {
  return {
    total: state.todos.length,
    active: state.todos.filter(t => !t.completed).length,
    completed: state.todos.filter(t => t.completed).length,
  };
}
