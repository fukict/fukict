# @fukict/basic Examples

Complete usage examples for @fukict/basic

## Table of Contents

- [Basic Rendering](#basic-rendering)
- [Class Component](#class-component)
- [Function Component](#function-component)
- [Self-Update Pattern](#self-update-pattern)
- [Props-Driven Update](#props-driven-update)
- [Detached Rendering](#detached-rendering)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Refs](#refs)
- [Slots](#slots)
- [Custom Update Logic](#custom-update-logic)

---

## Basic Rendering

### Render Element

```typescript
import { attach, h } from '@fukict/basic';

const app = h('div', { class: 'app' }, [
  h('h1', null, ['Hello Fukict']),
  h('p', null, ['A lightweight rendering engine']),
]);

attach(app, document.getElementById('root')!);
```

### Render with Events

```typescript
import { attach, h } from '@fukict/basic';

function handleClick() {
  console.log('Button clicked!');
}

const button = h('button', { 'on:click': handleClick }, ['Click Me']);

attach(button, document.getElementById('root')!);
```

---

## Class Component

### Counter Example (Self-Update)

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class Counter extends Fukict<{ initial: number }> {
  private count: number;

  constructor(props: { initial: number }) {
    super(props);
    this.count = props.initial;
  }

  increment = () => {
    this.count++;
    // Self-update: manually trigger re-render
    this.update(this.props);
  };

  decrement = () => {
    this.count--;
    this.update(this.props);
  };

  render() {
    return h('div', { class: 'counter' }, [
      h('h2', null, [`Count: ${this.count}`]),
      h('button', { 'on:click': this.increment }, ['+']),
      h('button', { 'on:click': this.decrement }, ['-']),
    ]);
  }
}

// Mount component
const counterVNode = h(Counter, { initial: 0 }, []);
attach(counterVNode, document.getElementById('root')!);
```

### Timer Example (Self-Update with Lifecycle)

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class Timer extends Fukict<{}> {
  private seconds = 0;
  private timer?: number;

  mounted() {
    // Start timer when mounted
    this.timer = setInterval(() => {
      this.seconds++;
      this.update(this.props);
    }, 1000);
  }

  beforeUnmount() {
    // Clean up timer
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  render() {
    return h('div', null, [`Timer: ${this.seconds}s`]);
  }
}

const timerVNode = h(Timer, {}, []);
const unmount = attach(timerVNode, document.getElementById('root')!);

// Unmount after 10 seconds
setTimeout(() => {
  unmount?.();
}, 10000);
```

---

## Function Component

### Simple Function Component

```typescript
import { attach, defineFukict, h } from '@fukict/basic';

const Greeting = defineFukict<{ name: string }>(props => {
  return h('div', null, [`Hello, ${props.name}!`]);
});

const app = h(Greeting, { name: 'World' }, []);
attach(app, document.getElementById('root')!);
```

### Function Component with Children

```typescript
import { attach, defineFukict, h } from '@fukict/basic';

const Card = defineFukict<{ title: string }>((props, children) => {
  return h('div', { class: 'card' }, [
    h('h3', null, [props.title]),
    h('div', { class: 'card-body' }, children),
  ]);
});

const app = h(Card, { title: 'My Card' }, [
  h('p', null, ['Card content here']),
]);

attach(app, document.getElementById('root')!);
```

---

## Self-Update Pattern

### Todo List (Self-Update)

```typescript
import { Fukict, attach, h } from '@fukict/basic';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

class TodoList extends Fukict<{}> {
  private todos: Todo[] = [];
  private nextId = 1;

  addTodo = () => {
    const text = prompt('Enter todo:');
    if (text) {
      this.todos.push({
        id: this.nextId++,
        text,
        done: false,
      });
      this.update(this.props); // Trigger re-render
    }
  };

  toggleTodo = (id: number) => {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.done = !todo.done;
      this.update(this.props);
    }
  };

  renderTodo(todo: Todo) {
    return h('li', { key: todo.id }, [
      h(
        'input',
        {
          type: 'checkbox',
          checked: todo.done,
          'on:change': () => this.toggleTodo(todo.id),
        },
        [],
      ),
      h(
        'span',
        { style: { textDecoration: todo.done ? 'line-through' : 'none' } },
        [todo.text],
      ),
    ]);
  }

  render() {
    return h('div', { class: 'todo-list' }, [
      h('h2', null, ['Todo List']),
      h('button', { 'on:click': this.addTodo }, ['Add Todo']),
      h(
        'ul',
        null,
        this.todos.map(todo => this.renderTodo(todo)),
      ),
    ]);
  }
}

const app = h(TodoList, {}, []);
attach(app, document.getElementById('root')!);
```

---

## Props-Driven Update

### Parent Updates Child

```typescript
import { Fukict, attach, h } from '@fukict/basic';

// Child component: displays user info
class UserCard extends Fukict<{ name: string; email: string }> {
  updated(prevProps: { name: string; email: string }) {
    console.log('UserCard updated:', prevProps, '->', this.props);
  }

  render() {
    return h('div', { class: 'user-card' }, [
      h('h3', null, [this.props.name]),
      h('p', null, [this.props.email]),
    ]);
  }
}

// Parent component: updates child props
class App extends Fukict<{}> {
  private name = 'John Doe';
  private email = 'john@example.com';

  updateUser = () => {
    this.name = 'Jane Smith';
    this.email = 'jane@example.com';
    this.update(this.props); // Parent re-renders, child receives new props
  };

  render() {
    return h('div', null, [
      h('button', { 'on:click': this.updateUser }, ['Update User']),
      h(UserCard, { name: this.name, email: this.email }, []),
    ]);
  }
}

const app = h(App, {}, []);
attach(app, document.getElementById('root')!);
```

---

## Detached Rendering

### Expensive Component that Skips Updates

```typescript
import { Fukict, attach, h } from '@fukict/basic';

// Expensive component that we want to skip updates
class ExpensiveChart extends Fukict<{ data: number[] }> {
  render() {
    console.log('ExpensiveChart render (expensive!)');
    // Imagine complex chart rendering here
    return h('div', { class: 'chart' }, [
      h('p', null, [`Data points: ${this.props.data.length}`]),
    ]);
  }
}

// Parent component
class Dashboard extends Fukict<{}> {
  private counter = 0;
  private chartData = [1, 2, 3, 4, 5];

  increment = () => {
    this.counter++;
    this.update(this.props);
  };

  render() {
    return h('div', null, [
      h('p', null, [`Counter: ${this.counter}`]),
      h('button', { 'on:click': this.increment }, ['Increment']),
      // Detached mode: chart won't re-render when parent updates
      h(ExpensiveChart, { 'fukict:detach': true, data: this.chartData }, []),
    ]);
  }
}

const app = h(Dashboard, {}, []);
attach(app, document.getElementById('root')!);

// Result: clicking "Increment" only updates counter, chart is NOT re-rendered
```

---

## Lifecycle Hooks

### All Lifecycle Hooks

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class LifecycleDemo extends Fukict<{ name: string }> {
  constructor(props: { name: string }) {
    super(props);
    console.log('[Constructor]', props);
  }

  mounted() {
    console.log('[Mounted] Component is now in the DOM');
    // Good place for:
    // - Setup event listeners
    // - Start timers
    // - Fetch data
  }

  updated(prevProps: { name: string }) {
    console.log('[Updated] Props changed:', prevProps, '->', this.props);
    // Good place for:
    // - React to prop changes
    // - Update external state
  }

  beforeUnmount() {
    console.log('[BeforeUnmount] Component will be removed');
    // Good place for:
    // - Clean up event listeners
    // - Clear timers
    // - Cancel pending requests
  }

  render() {
    return h('div', null, [`Hello, ${this.props.name}`]);
  }
}

const vnode = h(LifecycleDemo, { name: 'Alice' }, []);
const unmount = attach(vnode, document.getElementById('root')!);

// Update props after 1 second
setTimeout(() => {
  // To update props, parent must re-render
}, 1000);

// Unmount after 3 seconds
setTimeout(() => {
  unmount?.();
}, 3000);
```

---

## Refs

### Access DOM Elements

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class InputFocus extends Fukict<{}> {
  private inputRef = this.createRef<HTMLInputElement>();

  mounted() {
    // Focus input after mount
    this.inputRef.current?.focus();
  }

  handleClick = () => {
    // Access input value
    console.log('Input value:', this.inputRef.current?.value);
  };

  render() {
    return h('div', null, [
      h(
        'input',
        { ref: this.inputRef, type: 'text', placeholder: 'Type here' },
        [],
      ),
      h('button', { 'on:click': this.handleClick }, ['Log Value']),
    ]);
  }
}

const app = h(InputFocus, {}, []);
attach(app, document.getElementById('root')!);
```

### Multiple Refs

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class Form extends Fukict<{}> {
  private nameRef = this.createRef<HTMLInputElement>();
  private emailRef = this.createRef<HTMLInputElement>();

  handleSubmit = () => {
    const name = this.nameRef.current?.value;
    const email = this.emailRef.current?.value;
    console.log('Submit:', { name, email });
  };

  render() {
    return h('form', { 'on:submit': (e: Event) => e.preventDefault() }, [
      h('input', { ref: this.nameRef, type: 'text', placeholder: 'Name' }, []),
      h(
        'input',
        { ref: this.emailRef, type: 'email', placeholder: 'Email' },
        [],
      ),
      h('button', { type: 'button', 'on:click': this.handleSubmit }, [
        'Submit',
      ]),
    ]);
  }
}

const app = h(Form, {}, []);
attach(app, document.getElementById('root')!);
```

---

## Slots

### Basic Slots

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class Card extends Fukict<{ title: string }> {
  render() {
    return h('div', { class: 'card' }, [
      h('div', { class: 'card-header' }, [h('h3', null, [this.props.title])]),
      h('div', { class: 'card-body' }, [
        // Default slot
        this.slots.default || [],
      ]),
    ]);
  }
}

const app = h(Card, { title: 'My Card' }, [
  h('p', null, ['This is card content']),
  h('p', null, ['More content here']),
]);

attach(app, document.getElementById('root')!);
```

### Named Slots

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class Layout extends Fukict<{}> {
  render() {
    return h('div', { class: 'layout' }, [
      h('header', null, [this.slots.header || []]),
      h('main', null, [this.slots.default || []]),
      h('footer', null, [this.slots.footer || []]),
    ]);
  }
}

const app = h(Layout, {}, [
  h('div', { __slot_name__: 'header' }, [h('h1', null, ['Site Title'])]),
  h('div', null, [h('p', null, ['Main content'])]),
  h('div', { __slot_name__: 'footer' }, [h('p', null, ['© 2025'])]),
]);

attach(app, document.getElementById('root')!);
```

---

## Custom Update Logic

### Shallow Props Comparison

```typescript
import { Fukict, attach, h } from '@fukict/basic';

class OptimizedComponent extends Fukict<{
  data: { id: number; name: string };
}> {
  update(newProps: { data: { id: number; name: string } }) {
    // Custom logic: only update if data.id changed
    if (newProps.data.id === this.props.data.id) {
      console.log('Skipping update (data.id unchanged)');
      return;
    }

    console.log('Updating (data.id changed)');
    super.update(newProps);
  }

  render() {
    return h('div', null, [
      h('p', null, [`ID: ${this.props.data.id}`]),
      h('p', null, [`Name: ${this.props.data.name}`]),
    ]);
  }
}

// Usage
class App extends Fukict<{}> {
  private data = { id: 1, name: 'Alice' };

  changeName = () => {
    this.data = { ...this.data, name: 'Bob' }; // ID unchanged
    this.update(this.props); // OptimizedComponent skips update
  };

  changeId = () => {
    this.data = { id: 2, name: 'Alice' }; // ID changed
    this.update(this.props); // OptimizedComponent updates
  };

  render() {
    return h('div', null, [
      h('button', { 'on:click': this.changeName }, ['Change Name']),
      h('button', { 'on:click': this.changeId }, ['Change ID']),
      h(OptimizedComponent, { data: this.data }, []),
    ]);
  }
}

const app = h(App, {}, []);
attach(app, document.getElementById('root')!);
```

---

## Best Practices

### 1. Self-Update for Internal State

Use `this.update(this.props)` when component manages its own state:

```typescript
class Counter extends Fukict<{}> {
  private count = 0;

  increment = () => {
    this.count++;
    this.update(this.props); // ✅ Self-update
  };
}
```

### 2. Props-Driven Update for Child Components

Parent re-renders → child receives new props → child updates automatically:

```typescript
class Parent extends Fukict<{}> {
  private data = 'foo';

  change = () => {
    this.data = 'bar';
    this.update(this.props); // Parent updates
  };

  render() {
    return h(Child, { data: this.data }, []); // Child auto-updates
  }
}
```

### 3. Use Detached for Expensive Components

```typescript
// ✅ Expensive component that shouldn't re-render frequently
h(ExpensiveChart, { 'fukict:detach': true, data: chartData }, []);
```

### 4. Clean Up in beforeUnmount

```typescript
class Timer extends Fukict<{}> {
  private timer?: number;

  mounted() {
    this.timer = setInterval(() => {}, 1000);
  }

  beforeUnmount() {
    // ✅ Always clean up
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
```

---

**Document Version**: v1.0
**Last Updated**: 2025-01-10
**Status**: Complete
