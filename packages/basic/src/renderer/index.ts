/**
 * @fukict/basic - Renderer
 *
 * Main rendering API
 */
import { getDevInfo } from '../dev.js';
import * as dom from '../dom/index.js';
import type { VNode, VNodeChild } from '../types/index.js';
import { createRealNode } from './create.js';
import { removeNode } from './diff/index.js';
import { activate } from './mount.js';

// Export diff function for use in Fukict.update
export { diff } from './diff/index.js';

/**
 * Attach VNode to container (complete mounting flow)
 *
 * @param vnode - VNode to render
 * @param container - Container element
 * @returns Unmount function
 */
export function attach(
  vnode: VNodeChild,
  container: Element,
): (() => void) | null {
  if (vnode === null || vnode === undefined) {
    // Clear container
    while (container.firstChild) {
      dom.removeChild(container, container.firstChild);
    }
    return null;
  }

  // 1. Create real DOM nodes (ClassComponent creates placeholder)
  createRealNode(vnode);

  // 2. Activate: mount DOM and trigger lifecycle
  activate({ vnode, container });

  // Dev mode: expose runtime info and notify debugging tools
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    const devInfo = getDevInfo();
    if (devInfo) {
      devInfo.roots.push({ vnode, container });
      window.dispatchEvent(
        new CustomEvent('fukict:attach', { detail: { vnode, container } }),
      );
    }
  }

  // Return unmount function
  return () => {
    removeNode(vnode, container);

    // Dev mode: remove root from debug info
    if (process.env.NODE_ENV !== 'production') {
      const devInfo = getDevInfo();
      if (devInfo) {
        devInfo.roots = devInfo.roots.filter(
          r => r.vnode !== vnode || r.container !== container,
        );
        window.dispatchEvent(
          new CustomEvent('fukict:detach', { detail: { vnode, container } }),
        );
      }
    }
  };
}

/**
 * Replace an existing DOM node with a new VNode
 *
 * @param oldNode - Existing DOM node to replace
 * @param newVNode - New VNode to render
 * @param _oldVNode - Optional VNode associated with oldNode (unused, kept for API compatibility)
 * @returns New DOM node(s) or null
 */
export function replaceNode(
  oldNode: Node,
  newVNode: VNodeChild,
  _oldVNode?: VNode,
): Node | Node[] | null {
  const parentNode = oldNode.parentNode;
  if (!parentNode) {
    return null;
  }

  // If new VNode is null, just remove old node
  if (newVNode === null || newVNode === undefined) {
    dom.removeChild(parentNode, oldNode);
    return null;
  }

  // Create new node(s)
  const newNode = createRealNode(newVNode);

  if (newNode) {
    if (Array.isArray(newNode)) {
      // Multiple nodes - insert all before oldNode, then remove oldNode
      newNode.forEach(n => {
        parentNode.insertBefore(n, oldNode);
      });
      parentNode.removeChild(oldNode);
    } else {
      // Single node - replace directly
      dom.replaceChild(parentNode, newNode, oldNode);
    }
    return newNode;
  }

  // If creation failed, remove old node
  dom.removeChild(parentNode, oldNode);
  return null;
}

/**
 * Unmount node (DOM removal)
 *
 * @param node - DOM node or node array
 */
export function unmount(node: Node | Node[]): void {
  if (Array.isArray(node)) {
    node.forEach(n => {
      if (n.parentNode) {
        dom.removeChild(n.parentNode, n);
      }
    });
  } else {
    if (node.parentNode) {
      dom.removeChild(node.parentNode, node);
    }
  }
}
