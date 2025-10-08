/**
 * @fukict/runtime - Renderer
 *
 * Main rendering API
 */
import { callOnUnmount } from '../component-handlers.js';
import * as dom from '../dom/index.js';
import type { VNode } from '../types/index.js';
import { createNode } from './create.js';

/**
 * Render VNode to container
 *
 * @param vnode - VNode to render
 * @param container - Container element
 * @returns Rendered DOM node
 */
export function render(vnode: VNode | null, container: Element): Node | null {
  if (vnode === null) {
    // Clear container
    while (container.firstChild) {
      dom.removeChild(container, container.firstChild);
    }
    return null;
  }

  const node = createNode(vnode);
  if (node) {
    dom.appendChild(container, node);
  }
  return node;
}

/**
 * Replace an existing DOM node with a new VNode
 *
 * @param oldNode - Existing DOM node to replace
 * @param newVNode - New VNode to render
 * @param oldVNode - Optional VNode associated with oldNode (for cleanup)
 * @returns New DOM node or null
 */
export function replaceNode(
  oldNode: Node,
  newVNode: VNode | null,
  oldVNode?: VNode,
): Node | null {
  const parentNode = oldNode.parentNode;
  if (!parentNode) {
    return null;
  }

  // Call cleanup for old node
  if (oldVNode && oldNode instanceof Element) {
    callOnUnmount(oldNode, oldVNode);
  }

  // If new VNode is null, just remove old node
  if (newVNode === null) {
    dom.removeChild(parentNode, oldNode);
    return null;
  }

  // Create new node
  const newNode = createNode(newVNode);
  if (newNode) {
    dom.replaceChild(parentNode, newNode, oldNode);
    return newNode;
  }

  // If creation failed, remove old node
  dom.removeChild(parentNode, oldNode);
  return null;
}

/**
 * Unmount node and call cleanup
 *
 * @param node - DOM node
 * @param vnode - Associated VNode (optional)
 */
export function unmount(node: Node, vnode?: VNode): void {
  if (vnode && node instanceof Element) {
    callOnUnmount(node, vnode);
  }

  if (node.parentNode) {
    dom.removeChild(node.parentNode, node);
  }
}
