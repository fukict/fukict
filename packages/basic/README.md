# @fukict/basic

Lightweight DOM rendering engine with compile-time optimization and zero dependencies.

## Features

- **Lightweight**: Core rendering engine with minimal overhead
- **VNode System**: Virtual DOM with efficient diff algorithm
- **Component Model**: Both class and function components
- **Lifecycle Hooks**: Full lifecycle management (mounted, beforeUnmount, etc.)
- **Refs Management**: Component and DOM element references
- **Slots System**: Children composition with named slots
- **Event Handling**: Optimized event delegation with `on:` prefix
- **TypeScript**: Complete type definitions with excellent IDE support
- **Zero Dependencies**: No external runtime dependencies

## Installation

```bash
pnpm add @fukict/basic
pnpm add -D @fukict/babel-preset @fukict/vite-plugin
```

## Quick Start

### Vite Setup

```typescript
// vite.config.ts
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukict()],
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic"
  }
}
```

## Component Types

### Class Components

Extend `Fukict` for components with lifecycle and state:

```tsx
import { Fukict } from '@fukict/basic';

interface CounterProps {
  initial?: number;
}

class Counter extends Fukict<CounterProps> {
  private count = this.props.initial ?? 0;
  private timer?: number;

  increment = () => {
    this.count++;
    this.update(this.props);
  };

  mounted() {
    console.log('Component mounted');
    this.timer = setInterval(this.increment, 1000);
  }

  beforeUnmount() {
    console.log('Component will unmount');
    clearInterval(this.timer);
  }

  render() {
    return (
      <div>
        <p>Count: {this.count}</p>
        <button on:click={this.increment}>Increment</button>
      </div>
    );
  }
}
```

### Function Components

Use `defineFukict()` for simple, stateless components:

```tsx
import { defineFukict } from '@fukict/basic';

interface GreetingProps {
  name: string;
  age?: number;
}

const Greeting = defineFukict<GreetingProps>(({ name, age }) => (
  <div>
    <h1>Hello {name}!</h1>
    {age && <p>You are {age} years old</p>}
  </div>
));
```

## Core API

### Rendering

```tsx
import { attach, replaceNode, unmount } from '@fukict/basic';

// Attach component to DOM
const vnode = attach(<App />, document.getElementById('app')!);

// Replace component
replaceNode(<NewApp />, vnode);

// Unmount component
unmount(vnode);
```

### VNode Creation

```tsx
import { h, hyperscript, Fragment } from '@fukict/basic';

// Using JSX (recommended)
const element = <div class="container">Content</div>;

// Using hyperscript
const element = h('div', { class: 'container' }, ['Content']);

// Fragment
const list = (
  <Fragment>
    <li>Item 1</li>
    <li>Item 2</li>
  </Fragment>
);
```

### Event Handling

Use `on:` prefix for event listeners:

```tsx
class Form extends Fukict {
  private value = '';

  handleInput = (e: Event) => {
    this.value = (e.target as HTMLInputElement).value;
    this.update(this.props);
  };

  handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Submitted:', this.value);
  };

  render() {
    return (
      <form on:submit={this.handleSubmit}>
        <input on:input={this.handleInput} value={this.value} />
        <button type="submit">Submit</button>
      </form>
    );
  }
}
```

### Refs

**Component Refs** with `fukict:ref`:

```tsx
class Parent extends Fukict {
  private childRef?: Counter;

  mounted() {
    // Access child component instance
    console.log('Child count:', this.childRef?.count);
  }

  render() {
    return (
      <div>
        <Counter fukict:ref={el => (this.childRef = el)} />
        <button on:click={() => this.childRef?.increment()}>
          Increment from parent
        </button>
      </div>
    );
  }
}
```

**DOM Refs** with `ref`:

```tsx
class AutoFocusInput extends Fukict {
  private inputRef?: HTMLInputElement;

  mounted() {
    this.inputRef?.focus();
  }

  render() {
    return <input ref={el => (this.inputRef = el)} />;
  }
}
```

### Slots (Children)

```tsx
interface CardProps {
  title: string;
  footer?: string;
}

class Card extends Fukict<CardProps> {
  render() {
    return (
      <div class="card">
        <div class="card-header">
          <h2>{this.props.title}</h2>
        </div>
        <div class="card-body">{this.slots.default}</div>
        {this.props.footer && (
          <div class="card-footer">{this.props.footer}</div>
        )}
      </div>
    );
  }
}

// Usage
<Card title="My Card" footer="Card footer">
  <p>This is the card content</p>
  <button>Action</button>
</Card>;
```

### Detached Rendering

Use `fukict:detach` to prevent component from being re-rendered when parent updates:

```tsx
class Parent extends Fukict {
  private count = 0;

  increment = () => {
    this.count++;
    this.update(this.props);
  };

  render() {
    return (
      <div>
        <p>Parent count: {this.count}</p>
        {/* This component won't re-render when parent updates */}
        <ExpensiveComponent fukict:detach={true} />
        <button on:click={this.increment}>Increment</button>
      </div>
    );
  }
}
```

## Lifecycle Hooks

```tsx
class LifecycleDemo extends Fukict {
  // Called after component is mounted to DOM
  mounted() {
    console.log('Mounted');
  }

  // Called before component is removed from DOM
  beforeUnmount() {
    console.log('Before unmount');
  }

  // Called after component updates
  updated() {
    console.log('Updated');
  }

  render() {
    return <div>Lifecycle Demo</div>;
  }
}
```

## Advanced Features

### Component Update Control

```tsx
class OptimizedComponent extends Fukict<{ data: string }> {
  // Manually trigger updates
  handleChange = () => {
    // Update with new props
    this.update({ data: 'new data' });
  };

  render() {
    return (
      <div>
        <p>{this.props.data}</p>
        <button on:click={this.handleChange}>Change</button>
      </div>
    );
  }
}
```

### DOM Utilities

```tsx
import {
  createRealNode,
  getAllDomNodes,
  getFirstDomNode,
  isDomArray,
  isVNode,
  normalizeDom,
} from '@fukict/basic';

// Create DOM node from VNode
const vnode = <div>Hello</div>;
const domNode = createRealNode(vnode);

// Get DOM nodes from VNode
const firstNode = getFirstDomNode(vnode);
const allNodes = getAllDomNodes(vnode);

// Type checks
if (isVNode(value)) {
  // value is a VNode
}

if (isDomArray(nodes)) {
  // nodes is an array of DOM elements
}
```

### Type Definitions

```tsx
import type {
  CSSProperties,
  ClassComponentVNode,
  ElementVNode,
  FukictComponent,
  FukictProps,
  FunctionComponentVNode,
  HTMLAttributes,
  SVGAttributes,
  VNode,
} from '@fukict/basic';

// Custom component props
interface MyComponentProps extends FukictProps {
  title: string;
  count: number;
  onClick?: (e: MouseEvent) => void;
}

// Custom element with specific attributes
type ButtonElement = ElementVNode & {
  props: HTMLAttributes & {
    type?: 'button' | 'submit' | 'reset';
  };
};
```

## Performance Tips

1. **Use `fukict:detach`** for components that don't need to react to parent updates
2. **Minimize renders** by only calling `update()` when necessary
3. **Reuse components** instead of recreating them
4. **Event handlers** are automatically optimized with event delegation
5. **Refs** provide direct access to avoid unnecessary queries

## Best Practices

### Component Organization

```tsx
// ✅ Good: Separate concerns
class TodoList extends Fukict<{ items: Todo[] }> {
  render() {
    return (
      <ul>
        {this.props.items.map(item => (
          <TodoItem item={item} />
        ))}
      </ul>
    );
  }
}

// ❌ Bad: Too much in one component
class TodoApp extends Fukict {
  render() {
    return <div>{/* Everything in one component */}</div>;
  }
}
```

### Event Handlers

```tsx
// ✅ Good: Arrow function as class property
class Button extends Fukict {
  handleClick = () => {
    console.log('Clicked');
  };

  render() {
    return <button on:click={this.handleClick}>Click</button>;
  }
}

// ❌ Bad: Creates new function on every render
class Button extends Fukict {
  render() {
    return <button on:click={() => console.log('Clicked')}>Click</button>;
  }
}
```

### Refs Usage

```tsx
// ✅ Good: Use refs for direct DOM access
class Form extends Fukict {
  private inputRef?: HTMLInputElement;

  focus() {
    this.inputRef?.focus();
  }

  render() {
    return <input ref={(el) => (this.inputRef = el)} />;
  }
}

// ❌ Bad: Query DOM manually
class Form extends Fukict {
  focus() {
    document.querySelector('input')?.focus(); // Don't do this
  }

  render() {
    return <input />;
  }
}
```

## Examples

See the [examples](../../examples) directory for complete examples:

- [Basic usage](../../examples/basic-vite)
- [Router integration](../../examples/infra-router)
- [State management](../../examples/infra-flux)
- [Complete app](../../examples/complete)

## Related Packages

- [@fukict/babel-preset](../babel-preset) - JSX transformation (required)
- [@fukict/vite-plugin](../vite-plugin) - Vite integration (recommended)
- [@fukict/router](../router) - SPA routing
- [@fukict/flux](../flux) - State management
- [@fukict/i18n](../i18n) - Internationalization

## License

MIT
