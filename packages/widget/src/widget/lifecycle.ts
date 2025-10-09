/**
 * @fukict/widget - Lifecycle Methods
 *
 * Widget mounting and unmounting logic
 */
import type { VNode, VNodeChild } from '@fukict/runtime';
import { createNode, replaceNode } from '@fukict/runtime';
import type { Widget } from './class.js';
import type { WidgetProps } from '../types/index.js';
import {
  extractRefName,
  hasDetachAttr,
  isDetached,
  markDetached,
} from '../utils/index.js';

/**
 * Flatten VNodeChild array recursively
 * Converts nested arrays into a flat list of VNodes/primitives
 */
function flattenChildren(children: VNodeChild[]): VNodeChild[] {
  const result: VNodeChild[] = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }
  return result;
}

/**
 * Recursively mount children and register refs
 * Called after DOM is inserted
 *
 * @param widget - Widget instance
 * @param vnode - VNode tree to traverse
 * @param node - Corresponding DOM node
 */
export function mountChildren<TProps extends WidgetProps>(
  widget: Widget<TProps>,
  vnode: VNode | VNodeChild,
  node: Node,
): void {
  // Skip null/undefined/boolean
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return;
  }

  // Skip primitive values (text nodes)
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return;
  }

  // Arrays should never reach here after flattening, but handle gracefully
  if (Array.isArray(vnode)) {
    console.warn('[mountChildren] Unexpected array VNode');
    return;
  }

  // Handle VNode object
  const instance = (vnode as any).__instance__;

  // Mark fukict:detach (Widget responsibility, not Runtime)
  if (hasDetachAttr(vnode)) {
    markDetached(vnode);
  }

  // 1. Handle component VNodes
  if (instance) {
    // The DOM node and instance are now stored on the component VNode itself
    // (stored by runtime's renderComponent)
    const instanceNode = (vnode as any).__dom__;

    const refName = extractRefName(vnode);

    // Register ref
    if (refName) {
      widget.refs.set(refName, instance);
    }

    // Set element reference using the DOM stored on component VNode
    if (instanceNode instanceof Element) {
      instance.element = instanceNode;
    } else {
      console.warn('[mountChildren] instanceNode is NOT an Element!', { instanceNode });
    }

    // Recursively mount the instance's own child tree
    // IMPORTANT: Use the instance as the parent widget, not the outer widget
    if (instance.__vnode__ && instanceNode) {
      mountChildren(instance, instance.__vnode__, instanceNode);
    }

    // Trigger child's onMounted
    instance.onMounted?.();

    return;
  }

  // 2. Handle DOM element VNodes
  const refName = extractRefName(vnode);
  const detached = isDetached(vnode);

  // Create DetachedRef for detached DOM elements
  if (refName && detached) {
    if (node instanceof Element) {
      const detachedRef = {
        element: node,
        update: (newVNode: VNode) => {
          const newNode = replaceNode(node, newVNode, vnode);
          if (newNode && newNode instanceof Element) {
            detachedRef.element = newNode;
          }
        },
      };
      widget.refs.set(refName, detachedRef);
    }
  }

  // 3. Recursively traverse children
  const children = vnode.children;
  if (children && children.length > 0 && node instanceof Element) {
    // Flatten children array to match DOM structure
    // VNode children can contain nested arrays, but DOM is always flat
    const flatChildren = flattenChildren(children);
    const domChildren = Array.from(node.childNodes);

    // Filter out null/undefined/boolean from flat children
    const validChildren = flatChildren.filter(
      child => child !== null && child !== undefined && typeof child !== 'boolean'
    );

    // Match each valid VNode child to its DOM node
    for (let i = 0; i < validChildren.length && i < domChildren.length; i++) {
      mountChildren(widget, validChildren[i], domChildren[i]);
    }
  }
}

/**
 * Recursively unmount children and clean up refs
 *
 * @param widget - Widget instance
 * @param vnode - VNode tree to traverse
 */
export function unmountChildren<TProps extends WidgetProps>(
  widget: Widget<TProps>,
  vnode: VNode | VNodeChild,
): void {
  // Skip null/undefined/boolean/primitives
  if (
    vnode === null ||
    vnode === undefined ||
    typeof vnode === 'boolean' ||
    typeof vnode === 'string' ||
    typeof vnode === 'number'
  ) {
    return;
  }

  // Handle arrays
  if (Array.isArray(vnode)) {
    for (const child of vnode) {
      unmountChildren(widget, child);
    }
    return;
  }

  // Handle VNode object
  const instance = (vnode as any).__instance__;

  // 1. Handle component VNodes
  if (instance) {
    const refName = extractRefName(vnode);

    // Trigger child's onBeforeUnmount
    instance.onBeforeUnmount?.();

    // Recursively unmount child's tree
    if (instance.__vnode__) {
      unmountChildren(widget, instance.__vnode__);
    }

    // Clean up ref
    if (refName) {
      widget.refs.delete(refName);
    }

    return;
  }

  // 2. Handle DOM element VNodes
  const refName = extractRefName(vnode);

  // Clean up DetachedRef
  if (refName) {
    widget.refs.delete(refName);
  }

  // 3. Recursively traverse children
  const children = vnode.children;
  if (children && children.length > 0) {
    for (const child of children) {
      unmountChildren(widget, child);
    }
  }
}

/**
 * Mount widget to container
 *
 * @param widget - Widget instance
 * @param container - Container element
 */
export function mount<TProps extends WidgetProps>(
  widget: Widget<TProps>,
  container: Element,
): void {
  // Render VNode
  const vnode = widget.render();
  widget.__vnode__ = vnode;

  // Create DOM (Runtime: VNode → DOM)
  const node = createNode(vnode);

  if (node) {
    // Insert DOM
    container.appendChild(node);

    // Set element reference
    if (node instanceof Element) {
      widget.element = node;
    }

    // Widget: Traverse tree and register refs
    mountChildren(widget, vnode, node);

    // Trigger onMounted
    widget.onMounted?.();
  }
}

/**
 * Unmount widget
 *
 * @param widget - Widget instance
 */
export function unmount<TProps extends WidgetProps>(
  widget: Widget<TProps>,
): void {
  if (!widget.element || !widget.__vnode__) {
    return;
  }

  // Trigger onBeforeUnmount
  widget.onBeforeUnmount?.();

  // Recursively unmount children and clean up refs
  unmountChildren(widget, widget.__vnode__);

  // Remove from DOM
  if (widget.element.parentElement) {
    widget.element.parentElement.removeChild(widget.element);
  }

  // Clear refs
  widget.refs.clear();

  // Clear element reference
  widget.element = undefined;
  widget.__vnode__ = undefined;
}
