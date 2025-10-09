/**
 * @fukict/runtime - Renderer
 *
 * Main rendering API
 */
import * as dom from '../dom/index.js';
import type { VNode, VNodeChild } from '../types/index.js';
import { createNode } from './create.js';
import { mount } from './mount.js';

/**
 * Render VNode to container
 *
 * @param vnode - VNode to render
 * @param container - Container element
 * @returns Rendered DOM node
 */
export function render(vnode: VNodeChild, container: Element): Node | null {
  if (vnode === null || vnode === undefined) {
    // Clear container
    while (container.firstChild) {
      dom.removeChild(container, container.firstChild);
    }
    return null;
  }

  // Create and mount DOM
  const node = createNode(vnode);

  if (node) {
    mount(node, container);
  }

  return node;
}

/**
 * Replace an existing DOM node with a new VNode
 *
 * @param oldNode - Existing DOM node to replace
 * @param newVNode - New VNode to render
 * @param _oldVNode - Optional VNode associated with oldNode (unused, kept for API compatibility)
 * @returns New DOM node or null
 */
export function replaceNode(
  oldNode: Node,
  newVNode: VNodeChild,
  _oldVNode?: VNode,
): Node | null {
  const parentNode = oldNode.parentNode;
  if (!parentNode) {
    return null;
  }

  // If new VNode is null, just remove old node
  if (newVNode === null || newVNode === undefined) {
    dom.removeChild(parentNode, oldNode);
    return null;
  }

  // Create new node
  const newNode = createNode(newVNode);

  if (newNode) {
    // Replace DOM
    dom.replaceChild(parentNode, newNode, oldNode);
    return newNode;
  }

  // If creation failed, remove old node
  dom.removeChild(parentNode, oldNode);
  return null;
}

/**
 * Unmount node (simple DOM removal)
 *
 * @param node - DOM node
 * @param _vnode - Associated VNode (unused, kept for API compatibility)
 */
export function unmount(node: Node, _vnode?: VNode): void {
  if (node.parentNode) {
    dom.removeChild(node.parentNode, node);
  }
}
