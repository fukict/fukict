# Component Design

## Class Component (Fukict)

Stateful, lifecycle, props-driven update with built-in diff.

### Example

```typescript
class Counter extends Fukict<{ initial: number }> {
  private count: number;

  constructor(props, children) {
    super(props, children);
    this.count = props.initial;
    // Constructor calls render() to initialize _render
  }

  increment() {
    this.count++;
    // Self-update: trigger re-render
    this.update(this.props);
  }

  render() {
    return <div on:click={() => this.increment()}>{this.count}</div>;
  }

  mounted() { /* after mount */ }
  beforeUnmount() { /* before unmount */ }
  updated(prevProps) { /* after update */ }
}
```

### Features

- **Props-driven**: `update(newProps)` called by renderer
- **Self-update**: Call `this.update(this.props)` to re-render
- **Built-in diff**: `update()` includes diff/patch logic
- **User override**: Override `update()` for custom logic
- **Detached mode**: `fukict:detach` skips renderer updates
- **Instance managed**: `_render` and DOM handled internally

### Detached Rendering

```typescript
// JSX declaration
<MyComponent fukict:detach />

// Renderer behavior
if (props['fukict:detach']) {
  // Props updated, but update() NOT called
  instance.props = newProps;
}
```

**Use cases**:

- Static content
- Performance optimization
- Manual update control

**Behavior**:

- Props are updated (instance has latest props)
- `update()` NOT called (no re-render)
- User can still call `this.update(this.props)`

### Custom Update Logic

```typescript
class OptimizedComponent extends Fukict<{ data: string }> {
  update(newProps) {
    // shouldUpdate logic
    if (newProps.data === this.props.data) return;
    super.update(newProps);
  }
}
```

## Function Component

Stateless, no lifecycle, props-driven only.

### Example

```typescript
const Greeting = defineFukict(({ name }) => (
  <div>Hello {name}</div>
));
```

### Features

- Pure function, no side effects
- Cannot self-update (parent-only)
- Shallow props comparison
- Result saved to `__render__`
- `__node__` follows from `__render__.__node__`

## Comparison

| Feature         | Class Component         | Function Component    |
| --------------- | ----------------------- | --------------------- |
| State           | ✅ Internal state       | ❌ Stateless          |
| Lifecycle       | ✅ Hooks available      | ❌ No lifecycle       |
| Self-update     | ✅ `this.update(props)` | ❌ Parent-only        |
| Props update    | ✅ Built-in diff        | ✅ Shallow compare    |
| Refs            | ✅ `this.refs` Map      | ❌ N/A                |
| Slots           | ✅ `this.slots`         | ❌ N/A                |
| Detached        | ✅ `fukict:detach`      | ❌ N/A                |
| Override update | ✅ Can override         | ❌ N/A                |
| Performance     | Medium (diff overhead)  | Low (shallow compare) |
| Use case        | Stateful, complex UI    | Simple, display-only  |

---

**Related**: [VNode System](./vnode-system.md) | [Lifecycle](./lifecycle.md) | [Diff/Patch](./diff-patch.md)
