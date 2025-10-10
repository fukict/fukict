# @fukict/basic Design Document

## Core Philosophy

**Built-in Everything, Zero Registration Overhead**

- Lightweight: < 5KB gzipped
- Built-in function and class components
- Direct VNode to DOM, no middleware
- Explicit update control via `__type__` field

## Package Responsibilities

@fukict/basic is a complete component rendering engine:

**Includes**:

- VNode creation (hyperscript / JSX)
- DOM rendering and updates
- Function components (stateless)
- Class components (stateful, lifecycle)
- Type-specific diff/patch algorithm
- Lifecycle hooks, Refs, Slots
- Detached rendering

**Not included**:

- State management (use `@fukict/flux`)
- Routing (use `@fukict/router`)
- Scheduler (use `@fukict/scheduler`)

## Documentation Structure

### Core Concepts

- **[VNode System](./vnode-system.md)** - Type system and `__type__` field design
- **[Component Design](./component-design.md)** - Class and Function components
- **[Diff/Patch](./diff-patch.md)** - Update mechanism for each VNode type
- **[Lifecycle](./lifecycle.md)** - Component lifecycle hooks

### Reference

- **[API](./API.md)** - Public API reference
- **[Examples](./EXAMPLES.md)** - Usage examples

## Quick Overview

### VNode Types

```typescript
export enum VNodeType {
  Element = 'element', // DOM elements
  Fragment = 'fragment', // Multiple roots
  FunctionComponent = 'function', // Stateless
  ClassComponent = 'class', // Stateful
}
```

**See**: [VNode System](./vnode-system.md)

### Class Component

```typescript
class Counter extends Fukict<{ initial: number }> {
  private count: number;

  constructor(props, children) {
    super(props, children);
    this.count = props.initial;
  }

  increment() {
    this.count++;
    this.update(this.props); // Self-update
  }

  render() {
    return <div on:click={() => this.increment()}>{this.count}</div>;
  }
}
```

**See**: [Component Design](./component-design.md)

### Update Flow

```typescript
// Element: patch props + diff children
// Fragment: diff children array
// Function: shallow compare props → re-call function
// Class: instance.update(newProps) → built-in diff
```

**See**: [Diff/Patch](./diff-patch.md)

## Size Target

- **Core (VNode + rendering)**: < 2KB
- **Function components**: < 1KB
- **Class components**: < 2KB
- **Total**: < 5KB gzipped

## Key Design Decisions

1. **`__type__` discriminated union**

   - Single field for type identification
   - TypeScript automatic type narrowing
   - Added at compile time by babel-plugin

2. **Built-in everything**

   - No registration overhead
   - Direct function calls
   - Minimal abstraction

3. **Props-driven update for Class**

   - `update(newProps)` has built-in diff
   - User can override for custom logic
   - Detached mode: props updated, no re-render

4. **Shallow compare for Function**

   - Skip re-render if props unchanged
   - Minimal overhead
   - Parent-driven only

5. **Lifecycle hooks**
   - `mounted()` - after mount
   - `beforeUnmount()` - before unmount
   - `updated(prevProps)` - after update

## Architecture Principles

### Separation of Concerns

```
types/         → Type definitions only
component-class/   → Runtime implementation
renderer/      → DOM rendering logic
utils/         → Shared utilities
```

### Type Safety

- Discriminated unions for VNode types
- Interface for Class components
- Compile-time type checking

### Performance

- Compile-time type annotation (zero runtime cost)
- Shallow props comparison (function components)
- Built-in diff (class components)
- Detached rendering (skip updates)

---

**Document Version**: v3.0
**Last Updated**: 2025-01-10
**Status**: Design complete, implementation in progress
