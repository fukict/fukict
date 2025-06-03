# @vanilla-dom/babel-plugin

Babel plugin for transforming JSX into @vanilla-dom/core function calls.

## Installation

```bash
npm install --save-dev @vanilla-dom/babel-plugin
# or
pnpm add -D @vanilla-dom/babel-plugin
# or
yarn add -D @vanilla-dom/babel-plugin
```

## Usage

### Basic Setup

Add the plugin to your Babel configuration:

```json
{
  "plugins": ["@vanilla-dom/babel-plugin"]
}
```

### With Options

```json
{
  "plugins": [
    [
      "@vanilla-dom/babel-plugin",
      {
        "importSource": "@vanilla-dom/core",
        "development": false
      }
    ]
  ]
}
```

## Options

- **`importSource`** (string, default: `"@vanilla-dom/core"`): The module to import hyperscript and Fragment from
- **`development`** (boolean, default: `false`): Enable development mode features (reserved for future use)

## Transformation Examples

### Basic Elements

**Input:**

```jsx
<div className="container">Hello World</div>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript('div', { className: 'container' }, null, 'Hello World');
```

### Custom Components

**Input:**

```jsx
<MyComponent prop="value">
  <span>Child</span>
</MyComponent>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript(
  MyComponent,
  { prop: 'value' },
  null,
  hyperscript('span', null, null, 'Child'),
);
```

### Fragments

**Input:**

```jsx
<>
  <div>First</div>
  <div>Second</div>
</>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript(
  Fragment,
  null,
  null,
  hyperscript('div', null, null, 'First'),
  hyperscript('div', null, null, 'Second'),
);
```

### Props and Expressions

**Input:**

```jsx
<button onClick={handleClick} disabled={isDisabled}>
  {buttonText}
</button>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript(
  'button',
  {
    onClick: handleClick,
    disabled: isDisabled,
  },
  null,
  buttonText,
);
```

### Event Syntax (on: prefix)

**Input:**

```jsx
<button on:click={handleClick} className="btn">
  Click me
</button>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript('button', { className: 'btn' }, { click: handleClick }, 'Click me');
```

### Spread Attributes

**Input:**

```jsx
<div {...props} className="extra">
  Content
</div>
```

**Output:**

```javascript
import { Fragment, hyperscript } from '@vanilla-dom/core';

hyperscript('div', { ...props, className: 'extra' }, null, 'Content');
```

## Integration with Build Tools

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'hyperscript',
    jsxFragment: 'Fragment',
  },
  plugins: [
    // ... other plugins
  ],
  babel: {
    plugins: ['@vanilla-dom/babel-plugin'],
  },
});
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['@vanilla-dom/babel-plugin'],
          },
        },
      },
    ],
  },
};
```

### Rollup

```javascript
// rollup.config.js
import babel from '@rollup/plugin-babel';

export default {
  plugins: [
    babel({
      plugins: ['@vanilla-dom/babel-plugin'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
  ],
};
```

## TypeScript Support

The plugin works seamlessly with TypeScript. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm run build

# Run tests
pnpm run test

# Watch mode for development
pnpm run dev
```

## License

MIT
