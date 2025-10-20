/**
 * @fukict/basic - Diff: Primitive
 *
 * Diff primitive VNodes
 */
import type { PrimitiveVNode, VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { setupPrimitiveVNode } from '../vnode-helpers.js';
import { replaceNode } from './helpers.js';

/**
 * Diff Primitive VNode
 * Updates text content or replaces node if type changes
 */
export function diffPrimitive(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.Primitive ||
    newVNode.__type__ !== VNodeType.Primitive
  ) {
    throw new Error('Expected PrimitiveVNode');
  }

  const oldPrimitive = oldVNode as PrimitiveVNode;
  const newPrimitive = newVNode as PrimitiveVNode;

  // Value unchanged - reuse DOM
  if (oldPrimitive.value === newPrimitive.value) {
    newPrimitive.__dom__ = oldPrimitive.__dom__;
    return;
  }

  const oldValue = oldPrimitive.value;
  const newValue = newPrimitive.value;
  const oldDom = oldPrimitive.__dom__;

  // Both are renderable strings/numbers - update text content
  if (
    (typeof oldValue === 'string' || typeof oldValue === 'number') &&
    (typeof newValue === 'string' || typeof newValue === 'number')
  ) {
    if (oldDom && oldDom.nodeType === Node.TEXT_NODE) {
      oldDom.textContent = String(newValue);
      setupPrimitiveVNode(newPrimitive, oldDom as Text);
      return;
    }
  }

  // Both are non-renderable - update comment content
  if (
    (typeof oldValue === 'boolean' ||
      oldValue === null ||
      oldValue === undefined) &&
    (typeof newValue === 'boolean' ||
      newValue === null ||
      newValue === undefined)
  ) {
    if (oldDom && oldDom.nodeType === Node.COMMENT_NODE) {
      // Update comment content
      const comment = oldDom as Comment;
      comment.textContent = `fukict:primitive:${newValue === null ? 'null' : newValue === undefined ? 'undefined' : newValue}`;
      setupPrimitiveVNode(newPrimitive, comment);
      return;
    }
  }

  // Type changed (renderable ↔ non-renderable) - replace node
  replaceNode(oldPrimitive, newPrimitive, container);
}
