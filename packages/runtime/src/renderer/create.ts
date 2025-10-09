/**
 * @fukict/runtime - Renderer: Create Nodes
 *
 * Create DOM nodes from VNode
 */
import { findComponentHandler } from '../component-handlers.js';
import * as dom from '../dom/index.js';
import type { VNode, VNodeChild } from '../types/index.js';
import { Fragment } from '../types/index.js';
import { setAttributes } from './attributes.js';

/**
 * Create DOM node from VNode
 *
 * @param vnode - VNode
 * @returns DOM node or null
 */
export function createNode(vnode: VNodeChild): Node | null {
  // Filter out invalid values
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return null;
  }

  // Primitive values become text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return dom.createTextNode(String(vnode));
  }

  // Array - render each child
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    for (const child of vnode) {
      const node = createNode(child);
      if (node) {
        fragment.appendChild(node);
      }
    }
    return fragment;
  }

  // VNode object
  return createElementFromVNode(vnode);
}

/**
 * Create element from VNode object
 *
 * @param vnode - VNode
 * @returns DOM element
 */
export function createElementFromVNode(vnode: VNode): Node | null {
  const { type, props, children } = vnode;

  // Fragment - render children without wrapper
  if (type === Fragment) {
    const fragment = document.createDocumentFragment();
    for (const child of children) {
      const node = createNode(child);
      if (node) {
        fragment.appendChild(node);
      }
    }
    return fragment;
  }

  // Component function
  if (typeof type === 'function') {
    return renderComponent(vnode, type, props, children);
  }

  // String tag name - create element
  if (typeof type === 'string') {
    const element = dom.createElement(type);

    // Set attributes and events
    if (props) {
      setAttributes(element, props);
    }

    // Render children
    for (const child of children) {
      const node = createNode(child);
      if (node) {
        dom.appendChild(element, node);
      }
    }

    // Store DOM reference on VNode for diff/patch
    (vnode as any).__dom__ = element;

    return element;
  }

  return null;
}

/**
 * Render component using registered handlers
 *
 * @param componentVNode - Original component VNode (e.g., h(CounterWidget, ...))
 * @param component - Component function
 * @param props - Props
 * @param children - Children
 * @returns DOM node
 */
function renderComponent(
  componentVNode: VNode,
  component: Function,
  props: Record<string, any> | null,
  children: VNodeChild[],
): Node | null {
  // Find matching handler
  const handler = findComponentHandler(component);

  if (handler) {
    // Use handler to render component
    const renderedVNode = handler.render(component, props || {}, children);
    if (renderedVNode === null) {
      return null;
    }

    // Extract instance reference if stored on rendered VNode
    const instance = (renderedVNode as any).__instance__;

    // Create DOM from rendered VNode
    const node = createNode(renderedVNode);

    // Store DOM and instance references on BOTH VNodes
    if (node) {
      // Store on the rendered VNode (instance.__vnode__)
      (renderedVNode as any).__dom__ = node;

      // IMPORTANT: Also store on the original component VNode
      // This allows mountChildren to find DOM and instance when traversing parent's children
      (componentVNode as any).__dom__ = node;
      if (instance) {
        (componentVNode as any).__instance__ = instance;
        (componentVNode as any).__instanceKey__ = (
          renderedVNode as any
        ).__instanceKey__;
      }
    }

    return node;
  }

  // No handler found - call function directly
  const result = (component as any)(props);
  if (result && typeof result === 'object' && 'type' in result) {
    return createNode(result as VNode);
  }

  // Return null if not a valid VNode
  return null;
}
