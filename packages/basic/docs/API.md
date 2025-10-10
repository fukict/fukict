# @fukict/basic API Reference

Complete API reference for @fukict/basic

## Table of Contents

- [VNode Creation](#vnode-creation)
- [Component APIs](#component-apis)
- [Rendering APIs](#rendering-apis)
- [Types](#types)

---

## VNode Creation

### `h(type, props, children)`

Alias: `hyperscript()`

Create a VNode.

**Parameters:**

- `type`: `string | Function | typeof Fragment` - Element tag name, component function, or Fragment
- `props`: `Record<string, any> | null` - Properties (including `on:` prefixed events)
- `children`: `VNodeChild[]` - Child nodes

**Returns:** `VNode`

**Example:**

```typescript
import { h } from '@fukict/basic';

// Element
const div = h('div', { class: 'container' }, [h('h1', null, ['Hello World'])]);

// Component
const greeting = h(Greeting, { name: 'Alice' }, []);

// Fragment
const fragment = h(Fragment, null, [
  h('p', null, ['Paragraph 1']),
  h('p', null, ['Paragraph 2']),
]);
```

### `Fragment`

Symbol for creating fragments (multiple root elements).

**Example:**

```typescript
import { Fragment, h } from '@fukict/basic';

const multi = h(Fragment, null, [
  h('div', null, ['First']),
  h('div', null, ['Second']),
]);
```

### JSX Runtime

**Functions:**

- `jsx(type, props)` - JSX automatic runtime
- `jsxs(type, props)` - JSX automatic runtime (multiple children)
- `jsxDEV(type, props)` - JSX development runtime

**Note:** These are used by JSX transform, not typically called directly.

---

## Component APIs

### Class Component

#### `class Fukict<P, S>`

Base class for class components.

**Type Parameters:**

- `P` - Props type (default: `{}`)
- `S` - Slots type (default: `Slots`)

**Constructor:**

```typescript
constructor(props: P)
```

**Properties:**

- `props: P` - Component props (readonly)
- `slots: S` - Component slots (extracted from children)
- `refs: Map<string | symbol, Ref>` - Refs map

**Methods:**

##### `render(): VNode`

Abstract method. Must be implemented by subclass.

Returns the component's VNode tree.

**Example:**

```typescript
class MyComponent extends Fukict<{ name: string }> {
  render() {
    return h('div', null, [`Hello, ${this.props.name}`]);
  }
}
```

##### `update(newProps: P): void`

Update component with new props.

Called by renderer when parent updates props, or manually for self-update.

**Example:**

```typescript
class Counter extends Fukict<{ initial: number }> {
  private count = 0;

  increment() {
    this.count++;
    this.update(this.props); // Self-update
  }
}
```

**Override:**

```typescript
class OptimizedComponent extends Fukict<{ data: string }> {
  update(newProps: { data: string }) {
    // Custom shouldUpdate logic
    if (newProps.data === this.props.data) return;
    super.update(newProps);
  }
}
```

**Lifecycle Hooks:**

##### `mounted?(): void`

Called after component is mounted to DOM.

**Use cases:**

- Setup event listeners
- Start timers
- Fetch data
- Access DOM elements via refs

**IMPORTANT - Limitations:**
⚠️ **DO NOT call `this.update()` in `mounted()`**

Calling `this.update()` during `mounted()` is not allowed. The framework provides protection with console warnings. If you need to trigger an update after mount, use `setTimeout()` or `requestAnimationFrame()`.

**Example (CORRECT):**

```typescript
class Timer extends Fukict<{}> {
  private timer?: number;

  mounted() {
    // ✅ OK - setup without triggering update
    this.timer = setInterval(() => {
      this.update(this.props); // OK - called from async callback
    }, 1000);
  }
}
```

**Example (INCORRECT):**

```typescript
class Counter extends Fukict<{}> {
  mounted() {
    // ❌ WRONG - cannot call update in mounted hook
    this.update(this.props);
  }
}
```

##### `updated?(prevProps: P): void`

Called after component is updated (props changed or self-update).

**Parameters:**

- `prevProps: P` - Previous props

**Use cases:**

- React to prop changes
- Update external state
- Trigger side effects

**IMPORTANT - Limitations:**
⚠️ **DO NOT call `this.update()` or trigger parent component updates in `updated()`**

This will cause infinite loop during the update process. The framework provides protection with console warnings, but it's best to avoid this pattern entirely.

**Example (CORRECT):**

```typescript
class DataDisplay extends Fukict<{ userId: string }> {
  updated(prevProps: { userId: string }) {
    if (prevProps.userId !== this.props.userId) {
      // ✅ OK - side effects that don't trigger updates
      this.fetchUserData(this.props.userId);
    }
  }
}
```

**Example (INCORRECT - causes infinite loop):**

```typescript
class Counter extends Fukict<{ count: number }> {
  updated(prevProps: { count: number }) {
    // ❌ WRONG - this will trigger infinite loop!
    this.update(this.props);

    // ❌ WRONG - calling parent callbacks that trigger updates
    this.props.onChange?.(this.props.count);
  }
}
```

##### `beforeUnmount?(): void`

Called before component is unmounted from DOM.

**Use cases:**

- Clean up event listeners
- Clear timers
- Cancel pending requests
- Clean up subscriptions

**IMPORTANT - Limitations:**
⚠️ **DO NOT call props callbacks that trigger parent component updates in `beforeUnmount()`**

This will cause infinite loop during the unmount process. The parent is already in the middle of updating/diffing when `beforeUnmount()` is called.

**Example (CORRECT):**

```typescript
class Subscription extends Fukict<{}> {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = subscribe(() => {});
  }

  beforeUnmount() {
    this.unsubscribe?.(); // ✅ OK - cleanup only
    clearInterval(this.timer); // ✅ OK - cleanup only
  }
}
```

**Example (INCORRECT - causes infinite loop):**

```typescript
class Timer extends Fukict<{ onLog: (msg: string) => void }> {
  beforeUnmount() {
    // ❌ WRONG - this.props.onLog might trigger parent update!
    this.props.onLog('Component unmounting');
  }
}
```

**Workaround:** Use `console.log()` or other side-effect functions that don't trigger updates.

### Function Component

#### `defineFukict<P>(fn): FunctionComponent<P>`

Helper function for defining function components with type inference.

**Type Parameters:**

- `P` - Props type

**Parameters:**

- `fn: (props: P, children?: VNodeChild[]) => VNode | null` - Function component

**Returns:** `FunctionComponent<P>`

**Example:**

```typescript
import { defineFukict, h } from '@fukict/basic';

const Greeting = defineFukict<{ name: string }>(props => {
  return h('div', null, [`Hello, ${props.name}!`]);
});

// Usage
const app = h(Greeting, { name: 'World' }, []);
```

**Features:**

- Stateless (no internal state)
- No lifecycle hooks
- Shallow props comparison (skip re-render if props unchanged)
- Parent-driven update only (cannot self-update)

---

## Rendering APIs

### `attach(vnode, container): (() => void) | null`

Attach VNode to container (complete mounting flow).

**Parameters:**

- `vnode: VNodeChild` - VNode to render
- `container: Element` - Container element

**Returns:** `() => void | null` - Unmount function

**Example:**

```typescript
import { attach, h } from '@fukict/basic';

const app = h('div', null, ['Hello World']);
const unmount = attach(app, document.getElementById('root')!);

// Later: unmount
unmount?.();
```

**Process:**

1. Create real DOM nodes from VNode
2. Activate components (mount + trigger lifecycle)
3. Return unmount function

### `replaceNode(oldNode, newVNode, oldVNode?): Node | Node[] | null`

Replace an existing DOM node with a new VNode.

**Parameters:**

- `oldNode: Node` - Existing DOM node to replace
- `newVNode: VNodeChild` - New VNode to render
- `oldVNode?: VNode` - Optional VNode associated with oldNode (unused, kept for API compatibility)

**Returns:** `Node | Node[] | null` - New DOM node(s) or null

**Example:**

```typescript
import { h, replaceNode } from '@fukict/basic';

const oldNode = document.getElementById('old')!;
const newVNode = h('div', null, ['New Content']);

replaceNode(oldNode, newVNode);
```

### `unmount(node): void`

Unmount node (DOM removal).

**Parameters:**

- `node: Node | Node[]` - DOM node or node array

**Example:**

```typescript
import { unmount } from '@fukict/basic';

const node = document.getElementById('app')!;
unmount(node);
```

### `diff(oldVNode, newVNode, container): void`

Diff and patch VNode tree.

**Parameters:**

- `oldVNode: VNodeChild` - Old VNode
- `newVNode: VNodeChild` - New VNode
- `container: Element` - Container element

**Example:**

```typescript
import { diff } from '@fukict/basic';

// Typically used internally, but can be called manually
diff(oldVNode, newVNode, container);
```

**Process:**

1. Check VNode types
2. If types match, perform type-specific diff
3. If types don't match, replace entire node
4. Update DOM in place

---

## Types

### Core Types

#### `VNode`

Discriminated union of all VNode types.

```typescript
type VNode =
  | ElementVNode
  | FragmentVNode
  | FunctionComponentVNode
  | ClassComponentVNode;
```

#### `VNodeChild`

Child types supported in VNode trees.

```typescript
type VNodeChild = VNode | string | number | boolean | null | undefined;
```

#### `VNodeType`

Enum for VNode types.

```typescript
enum VNodeType {
  Element = 'element',
  Fragment = 'fragment',
  FunctionComponent = 'function',
  ClassComponent = 'class',
}
```

### Component Types

#### `FunctionComponent<P>`

Function component type.

```typescript
type FunctionComponent<P = {}> = (
  props: P,
  children?: VNodeChild[],
) => VNode | null;
```

#### `Ref<T>`

Ref object type.

```typescript
interface Ref<T extends Element = Element> {
  current: T | null;
}
```

#### `Slots`

Slots type.

```typescript
type Slots = Record<string, VNodeChild[]>;
```

### Props Types

#### `RuntimeAttributes`

All supported attributes (HTML + SVG + events + custom).

```typescript
type RuntimeAttributes = HTMLAttributes &
  SVGAttributes &
  EventHandlers & {
    ref?: Ref | RefCallback;
    'fukict:detach'?: boolean;
    __slot_name__?: string;
  };
```

#### `EventHandlers`

Event handlers with `on:` prefix.

```typescript
type EventHandlers = {
  [K in `on:${string}`]?: (event: Event) => void;
};
```

### Utility Types

#### `RefCallback<T>`

Ref callback function type.

```typescript
type RefCallback<T extends Element = Element> = (element: T) => void;
```

#### `UnregisterFn`

Unregister function type.

```typescript
type UnregisterFn = () => void;
```

---

## Advanced APIs

### DOM Utilities

#### `createRealNode(vnode): Node | Node[] | null`

Create real DOM node(s) from VNode.

**Note:** Typically used internally. Exported for advanced use cases.

### DOM Helpers

```typescript
// Check if value is DOM array
isDomArray(value: unknown): boolean

// Normalize DOM to array
normalizeDom(dom: Node | Node[]): Node[]

// Get first DOM node
getFirstDomNode(vnode: VNodeChild): Node | null

// Get all DOM nodes
getAllDomNodes(vnode: VNodeChild): Node[]

// Check if value is VNode
isVNode(value: unknown): boolean
```

---

## Special Props

### `fukict:ref`

Class component ref for accessing DOM elements.

**Type:** `string`

**Usage:**

```typescript
class MyComponent extends Fukict<{}> {
  mounted() {
    const inputRef = this.refs.get('myInput');
    inputRef?.current?.focus();
  }

  render() {
    return h('input', { 'fukict:ref': 'myInput' }, []);
  }
}
```

**How it works:**

1. Add `fukict:ref="name"` to element props
2. Framework automatically creates/updates `this.refs.get('name')` with `{ current: element }`
3. Access via `this.refs.get('name')?.current`

**Note:** Only works in Class Components. Function components should use ref callbacks.

### `ref`

Ref callback for accessing DOM elements (works in both class and function components).

**Type:** `RefCallback | Ref` (Currently only callback supported)

**Example:**

```typescript
// Ref callback
h('input', { ref: el => console.log(el) }, []);
```

### `on:*`

Event handlers with `on:` prefix.

**Format:** `on:${eventName}`

**Example:**

```typescript
h(
  'button',
  {
    'on:click': e => console.log('Clicked!'),
    'on:mouseenter': e => console.log('Mouse enter'),
  },
  ['Click me'],
);
```

### `fukict:detach`

Detached rendering mode (skip updates).

**Type:** `boolean`

**Example:**

```typescript
// Component won't re-render when parent updates
h(ExpensiveComponent, { 'fukict:detach': true, data: [] }, []);
```

**Behavior:**

- Props are updated (instance has latest props)
- `update()` NOT called (no re-render)
- User can still manually call `this.update(this.props)`

### `__slot_name__`

Slot name for named slots.

**Type:** `string`

**Example:**

```typescript
h('div', { __slot_name__: 'header' }, [h('h1', null, ['Header Content'])]);
```

---

## JSX Support

### Configuration

**Babel:**

```json
{
  "presets": ["@fukict/babel-preset"]
}
```

**TypeScript (tsconfig.json):**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@fukict/basic"
  }
}
```

### JSX Syntax

```tsx
import { Fukict } from '@fukict/basic';

// Element
<div class="container">Hello</div>

// Component
<MyComponent name="Alice" />

// Fragment
<>
  <div>First</div>
  <div>Second</div>
</>

// Events
<button on:click={() => console.log('Clicked')}>Click</button>

// Ref
<input ref={this.inputRef} />

// Detached
<ExpensiveComponent fukict:detach data={data} />
```

---

**Document Version**: v1.0
**Last Updated**: 2025-01-10
**Status**: Complete
