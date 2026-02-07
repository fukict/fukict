# @fukict/flux

Minimal state management library for Fukict framework with Flux pattern and reactive subscriptions.

## Features

- **Minimal API**: Simple `defineStore()` factory function
- **Reactive Subscriptions**: Subscribe to state changes with automatic updates
- **Selector Pattern**: Subscribe to derived/computed values
- **Type-Safe**: Full TypeScript support with type inference
- **Action Pattern**: Organized state mutations through sync and async actions
- **Dev Mode Protection**: Prevents direct state mutation in development
- **DevTools Integration**: Built-in support for Fukict DevTools via `scope`
- **Zero Dependencies**: No external dependencies

## Installation

```bash
pnpm add @fukict/flux
```

## Quick Start

### Basic Counter Example

```tsx
import { Fukict } from '@fukict/basic';
import { defineStore } from '@fukict/flux';

// Create store
const counterStore = defineStore({
  scope: 'counter',
  state: {
    count: 0,
  },
  actions: {
    increment: state => ({ count: state.count + 1 }),
    decrement: state => ({ count: state.count - 1 }),
    setCount: (_state, value: number) => ({ count: value }),
  },
});

// Use in component
class Counter extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to state changes
    this.unsubscribe = counterStore.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    // Clean up subscription
    this.unsubscribe?.();
  }

  render() {
    const { count } = counterStore.state;

    return (
      <div>
        <p>Count: {count}</p>
        <button on:click={() => counterStore.actions.increment()}>+</button>
        <button on:click={() => counterStore.actions.decrement()}>-</button>
      </div>
    );
  }
}
```

## Core Concepts

### Creating a Store

```typescript
import { defineStore } from '@fukict/flux';

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const todoStore = defineStore({
  scope: 'todo',
  state: {
    todos: [],
    filter: 'all',
  } as TodoState,
  actions: {
    addTodo: (state, text: string) => ({
      todos: [...state.todos, { id: Date.now(), text, completed: false }],
    }),
    toggleTodo: (state, id: number) => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    }),
    setFilter: (_state, filter: TodoState['filter']) => ({ filter }),
  },
});
```

### Subscribing to State

```tsx
class TodoList extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // Subscribe to all state changes
    this.unsubscribe = todoStore.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { todos } = todoStore.state;
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
    this.unsubscribe = todoStore.subscribe(
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
    const visibleTodos = visibleTodosSelector(todoStore.getState());
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
const userStore = defineStore({
  scope: 'user',
  state: {
    user: null as User | null,
    loading: false,
    error: null as string | null,
  },
  asyncActions: {
    async login(ctx, email: string, password: string) {
      ctx.setState({ loading: true, error: null });

      try {
        const user = await api.login(email, password);
        ctx.setState({ user, loading: false });
      } catch (error) {
        ctx.setState({
          error: error.message,
          loading: false,
        });
      }
    },
  },
  actions: {
    logout: () => ({ user: null }),
  },
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
    this.unsubscribe = globalStore.subscribe(() => {
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
        <CounterPanel /> {/* Subscribes to counterStore */}
        <TodoPanel /> {/* Subscribes to todoStore */}
        <UserPanel /> {/* Subscribes to userStore */}
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
const store = defineStore({
  scope: 'example',
  state: { count: 0 },
  actions: {
    // ✅ Good: Return partial state
    increment: state => ({ count: state.count + 1 }),
  },
});

// ❌ Bad: Direct mutation (warning in dev mode)
const state = store.state;
state.count++; // Warning: [Flux] Direct state mutation is not allowed
```

## Advanced Usage

### Multiple Stores

```typescript
// User store
const userStore = defineStore({
  scope: 'user',
  state: { user: null },
  actions: {
    setUser: (_state, user: User) => ({ user }),
  },
});

// Settings store
const settingsStore = defineStore({
  scope: 'settings',
  state: { theme: 'light', language: 'en' },
  actions: {
    setTheme: (_state, theme: string) => ({ theme }),
    setLanguage: (_state, language: string) => ({ language }),
  },
});

// Use both in component
class Profile extends Fukict {
  private unsubscribeUser?: () => void;
  private unsubscribeSettings?: () => void;

  mounted() {
    this.unsubscribeUser = userStore.subscribe(() => this.update(this.props));
    this.unsubscribeSettings = settingsStore.subscribe(() =>
      this.update(this.props)
    );
  }

  beforeUnmount() {
    this.unsubscribeUser?.();
    this.unsubscribeSettings?.();
  }

  render() {
    const { user } = userStore.state;
    const { theme } = settingsStore.state;
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
    this.unsubscribe = todoStore.subscribe(statsSelector, (stats) => {
      console.log('Stats changed:', stats);
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const stats = statsSelector(todoStore.getState());
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

## API Reference

### defineStore(config)

Creates a new store.

```typescript
const store = defineStore({
  scope: 'my-store', // Required: unique identifier for DevTools
  state: initialState,
  actions: {
    // Sync actions: (state, ...args) => Partial<State>
    actionName: (state, ...args) => ({
      /* partial state */
    }),
  },
  asyncActions: {
    // Async actions: (ctx, ...args) => Promise<void>
    async asyncAction(ctx, ...args) {
      ctx.setState({
        /* partial state */
      });
    },
  },
});
```

### store.state

Current state (readonly, protected from mutation in dev mode).

```typescript
const { count } = store.state;
```

### store.getState()

Returns current state snapshot (readonly).

```typescript
const state = store.getState();
console.log(state.count);
```

### store.setState(partial)

Updates state with partial state object.

```typescript
store.setState({ count: 10 });
```

### store.actions

Wrapped sync actions (state parameter is automatically injected).

```typescript
store.actions.increment();
store.actions.add(5);
```

### store.asyncActions

Wrapped async actions (context parameter is automatically injected).

```typescript
await store.asyncActions.fetchUser('123');
```

### store.subscribe(listener)

Subscribes to all state changes.

```typescript
const unsubscribe = store.subscribe(() => {
  console.log('State changed');
});

// Clean up
unsubscribe();
```

### store.subscribe(selector, listener)

Subscribes to selector changes (only triggers when selector result changes).

```typescript
const unsubscribe = store.subscribe(
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
const userStore = defineStore({
  scope: 'user',
  state: { user: null, preferences: {} },
  actions: {
    logout: () => ({ user: null }),
    updatePreference: (state, key: string, value: any) => ({
      preferences: { ...state.preferences, [key]: value },
    }),
    resetPreferences: () => ({ preferences: {} }),
  },
  asyncActions: {
    async login(ctx, credentials: Credentials) {
      /* ... */
    },
  },
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
  const state = store.getState();
  const result = state.items.filter(/*...*/).map(/*...*/).reduce(/*...*/);
}
```

### 3. Clean Up Subscriptions

```tsx
// ✅ Good: Always clean up
class MyComponent extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = store.subscribe(() => this.update(this.props));
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
    this.unsubscribe = store.subscribe(() => this.update(this.props));
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
    const state = store.state; // Just read
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
