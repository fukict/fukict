/**
 * @fukict/basic - Diff: Children
 *
 * Diff children arrays
 */
import type { VNodeChild } from '../../types/index.js';
import { createRealNode } from '../create.js';
import { activate } from '../mount.js';
import { removeNode } from './helpers.js';
import { diff } from './index.js';

/**
 * Diff children arrays
 * Simplified algorithm without key-based optimization
 */
export function diffChildren(
  oldChildren: VNodeChild[],
  newChildren: VNodeChild[],
  container: Element,
): void {
  const oldLen = oldChildren.length;
  const newLen = newChildren.length;
  const commonLen = Math.min(oldLen, newLen);

  // Diff common children
  for (let i = 0; i < commonLen; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    // Both are primitives - update text node directly
    if (
      (typeof oldChild === 'string' || typeof oldChild === 'number') &&
      (typeof newChild === 'string' || typeof newChild === 'number')
    ) {
      if (oldChild !== newChild) {
        // Find the i-th text node in container
        const childNodes = Array.from(container.childNodes);
        if (childNodes[i] && childNodes[i].nodeType === Node.TEXT_NODE) {
          childNodes[i].textContent = String(newChild);
        }
      }
    } else {
      // VNode diff
      diff(oldChild, newChild, container);
    }
  }

  // Remove extra old children
  if (oldLen > newLen) {
    for (let i = commonLen; i < oldLen; i++) {
      removeNode(oldChildren[i], container);
    }
  }

  // Append new children
  if (newLen > oldLen) {
    for (let i = commonLen; i < newLen; i++) {
      const node = createRealNode(newChildren[i]);
      if (node) {
        if (Array.isArray(node)) {
          node.forEach(n => container.appendChild(n));
        } else {
          container.appendChild(node);
        }
        activate({ vnode: newChildren[i], container });
      }
    }
  }
}
