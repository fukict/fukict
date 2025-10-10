# VNode Type System

## The `__type__` Field

**Problem**: Different VNode types have completely different update mechanisms.

**Solution**: Use `__type__` field as discriminator for TypeScript union types.

## VNode Types

```typescript
export enum VNodeType {
  Element = 'element',
  Fragment = 'fragment',
  FunctionComponent = 'function',
  ClassComponent = 'class',
}

export type VNode =
  | ElementVNode
  | FragmentVNode
  | FunctionComponentVNode
  | ClassComponentVNode;
```

## Field Usage

| VNode Type         | `__type__` | `type`     | `__dom__`        | `__rendered__` | `__instance__` |
| ------------------ | ---------- | ---------- | ---------------- | -------------- | -------------- |
| Element            | `element`  | `string`   | `Node`           | -              | -              |
| Fragment           | `fragment` | `symbol`   | `Node[]`         | -              | -              |
| Function Component | `function` | `Function` | `Node \| Node[]` | `VNode`        | -              |
| Class Component    | `class`    | `Function` | -                | -              | `instance`     |

## Compile-time Type Annotation

**Decision**: `__type__` is added by `@fukict/babel-plugin` at compile time, NOT at runtime.

**Why**:

- Zero runtime overhead
- Smaller bundle (no type detection code)
- Better static analysis

**How**:

```typescript
// Runtime: hyperscript (minimal)
export function hyperscript(type, props, children): VNode {
  return { type, props: props || {}, children };
}

// Compile time: babel-plugin adds __type__
<div />              → h('div', { __type__: 'element' }, [])
<MyComponent />      → h(MyComponent, { __type__: 'class' }, [])
```

**Fallback**: Renderer can fallback to runtime type detection for hand-written `h()` calls.

## TypeScript Benefits

### Type Narrowing

```typescript
function processVNode(vnode: VNode) {
  switch (vnode.__type__) {
    case VNodeType.Element:
      // TypeScript knows: vnode is ElementVNode
      const element: Node = vnode.__dom__!;
      break;

    case VNodeType.ClassComponent:
      // TypeScript knows: vnode is ClassComponentVNode
      const instance = vnode.__instance__;
      // vnode.__dom__ // ❌ Compile error
      break;
  }
}
```

### Benefits

- **Type Safety**: Automatic type inference
- **Intellisense**: Auto-completion
- **Compile-time Errors**: Catch bugs early
- **Self-documenting**: Clear intent

## Design Trade-offs

### Why Not Runtime Detection?

```typescript
// ❌ Runtime type detection (slower, larger)
if (typeof vnode.type === 'string') {
  /* element */
} else if (vnode.type === Fragment) {
  /* fragment */
} else if (isClassComponent(vnode.type)) {
  /* class */
} else {
  /* function */
}
```

**Problems**:

- Runtime overhead on every VNode creation
- Larger bundle (need `isClassComponent()` utility)
- Can't leverage TypeScript discriminated unions

### Why Compile-time?

```typescript
// ✅ Compile-time annotation (faster, smaller)
switch (vnode.__type__) {
  case VNodeType.Element: /* ... */
  case VNodeType.Fragment: /* ... */
  case VNodeType.FunctionComponent: /* ... */
  case VNodeType.ClassComponent: /* ... */
}
```

**Benefits**:

- Single check per VNode
- Zero runtime cost
- TypeScript type narrowing
- Smaller bundle

---

**Related**: [Component Design](./component-design.md) | [Diff/Patch](./diff-patch.md)
