import { createFlux } from '@fukict/flux';

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

export const todoStore = createFlux({
  state: {
    todos: [] as Todo[],
    filter: 'all' as const,
  } as TodoState,

  actions: flux => ({
    addTodo(text: string) {
      const state = flux.getState();
      flux.setState({
        todos: [...state.todos, { id: nextId++, text, completed: false }],
      });
    },

    toggleTodo(id: number) {
      const state = flux.getState();
      flux.setState({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      });
    },

    deleteTodo(id: number) {
      const state = flux.getState();
      flux.setState({
        todos: state.todos.filter(todo => todo.id !== id),
      });
    },

    setFilter(filter: TodoState['filter']) {
      flux.setState({ filter });
    },

    clearCompleted() {
      const state = flux.getState();
      flux.setState({
        todos: state.todos.filter(todo => !todo.completed),
      });
    },
  }),
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
