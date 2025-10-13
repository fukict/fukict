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

## New Features (v3.1)

### Context System

Pure, side-effect-free context for passing data down the component tree:

- **No Global State**: Context stored on VNode tree via `__context__`
- **Instance-based**: Each VNode carries its own context chain
- **Proxy-based Immutability**: Prevents child components from mutating context
- **Priority System**: Lower-level contexts override parent contexts
- **Unified API**: Same API for both function and class components

```typescript
// Create context
const ThemeContext = createContext({ mode: 'light' });

// Provide context
class App extends Fukict {
  mounted() {
    provideContext.call(this, ThemeContext, { mode: 'dark' });
  }
}

// Consume context
class Button extends Fukict {
  render() {
    const theme = getContext.call(this, ThemeContext);
    return <button style={`background: ${theme.mode === 'dark' ? '#000' : '#fff'}`} />;
  }
}
```

**See**: [Context System](./context-system.md)

### SVG Support

Complete SVG element and attribute support with full TypeScript type safety:

- **60+ SVG Elements**: All standard SVG elements (svg, path, circle, etc.)
- **CamelCase Attributes**: strokeWidth, viewBox, fillOpacity, etc.
- **Type Safety**: Full TypeScript intellisense and type checking
- **Presentation Attributes**: Complete SVG styling support
- **Filters & Gradients**: Full support for advanced SVG features
- **Animation**: SMIL animation elements support

```typescript
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="blue" strokeWidth="2" stroke="black" />
  <linearGradient id="grad">
    <stop offset="0%" stopColor="yellow" stopOpacity="1" />
  </linearGradient>
</svg>
```

## Documentation Structure

### Core Concepts

- **[VNode System](./vnode-system.md)** - Type system and `__type__` field design
- **[Component Design](./component-design.md)** - Class and Function components
- **[Diff/Patch](./diff-patch.md)** - Update mechanism for each VNode type
- **[Lifecycle](./lifecycle.md)** - Component lifecycle hooks
- **[Context System](./context-system.md)** - Context API and data flow

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

**Document Version**: v3.1
**Last Updated**: 2025-01-14
**Status**: Design complete with Context System and SVG support
