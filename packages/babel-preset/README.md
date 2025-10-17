# @fukict/babel-preset

Zero-config Babel preset for Fukict with automatic component wrapping and JSX compilation.

## Features

- **Zero Configuration**: Just add the preset, no extra setup needed
- **Auto Component Wrapping**: Automatically wraps function components with `defineFukict`
- **Built-in JSX Transform**: Compiles JSX to hyperscript calls
- **Development Mode**: Injects `displayName` for better debugging

## Installation

```bash
pnpm add -D @fukict/babel-preset @babel/core
pnpm add @fukict/basic
```

## Usage

### babel.config.js

```javascript
module.exports = {
  presets: ['@fukict/babel-preset'],
};
```

### .babelrc.json

```json
{
  "presets": ["@fukict/babel-preset"]
}
```

## What it does

### Auto Component Wrapping

Automatically wraps uppercase-named arrow functions that return JSX:

```tsx
// Input
const Greeting = ({ name }) => <div>Hello {name}</div>;

// Output
import { defineFukict } from '@fukict/basic';
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);
```

### JSX Transform

Transforms JSX to hyperscript calls with proper children arrays:

```tsx
// Input
<div class="container" on:click={handleClick}>
  Hello {name}
</div>;

// Output
hyperscript('div', { class: 'container', 'on:click': handleClick }, [
  'Hello ',
  name,
]);
```

**Component Type Detection:**

The preset generates simple `hyperscript()` calls. Component type detection (`__type__` field) is handled automatically at runtime by the `hyperscript` function:

- **Class components** (extends `Fukict`) → detected as `'class'`
- **Function components** → detected as `'function'`
- **DOM elements** (string tags) → detected as `'element'`
- **Fragment** → detected as `'fragment'`

This runtime detection ensures accurate type identification without compile-time analysis.

### Development Mode

In development mode (`NODE_ENV=development`), automatically injects `displayName`:

```tsx
// Input
const Greeting = ({ name }) => <div>Hello {name}</div>;

// Output (development)
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);
Greeting.displayName = 'Greeting';
```

## Opt-out

Use `@nofukict` comment to prevent auto-wrapping:

```tsx
/** @nofukict */
const helper = () => <div>Not a component</div>;
```

## Documentation

See [docs](./docs) for detailed documentation:

- [DESIGN.md](./docs/DESIGN.md) - Design decisions and architecture
- [API.md](./docs/API.md) - API reference
- [EXAMPLES.md](./docs/EXAMPLES.md) - Usage examples

## License

MIT
