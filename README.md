# Fukict

A lightweight DOM rendering library focused on performance-critical scenarios.

## Features

- **Lightweight**: < 10KB gzipped
- **High Performance**: Optimized for frequent DOM operations
- **Compile-time Optimization**: JSX transformation at build time reduces runtime overhead
- **TypeScript**: Full type support with excellent IDE experience
- **Modular**: Choose only what you need - core, router, state management, i18n
- **Progressive**: Integrate into existing projects incrementally

## Quick Start

### Installation

```bash
# Core packages
pnpm add @fukict/basic @fukict/babel-preset
pnpm add -D @fukict/vite-plugin

# Optional packages
pnpm add @fukict/router    # SPA routing
pnpm add @fukict/flux      # State management
pnpm add @fukict/i18n      # Internationalization
```

### Vite Setup

```typescript
// vite.config.ts
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukict()],
});
```

### Basic Usage

```tsx
import { Fukict, attach } from '@fukict/basic';

class Counter extends Fukict<{}> {
  private count = 0;

  increment = () => {
    this.count++;
    this.update(this.props);
  };

  render() {
    return (
      <div>
        <p>Count: {this.count}</p>
        <button on:click={this.increment}>Increment</button>
      </div>
    );
  }
}

attach(<Counter />, document.getElementById('app')!);
```

## Packages

### Core Packages

| Package                                         | Version                                                                                                             | Description                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [@fukict/basic](./packages/basic)               | [![npm](https://img.shields.io/npm/v/@fukict/basic.svg)](https://www.npmjs.com/package/@fukict/basic)               | Core rendering engine with VNode, lifecycle, and refs |
| [@fukict/babel-preset](./packages/babel-preset) | [![npm](https://img.shields.io/npm/v/@fukict/babel-preset.svg)](https://www.npmjs.com/package/@fukict/babel-preset) | Zero-config Babel preset for JSX transformation       |
| [@fukict/vite-plugin](./packages/vite-plugin)   | [![npm](https://img.shields.io/npm/v/@fukict/vite-plugin.svg)](https://www.npmjs.com/package/@fukict/vite-plugin)   | Official Vite plugin                                  |

### Extension Packages

| Package                             | Version                                                                                                 | Description                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [@fukict/router](./packages/router) | [![npm](https://img.shields.io/npm/v/@fukict/router.svg)](https://www.npmjs.com/package/@fukict/router) | SPA routing with nested routes and lazy loading |
| [@fukict/flux](./packages/flux)     | [![npm](https://img.shields.io/npm/v/@fukict/flux.svg)](https://www.npmjs.com/package/@fukict/flux)     | Minimal state management with Flux pattern      |
| [@fukict/i18n](./packages/i18n)     | [![npm](https://img.shields.io/npm/v/@fukict/i18n.svg)](https://www.npmjs.com/package/@fukict/i18n)     | Type-safe internationalization                  |

## Architecture

```
┌─────────────────┐
│  @fukict/basic  │  ← Core rendering engine (no dependencies)
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼───┐  ┌───▼───┐  ┌───▼───┐
│ router│ │ flux │  │  i18n │  │ vite  │
└───────┘ └──────┘  └───────┘  │plugin │
                                └───┬───┘
                                    │
                            ┌───────▼────────┐
                            │  babel-preset  │
                            └────────────────┘
```

## Key Concepts

### Component Types

**Class Components** extend `Fukict`:

```tsx
import { Fukict } from '@fukict/basic';

class Timer extends Fukict<{}> {
  private count = 0;
  private timer?: number;

  mounted() {
    this.timer = setInterval(() => {
      this.count++;
      this.update(this.props);
    }, 1000);
  }

  beforeUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return <div>Timer: {this.count}</div>;
  }
}
```

**Function Components** use `defineFukict()`:

```tsx
import { defineFukict } from '@fukict/basic';

const Greeting = defineFukict(({ name }: { name: string }) => (
  <div>Hello {name}!</div>
));
```

### Event Handling

Use `on:` prefix for event handlers:

```tsx
<button on:click={() => console.log('clicked')}>Click Me</button>
<input on:input={(e) => console.log(e.target.value)} />
```

### Refs

**Component Refs** with `fukict:ref`:

```tsx
class Parent extends Fukict {
  // Type-safe refs declaration
  declare readonly refs: {
    child: ChildComponent;
  };

  mounted() {
    console.log('Child instance:', this.refs.child);
  }

  render() {
    return <ChildComponent fukict:ref="child" />;
  }
}
```

**DOM Refs**:

```tsx
class Form extends Fukict {
  private inputRef?: HTMLInputElement;

  focus = () => {
    this.inputRef?.focus();
  };

  render() {
    return <input ref={el => (this.inputRef = el)} />;
  }
}
```

### Slots (Children)

```tsx
class Card extends Fukict<{ title: string }> {
  render() {
    return (
      <div class="card">
        <h2>{this.props.title}</h2>
        <div class="card-body">{this.slots.default}</div>
      </div>
    );
  }
}

// Usage
<Card title="My Card">
  <p>This is the card content</p>
</Card>;
```

## Examples

Explore working examples in the [`examples/`](./examples) directory:

- **[infra-router](./examples/infra-router)** - Complete router example with nested routes, guards, and lazy loading
- **[infra-flux](./examples/infra-flux)** - State management examples with counter, todo list, and user profile
- **[complete](./examples/complete)** - Full-featured application combining all packages

## Use Cases

- **Performance-critical applications** (data visualization, game UI)
- **Frequent DOM updates** (tables, lists, real-time dashboards)
- **Precise rendering control** (animations, custom interactions)
- **Optimizing hot paths** in existing projects

## Development

### Build Packages

```bash
# Build all packages
pnpm build

# Watch mode for development
pnpm build:watch

# Build specific package
tsx scripts/build-package.ts --pkg-name basic --no-watch

# Watch specific packages
tsx scripts/build-package.ts --pkg-name basic router --watch
```

### Run Examples

```bash
# Router example
cd examples/infra-router && pnpm dev

# Flux example
cd examples/infra-flux && pnpm dev

# No-build example (uses pre-built dist files)
pnpm dev:no-build
# Then open http://localhost:8080/examples/no-build/
```

### Linting and Formatting

```bash
pnpm lint           # Check types and lint
pnpm lint:fix       # Auto-fix issues
pnpm format         # Format code with Prettier
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for contributors
- [Changesets Workflow](./.changeset) - Version management and releases

## Contributing

Contributions are welcome! Please read [CLAUDE.md](./CLAUDE.md) for development guidelines.

## License

MIT © [Fukict Team](https://github.com/fukict)
