/**
 * @fukict/runtime - Renderer: Create Nodes
 *
 * Create DOM nodes from VNode
 */
import {
  callOnMount,
  findComponentHandler,
  processVNode,
} from '../component-handlers.js';
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
    return renderComponent(type, props, children);
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

    // Call onMount extension point
    callOnMount(element, vnode);

    return element;
  }

  return null;
}

/**
 * Render component using registered handlers
 *
 * @param component - Component function
 * @param props - Props
 * @param children - Children
 * @returns DOM node
 */
function renderComponent(
  component: Function,
  props: Record<string, any> | null,
  children: VNodeChild[],
): Node | null {
  // Find matching handler
  const handler = findComponentHandler(component);

  if (handler) {
    // Use handler to render component
    const vnode = handler.render(component, props || {}, children);
    if (vnode === null) {
      return null;
    }

    // Process VNode through extensions
    const processedVNode = processVNode(vnode);

    // Create DOM from processed VNode
    return createNode(processedVNode);
  }

  // No handler found - call function directly
  const result = (component as any)(props);
  if (result && typeof result === 'object' && 'type' in result) {
    return createNode(result as VNode);
  }

  // Return null if not a valid VNode
  return null;
}
