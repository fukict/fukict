# @fukict/vite-plugin

Official Vite plugin for Fukict framework.

## Features

- ✅ Zero-config setup
- ✅ TypeScript support (built-in)
- ✅ Auto component wrapping with `defineFukict`
- ✅ JSX to hyperscript transformation
- ✅ Development mode enhancements
- ✅ Source map support

## Installation

```bash
pnpm add -D @fukict/vite-plugin
pnpm add @fukict/basic
```

## Usage

### Basic Setup

**vite.config.ts**:

```typescript
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukict()],
});
```

That's it! The plugin will automatically:

1. Transform JSX to `hyperscript()` calls
2. Auto-wrap components with `defineFukict()`
3. Handle TypeScript syntax
4. Inject `displayName` in development mode

### With Options

```typescript
import fukict from '@fukict/vite-plugin';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    fukict({
      // Include patterns (default: /\.[jt]sx$/)
      include: /\.[jt]sx$/,

      // Exclude patterns (default: /node_modules/)
      exclude: /node_modules/,

      // Babel options
      babel: {
        // Development mode (default: NODE_ENV !== 'production')
        development: true,

        // TypeScript support (default: true)
        typescript: true,
      },
    }),
  ],
});
```

## Options

### `include`

**Type**: `RegExp | RegExp[]`
**Default**: `/\.[jt]sx$/`

Files to include for transformation.

**Example**:

```typescript
fukict({
  include: [/\.tsx$/, /\.jsx$/],
});
```

### `exclude`

**Type**: `RegExp | RegExp[]`
**Default**: `/node_modules/`

Files to exclude from transformation.

**Example**:

```typescript
fukict({
  exclude: [/node_modules/, /\.spec\.tsx$/],
});
```

### `babel.development`

**Type**: `boolean`
**Default**: `process.env.NODE_ENV !== 'production'`

Enable development mode features (like `displayName` injection).

### `babel.typescript`

**Type**: `boolean`
**Default**: `true`

Enable TypeScript support.

## How It Works

The plugin uses `@fukict/babel-preset` under the hood to transform your code:

```tsx
// Input
const Greeting = ({ name }) => <div>Hello {name}</div>;

// Output
import { defineFukict, hyperscript } from '@fukict/basic';

const Greeting = defineFukict(({ name }) =>
  hyperscript('div', null, ['Hello ', name])
);
Greeting.displayName = 'Greeting'; // in development mode
```

## TypeScript Configuration

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic"
  }
}
```

## Examples

### Basic Counter

```tsx
// src/Counter.tsx
export const Counter = () => {
  let count = 0;

  const increment = () => {
    count++;
    // Re-render logic here
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button on:click={increment}>+</button>
    </div>
  );
};
```

### With Class Component

```tsx
import { Fukict } from '@fukict/basic';

export class Timer extends Fukict<{}> {
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

## FAQ

### Q: Do I need to manually configure Babel?

**A**: No! The plugin automatically configures everything for you.

### Q: Can I use this with other Vite plugins?

**A**: Yes, just add it to the `plugins` array along with other plugins.

### Q: Does it work with TypeScript?

**A**: Yes, TypeScript support is built-in and enabled by default.

### Q: How do I disable auto component wrapping?

**A**: Use the `@nofukict` comment:

```tsx
/** @nofukict */
const MyFunction = () => <div />;
```

## Troubleshooting

### JSX not transforming

**Check**:

1. File extension is `.jsx` or `.tsx`
2. `tsconfig.json` has `"jsx": "preserve"`
3. Plugin is added to Vite config

### TypeScript errors

**Check**:

1. `@fukict/basic` is installed
2. `jsxImportSource` is set to `"@fukict/basic"`
3. TypeScript version >= 5.0.0

## Related Packages

- **@fukict/basic** - Fukict runtime (required)
- **@fukict/babel-preset** - Babel preset (used internally)

## License

MIT
