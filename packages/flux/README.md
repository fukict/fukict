# @fukict/flux

Minimal state management library for Fukict framework with Flux pattern and reactive subscriptions.

## Features

- **Minimal API**: Simple `createFlux()` factory function
- **Reactive Subscriptions**: Subscribe to state changes with automatic updates
- **Selector Pattern**: Subscribe to derived/computed values
- **Type-Safe**: Full TypeScript support with type inference
- **Action Pattern**: Organized state mutations through actions
- **Dev Mode Protection**: Prevents direct state mutation in development
- **Zero Dependencies**: No external dependencies

## Installation

```bash
pnpm add @fukict/flux
```

## Quick Start

### Basic Counter Example

```tsx
import { Fukict } from '@fukict/basic';
import { createFlux } from '@fukict/flux';

// Create flux store
const counterFlux = createFlux({
  state: {
    count: 0,
  },
  actions: flux => ({
    increment() {
      const state = flux.getState();
      flux.setState({ count: state.count + 1 });
    },
    decrement() {
      const state = flux.getState();
      flux.setState({ count: state.count - 1 });
    },
    setCount(value: number) {
      flux.setState({ count: value });
    },
  }),
});

// Use in component
class Counter extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to state changes
    this.unsubscribe = counterFlux.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    // Clean up subscription
    this.unsubscribe?.();
  }

  render() {
    const state = counterFlux.getState();
    const actions = counterFlux.getActions();

    return (
      <div>
        <p>Count: {state.count}</p>
        <button on:click={actions.increment}>+</button>
        <button on:click={actions.decrement}>-</button>
      </div>
    );
  }
}
```

## Core Concepts

### Creating Flux Store

```typescript
import { createFlux } from '@fukict/flux';

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const todoFlux = createFlux({
  state: {
    todos: [],
    filter: 'all',
  } as TodoState,
  actions: flux => ({
    addTodo(text: string) {
      const state = flux.getState();
      flux.setState({
        todos: [...state.todos, { id: Date.now(), text, completed: false }],
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
    setFilter(filter: TodoState['filter']) {
      flux.setState({ filter });
    },
  }),
});
```

### Subscribing to State

```tsx
class TodoList extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to all state changes
    this.unsubscribe = todoFlux.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { todos } = todoFlux.getState();
    return (
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    );
  }
}
```

### Using Selectors

Selectors allow you to subscribe to derived/computed values:

```tsx
// Define selector
const visibleTodosSelector = (state: TodoState) => {
  switch (state.filter) {
    case 'active':
      return state.todos.filter(t => !t.completed);
    case 'completed':
      return state.todos.filter(t => t.completed);
    default:
      return state.todos;
  }
};

class FilteredTodoList extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to selector (only updates when selector result changes)
    this.unsubscribe = todoFlux.subscribe(
      visibleTodosSelector,
      visibleTodos => {
        console.log('Visible todos changed:', visibleTodos);
        this.update(this.props);
      },
    );
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const visibleTodos = visibleTodosSelector(todoFlux.getState());
    return (
      <ul>
        {visibleTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    );
  }
}
```

### Async Actions

```typescript
const userFlux = createFlux({
  state: {
    user: null as User | null,
    loading: false,
    error: null as string | null,
  },
  actions: flux => ({
    async login(email: string, password: string) {
      flux.setState({ loading: true, error: null });

      try {
        const user = await api.login(email, password);
        flux.setState({ user, loading: false });
      } catch (error) {
        flux.setState({
          error: error.message,
          loading: false,
        });
      }
    },
    logout() {
      flux.setState({ user: null });
    },
  }),
});
```

## Subscription Patterns

### Pattern 1: Top-Level Subscription

Subscribe at the root/layout component level:

```tsx
class App extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // App subscribes, all children read state
    this.unsubscribe = globalFlux.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div>
        <Header /> {/* Reads state, no subscription */}
        <Content /> {/* Reads state, no subscription */}
      </div>
    );
  }
}
```

### Pattern 2: Sibling Subscriptions

Different components subscribe to different stores:

```tsx
class Dashboard extends Fukict {
  render() {
    return (
      <div>
        <CounterPanel /> {/* Subscribes to counterFlux */}
        <TodoPanel /> {/* Subscribes to todoFlux */}
        <UserPanel /> {/* Subscribes to userFlux */}
      </div>
    );
  }
}
```

### Pattern 3: Detached Subscriptions

Use `fukict:detach` for independent updates:

```tsx
class Parent extends Fukict {
  render() {
    return (
      <div>
        <ChildA /> {/* Parent updates trigger ChildA update */}
        <ChildB fukict:detach={true} /> {/* Independent updates */}
      </div>
    );
  }
}
```

## State Mutation Protection

In development mode, Flux prevents direct state mutation:

```typescript
const flux = createFlux({
  state: { count: 0 },
  actions: flux => ({
    // ✅ Good: Use setState
    increment() {
      const state = flux.getState();
      flux.setState({ count: state.count + 1 });
    },
  }),
});

// ❌ Bad: Direct mutation (warning in dev mode)
const state = flux.getState();
state.count++; // Warning: [Flux] Direct state mutation is not allowed
```

## Advanced Usage

### Multiple Stores

```typescript
// User store
const userFlux = createFlux({
  state: { user: null },
  actions: (flux) => ({
    setUser(user: User) {
      flux.setState({ user });
    },
  }),
});

// Settings store
const settingsFlux = createFlux({
  state: { theme: 'light', language: 'en' },
  actions: (flux) => ({
    setTheme(theme: string) {
      flux.setState({ theme });
    },
    setLanguage(language: string) {
      flux.setState({ language });
    },
  }),
});

// Use both in component
class Profile extends Fukict {
  private unsubscribeUser?: () => void;
  private unsubscribeSettings?: () => void;

  mounted() {
    this.unsubscribeUser = userFlux.subscribe(() => this.update(this.props));
    this.unsubscribeSettings = settingsFlux.subscribe(() =>
      this.update(this.props)
    );
  }

  beforeUnmount() {
    this.unsubscribeUser?.();
    this.unsubscribeSettings?.();
  }

  render() {
    const { user } = userFlux.getState();
    const { theme } = settingsFlux.getState();
    return <div class={theme}>{user?.name}</div>;
  }
}
```

### Computed Values with Selectors

```typescript
const statsSelector = (state: TodoState) => ({
  total: state.todos.length,
  completed: state.todos.filter((t) => t.completed).length,
  active: state.todos.filter((t) => !t.completed).length,
});

class TodoStats extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = todoFlux.subscribe(statsSelector, (stats) => {
      console.log('Stats changed:', stats);
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const stats = statsSelector(todoFlux.getState());
    return (
      <div>
        <p>Total: {stats.total}</p>
        <p>Completed: {stats.completed}</p>
        <p>Active: {stats.active}</p>
      </div>
    );
  }
}
```

### Store Composition

```typescript
const createAppFlux = () => {
  const userFlux = createFlux({
    state: { user: null },
    actions: (flux) => ({ /*...*/ }),
  });

  const todoFlux = createFlux({
    state: { todos: [] },
    actions: (flux) => ({ /*...*/ }),
  });

  return {
    user: userFlux,
    todo: todoFlux,
  };
};

const appFlux = createAppFlux();

// Use in components
appFlux.user.getState();
appFlux.user.getActions().setUser(...);
appFlux.todo.getState();
appFlux.todo.getActions().addTodo(...);
```

## API Reference

### createFlux(config)

Creates a new flux store.

```typescript
const flux = createFlux({
  state: initialState,
  actions: flux => ({
    actionName(...args) {
      // Action implementation
      flux.setState(newState);
    },
  }),
});
```

### flux.getState()

Returns current state (protected from mutation in dev mode).

```typescript
const state = flux.getState();
console.log(state.count);
```

### flux.setState(partial)

Updates state with partial state object.

```typescript
flux.setState({ count: 10 });
```

### flux.getActions()

Returns actions object.

```typescript
const actions = flux.getActions();
actions.increment();
```

### flux.subscribe(listener)

Subscribes to all state changes.

```typescript
const unsubscribe = flux.subscribe(() => {
  console.log('State changed');
});

// Clean up
unsubscribe();
```

### flux.subscribe(selector, listener)

Subscribes to selector changes (only triggers when selector result changes).

```typescript
const unsubscribe = flux.subscribe(
  state => state.user.name,
  name => {
    console.log('Name changed:', name);
  },
);
```

## Best Practices

### 1. Organize Actions by Feature

```typescript
// ✅ Good: Group related actions
const userFlux = createFlux({
  state: { user: null, preferences: {} },
  actions: flux => ({
    // Auth actions
    login(credentials) {
      /*...*/
    },
    logout() {
      /*...*/
    },

    // Preference actions
    updatePreference(key, value) {
      /*...*/
    },
    resetPreferences() {
      /*...*/
    },
  }),
});
```

### 2. Use Selectors for Derived State

```typescript
// ✅ Good: Selector for computed values
const expensiveSelector = (state) => {
  return state.items.filter(/*...*/).map(/*...*/).reduce(/*...*/);
};

// ❌ Bad: Compute in render
render() {
  const state = flux.getState();
  const result = state.items.filter(/*...*/).map(/*...*/).reduce(/*...*/);
}
```

### 3. Clean Up Subscriptions

```tsx
// ✅ Good: Always clean up
class MyComponent extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = flux.subscribe(() => this.update(this.props));
  }

  beforeUnmount() {
    this.unsubscribe?.(); // Essential!
  }
}
```

### 4. Subscribe at the Right Level

```tsx
// ✅ Good: Subscribe at parent, read in children
class App extends Fukict {
  mounted() {
    this.unsubscribe = flux.subscribe(() => this.update(this.props));
  }
  render() {
    return (
      <div>
        <Child />
      </div>
    );
  }
}

class Child extends Fukict {
  render() {
    const state = flux.getState(); // Just read
    return <div>{state.value}</div>;
  }
}
```

## Examples

See [examples/infra-flux](../../examples/infra-flux) for complete examples:

- Counter with async actions
- Todo list with filters
- User profile with settings
- Selector patterns

## Related Packages

- [@fukict/basic](../basic) - Core rendering engine
- [@fukict/router](../router) - SPA routing
- [@fukict/i18n](../i18n) - Internationalization

## License

MIT
