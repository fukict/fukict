# Diff/Patch Mechanism

## Overview

Each VNode type has its own diff strategy based on `__type__` field.

```typescript
function diff(oldVNode: VNode, newVNode: VNode, parent: Element) {
  // Type must match
  if (oldVNode.__type__ !== newVNode.__type__) {
    replaceNode(oldVNode, newVNode);
    return;
  }

  // Type-specific diff
  switch (newVNode.__type__) {
    case VNodeType.Element:
      diffElement(oldVNode, newVNode, parent);
      break;
    case VNodeType.Fragment:
      diffFragment(oldVNode, newVNode, parent);
      break;
    case VNodeType.FunctionComponent:
      diffFunctionComponent(oldVNode, newVNode, parent);
      break;
    case VNodeType.ClassComponent:
      diffClassComponent(oldVNode, newVNode);
      break;
  }
}
```

## Element Diff

```typescript
function diffElement(
  oldVNode: ElementVNode,
  newVNode: ElementVNode,
  parent: Element,
) {
  if (oldVNode.type !== newVNode.type) {
    replaceNode(oldVNode, newVNode);
    return;
  }

  const element = oldVNode.__dom__!;

  // Patch props and events
  patchProps(element, oldVNode.props, newVNode.props);

  // Diff children recursively
  diffChildren(oldVNode.children, newVNode.children, element);

  // Reuse DOM reference
  newVNode.__dom__ = element;
}
```

**Strategy**:

- Reuse DOM element
- Patch attributes and events
- Recursively diff children

## Fragment Diff

```typescript
function diffFragment(
  oldVNode: FragmentVNode,
  newVNode: FragmentVNode,
  parent: Element,
) {
  const oldNodes = oldVNode.__dom__ || [];
  const anchor = oldNodes[0] || null;

  // Diff children array
  diffChildren(oldVNode.children, newVNode.children, parent, anchor);

  // Collect new DOM nodes from children
  newVNode.__dom__ = collectDomNodes(newVNode.children);
}
```

**Strategy**:

- Diff children array
- Update `__dom__` array with new nodes
- No wrapper element to patch

## Function Component Diff

```typescript
function diffFunctionComponent(
  oldVNode: FunctionComponentVNode,
  newVNode: FunctionComponentVNode,
  parent: Element,
) {
  // Shallow compare props (optimization)
  if (shallowEqual(oldVNode.props, newVNode.props)) {
    // Skip re-render
    newVNode.__rendered__ = oldVNode.__rendered__;
    newVNode.__dom__ = oldVNode.__dom__;
    return;
  }

  // Re-call function
  const newRendered = newVNode.type(newVNode.props);

  if (oldVNode.__rendered__ && newRendered) {
    // Diff rendered results
    diff(oldVNode.__rendered__, newRendered, parent);
  } else {
    replaceNode(oldVNode, newVNode);
  }

  newVNode.__rendered__ = newRendered;
  newVNode.__dom__ = newRendered?.__dom__;
}
```

**Strategy**:

- Shallow compare props first
- Re-call function if props changed
- Diff old vs new `__rendered__`
- `__dom__` follows from `__rendered__`

## Class Component Diff

```typescript
function diffClassComponent(
  oldVNode: ClassComponentVNode,
  newVNode: ClassComponentVNode,
) {
  const instance = oldVNode.__instance__!;

  // Check detached mode
  if (newVNode.props['fukict:detach']) {
    // Update props but skip update()
    (instance.props as any) = newVNode.props;
    newVNode.__instance__ = instance;
    return;
  }

  // Props-driven update
  instance.update(newVNode.props);

  // Reuse instance
  newVNode.__instance__ = instance;
}
```

**Strategy**:

- Reuse component instance
- **Detached mode**: Only update props, skip `update()`
- **Normal mode**: Call `instance.update(newProps)`
- Instance handles internal diff/patch

### Update Flow

```typescript
class Fukict {
  update(newProps: P): void {
    const prevProps = this.props;

    // Update props
    this.props = newProps;

    // Re-render
    const newVNode = this.render();

    // Built-in diff
    if (this.__vnode__ && this.__container__) {
      diff(this.__vnode__, newVNode, this.__container__);
    }

    this.__vnode__ = newVNode;

    // Lifecycle hook
    if (this.updated) {
      this.updated(prevProps);
    }
  }
}
```

## Optimization Table

| VNode Type         | Skip Condition       | Update Cost                          |
| ------------------ | -------------------- | ------------------------------------ |
| Element            | -                    | Medium (patch props + diff children) |
| Fragment           | -                    | Medium (diff children array)         |
| Function Component | Props unchanged      | **Low (skip entirely)**              |
| Class Component    | `fukict:detach` prop | **None (props updated, no render)**  |

---

**Related**: [VNode System](./vnode-system.md) | [Component Design](./component-design.md) | [Performance](./performance.md)
