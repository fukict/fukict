# No-Build Examples

This directory contains examples demonstrating Fukict packages without any build step or JSX compilation.

## Available Examples

### 1. `runtime.html` - Runtime Package Demo

Demonstrates the core `@fukict/runtime` package:

- ✅ Pure ES modules (no bundler needed)
- ✅ Hyperscript API (`h` function)
- ✅ Event handling (`on:` prefix)
- ✅ Fragment support
- ✅ Style objects
- ✅ Component Handlers extension mechanism
- ✅ `replaceNode` for simple updates

**What you'll see:**

- Simple counter using `replaceNode`
- Todo list with `replaceNode` updates
- Custom component handler example

### 2. `widget.html` - Widget Package Demo

Demonstrates the `@fukict/widget` package with full component capabilities:

- ✅ Widget class components
- ✅ Lifecycle hooks (`onMounted`, `onBeforeUnmount`)
- ✅ High-performance diff/patch updates
- ✅ Refs management (`fukict:ref`)
- ✅ Slots system (`fukict:slot`)
- ✅ Detached rendering optimization (`fukict:detach`)
- ✅ Component state and methods

**What you'll see:**

- Counter Widget with lifecycle hooks
- Todo List Widget with refs for input focus
- Card Widget with header/footer slots
- Parent/Child with detached rendering optimization

## Running the Examples

**Prerequisites:** Make sure you've built the packages first:

```bash
# From project root
cd packages/runtime && npm run build
cd ../widget && npm run build
```

### Option 1: Simple HTTP Server

```bash
# From project root
cd examples/no-build

# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server
```

Then open:

- Runtime demo: http://localhost:8000/runtime.html
- Widget demo: http://localhost:8000/widget.html

### Option 2: VS Code Live Server

1. Install "Live Server" extension
2. Right-click `runtime.html` or `widget.html`
3. Select "Open with Live Server"

### Import Map

Both examples use [Import Maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) to resolve npm package names to local files:

```html
<script type="importmap">
  {
    "imports": {
      "@fukict/runtime": "/packages/runtime/dist/index.js",
      "@fukict/widget": "/packages/widget/dist/index.js"
    }
  }
</script>
```

This allows you to write clean imports in the script:

```javascript
import { h } from '@fukict/runtime';
import { Widget } from '@fukict/widget';
```

**Browser Support:** Import Maps are supported in all modern browsers (Chrome 89+, Safari 16.4+, Firefox 108+).

## Key Differences

### Runtime vs Widget

| Feature            | Runtime                           | Widget                            |
| ------------------ | --------------------------------- | --------------------------------- |
| **VNode creation** | ✅ `h()`                          | ✅ `h()` (inherited)              |
| **Initial render** | ✅ `render()`                     | ✅ `Widget.mount()`               |
| **Updates**        | ⚠️ `replaceNode()` (full rebuild) | ✅ `Widget.update()` (diff/patch) |
| **Lifecycle**      | ❌                                | ✅ `onMounted`, `onBeforeUnmount` |
| **Refs**           | ❌                                | ✅ `fukict:ref`                   |
| **Slots**          | ❌                                | ✅ `fukict:slot`                  |
| **Detached**       | ❌                                | ✅ `fukict:detach`                |
| **State**          | 📝 Manual                         | 📝 Manual (but with `update()`)   |

### When to Use Each

**Use Runtime (`@fukict/runtime`) when:**

- You need minimal bundle size (< 5KB)
- Building custom component systems
- Server-side rendering
- Static content with minimal interactivity

**Use Widget (`@fukict/widget`) when:**

- Building interactive applications
- Need component lifecycle management
- Want efficient updates (diff/patch)
- Need refs or slots functionality

## Code Examples

### Runtime Package - Hyperscript API

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

### Runtime Package - Event Handling

```javascript
h(
  'button',
  {
    'on:click': () => console.log('clicked'),
  },
  'Click me',
);
```

### Runtime Package - Updates with replaceNode

```javascript
import { h, replaceNode } from '@fukict/runtime';

let count = 0;
let rootNode = null;

function update() {
  const newVNode = h('div', null, `Count: ${count}`);
  if (rootNode) {
    rootNode = replaceNode(rootNode, newVNode);
  }
}

function increment() {
  count++;
  update();
}
```

### Widget Package - Basic Widget Class

```javascript
import { h } from '@fukict/runtime';
import { Widget } from '@fukict/widget';

class CounterWidget extends Widget {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.state.count++;
    this.update({}); // Trigger diff/patch
  };

  onMounted() {
    console.log('Widget mounted!');
  }

  render() {
    return h(
      'div',
      null,
      h('p', null, `Count: ${this.state.count}`),
      h('button', { 'on:click': this.increment }, 'Increment'),
    );
  }
}

// Mount widget
const widget = new CounterWidget({});
widget.mount(document.getElementById('app'));
```

### Widget Package - Using Refs

```javascript
class ParentWidget extends Widget {
  handleClick = () => {
    // Access child widget instance
    const childWidget = this.refs.get('myChild');
    if (childWidget) {
      childWidget.doSomething();
    }

    // Access DOM element
    const inputElement = this.refs.get('myInput');
    if (inputElement) {
      inputElement.focus();
    }
  };

  render() {
    return h(
      'div',
      null,
      // Ref to child widget
      h(ChildWidget, { 'fukict:ref': 'myChild' }),

      // Ref to DOM element
      h('input', { 'fukict:ref': 'myInput' }),

      h('button', { 'on:click': this.handleClick }, 'Focus Input'),
    );
  }
}
```

### Widget Package - Using Slots

```javascript
class CardWidget extends Widget {
  render() {
    const headerSlot = this.slots.get('header');
    const defaultSlot = this.slots.get('default');

    return h(
      'div',
      { class: 'card' },
      headerSlot ? h('div', { class: 'header' }, ...headerSlot) : null,
      h('div', { class: 'body' }, defaultSlot || []),
    );
  }
}

// Usage
h(
  CardWidget,
  null,
  h('h3', { 'fukict:slot': 'header' }, 'Card Title'),
  h('p', { 'fukict:slot': 'default' }, 'Card content'),
  h('p', { 'fukict:slot': 'default' }, 'More content'),
);
```

### Widget Package - Detached Rendering

```javascript
class ParentWidget extends Widget {
  constructor(props) {
    super(props);
    this.state = { parentCounter: 0 };
  }

  updateParent = () => {
    this.state.parentCounter++;
    this.update({});
    // ExpensiveWidget won't re-render because it's detached
  };

  render() {
    return h(
      'div',
      null,
      h('p', null, `Parent updates: ${this.state.parentCounter}`),
      h('button', { 'on:click': this.updateParent }, 'Update Parent'),

      // This widget won't re-render when parent updates
      h(ExpensiveWidget, { 'fukict:detach': true }),
    );
  }
}
```

### Style Objects

```javascript
h(
  'div',
  {
    style: {
      color: 'red',
      fontSize: '16px',
      backgroundColor: '#f0f0f0',
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

## Performance Tips

1. **Use Widget's diff/patch instead of replaceNode**

   - `replaceNode`: Rebuilds entire subtree
   - `Widget.update()`: Only updates changed nodes

2. **Mark static/expensive components as detached**

   ```javascript
   h(ExpensiveChart, { 'fukict:detach': true });
   ```

3. **Use refs for direct DOM access when needed**

   - Avoid querying DOM with `querySelector`
   - Use `fukict:ref` for type-safe access

4. **Leverage component keys for list rendering**
   ```javascript
   todos.map(todo => h(TodoItem, { key: todo.id, todo }));
   ```

## Next Steps

- See widget examples for component-based architecture
- Check JSX examples for declarative syntax
- Explore router integration examples
