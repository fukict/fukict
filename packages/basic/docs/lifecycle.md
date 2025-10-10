# Lifecycle Hooks

Class components support lifecycle hooks for side effects.

## Available Hooks

### mounted()

Called after component is mounted to DOM.

**Use for**:

- DOM manipulation
- Event listeners
- Data fetching
- Animations

**Example**:

```typescript
class MyComponent extends Fukict<{}> {
  mounted() {
    console.log('Component mounted');
    window.addEventListener('resize', this.handleResize);
  }
}
```

### beforeUnmount()

Called before component is unmounted from DOM.

**Use for**:

- Cleanup
- Remove event listeners
- Cancel timers
- Unsubscribe

**Example**:

```typescript
class MyComponent extends Fukict<{}> {
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    clearInterval(this.timerId);
  }
}
```

### updated(prevProps)

Called after component is updated (props changed or self-update).

**Use for**:

- React to prop changes
- Update DOM based on new state
- Side effects after render

**Example**:

```typescript
class MyComponent extends Fukict<{ userId: string }> {
  updated(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUserData(this.props.userId);
    }
  }
}
```

## Lifecycle Flow

### Initial Mount

```typescript
// 1. new MyComponent(props, children)
//    → constructor() called
//    → render() called (initial VNode)

// 2. instance.mount(container)
//    → __container__ set
//    → mounted() called ✅
```

### Props Update (Normal)

```typescript
// 1. instance.update(newProps)
//    → props updated
//    → render() called
//    → diff/patch performed
//    → updated(prevProps) called ✅
```

### Props Update (Detached)

```typescript
// 1. Check fukict:detach
//    → props updated
//    → update() NOT called ❌
//    → updated() NOT called ❌
```

### Self Update

```typescript
// 1. User calls this.update(this.props)
//    → Same as props update
//    → updated(prevProps) called ✅
```

### Unmount

```typescript
// 1. instance.unmount()
//    → beforeUnmount() called ✅
//    → refs cleaned up
//    → __vnode__ = null
//    → __container__ = null
```

## Refs Management

Refs are automatically cleaned up on unmount.

```typescript
class MyComponent extends Fukict<{}> {
  constructor(props, children) {
    super(props, children);

    // Store refs in this.refs Map
    this.refs.set('input', { current: null });
  }

  mounted() {
    // Use refs
    const inputRef = this.refs.get('input');
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }

  render() {
    return <input ref={this.refs.get('input')} />;
  }

  // Refs automatically cleaned on unmount
}
```

## Best Practices

### DO

- Clean up in `beforeUnmount()`
- Use `updated()` to react to prop changes
- Store refs in `this.refs` Map

### DON'T

- Don't perform side effects in `render()`
- Don't forget to clean up event listeners
- Don't modify props directly

---

**Related**: [Component Design](./component-design.md) | [Diff/Patch](./diff-patch.md)
