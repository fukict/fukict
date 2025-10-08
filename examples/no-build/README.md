# No-Build Example

This example demonstrates using Fukict runtime with pure hyperscript calls, without any build step or JSX compilation.

## Features

- ✅ Pure ES modules (no bundler needed)
- ✅ Hyperscript API (`h` function)
- ✅ Event handling (`on:` prefix)
- ✅ Fragment support
- ✅ Style objects
- ✅ Reactive updates (manual)
- ✅ Component Handlers extension mechanism

## Running the Example

### Option 1: Simple HTTP Server

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server
```

Then open: http://localhost:8000/examples/no-build/

### Option 2: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## Code Structure

The example includes:

1. **Counter Component**: Simple stateful counter with increment/decrement
2. **TodoList Component**: Interactive todo list with add/toggle/remove
3. **Fragment**: Demonstrates multiple root elements

## Key Concepts

### Hyperscript API

```javascript
import { h, render } from '@fukict/runtime';

// Create VNode
const vnode = h(
  'div',
  { class: 'container' },
  h('h1', null, 'Hello'),
  h('p', null, 'World'),
);

// Render to DOM
render(vnode, document.getElementById('app'));
```

### Event Handling

```javascript
h(
  'button',
  {
    'on:click': () => console.log('clicked'),
  },
  'Click me',
);
```

### Style Objects

```javascript
h(
  'div',
  {
    style: {
      color: 'red',
      fontSize: '16px',
    },
  },
  'Styled text',
);
```

### Fragments

```javascript
import { Fragment } from '@fukict/runtime';

h(Fragment, null, h('div', null, 'First'), h('div', null, 'Second'));
```

## Next Steps

- See widget examples for component-based architecture
- Check JSX examples for declarative syntax
- Explore router integration examples
