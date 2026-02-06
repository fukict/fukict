# Fukict Flux Example

This example demonstrates the usage of `@fukict/flux` - a minimal state management library for Fukict framework.

## Features Demonstrated

### 1. Counter Example

- **Basic flux usage** with simple state management
- Action dispatching
- Component lifecycle integration (subscribe/unsubscribe)
- Async actions

### 2. Todo List Example

- **Complex state management** with arrays
- CRUD operations (Create, Read, Update, Delete)
- Selector usage for computed values
- Filter and statistics

### 3. User Profile Example

- **Nested object state**
- Async actions (simulated login)
- Settings management
- Selector subscription pattern (commented example)

## Key Concepts

### State Management Pattern

```typescript
// 1. Create store with defineStore
const counterStore = defineStore({
  scope: 'counter',
  state: { count: 0 },
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
  },
});

// 2. Subscribe in component
class MyComponent extends Fukict {
  mounted() {
    this.unsubscribe = counterStore.subscribe(() => {
      this.update(); // Trigger re-render
    });
  }

  beforeUnmount() {
    this.unsubscribe();
  }
}

// 3. Use state and actions in render
render() {
  const { count } = counterStore.state;
  return <div>{count}</div>;
}
```

### Subscription Best Practices

Based on Fukict's top-down update mechanism:

1. **Top-level subscription**: Subscribe at the root/layout component level

   ```
   App (subscribe to globalStore) ✅
   ├── Header (read state, no subscription)
   └── Content (read state, no subscription)
   ```

2. **Sibling subscriptions**: Different components subscribe to different stores

   ```
   App
   ├── CounterPanel (subscribe to counterStore) ✅
   ├── TodoPanel (subscribe to todoStore) ✅
   └── UserPanel (subscribe to userStore) ✅
   ```

3. **Detached subscriptions**: Use `fukict:detach` for independent updates
   ```typescript
   <IndependentWidget fukict:detach={true} />
   ```

### Proxy Protection

Flux uses Proxy to prevent direct state mutation:

```typescript
const state = store.state;
state.count = 100; // ❌ Warning in dev mode
// [Flux] Direct state mutation is not allowed. Please use setState() method.

// ✅ Correct way
store.actions.setCount(100);
```

## Running the Example

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── stores/
│   ├── counterStore.ts    # Simple counter state
│   ├── todoStore.ts       # Todo list with selectors
│   └── userStore.ts       # User profile with async
├── components/
│   ├── CounterComponent.tsx
│   ├── TodoComponent.tsx
│   └── UserComponent.tsx
├── App.tsx                # Main app component
└── main.ts                # Entry point
```

## Learn More

- [Flux Design Document](../../packages/flux/docs/DESIGN.md)
- [Fukict Basic](../../packages/basic/README.md)
- [Fukict Documentation](../../README.md)
