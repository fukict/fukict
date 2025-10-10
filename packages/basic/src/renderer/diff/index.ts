/**
 * @fukict/basic - Diff and Patch
 *
 * Update existing DOM by diffing old and new VNodes
 */
import type { VNode, VNodeChild } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { createRealNode } from '../create.js';
import { activate } from '../mount.js';
import { diffChildren } from './children.js';
import { diffClassComponent } from './class.js';
import { diffElement } from './element.js';
import { diffFragment } from './fragment.js';
import { diffFunctionComponent } from './function.js';
import { removeNode, replaceNode } from './helpers.js';

// Re-export for external use
export { replaceNode, removeNode, shallowEqual } from './helpers.js';
export { patchProps } from './props.js';
export { diffChildren } from './children.js';

/**
 * Diff and patch VNode tree
 *
 * @param oldVNode - Old VNode (can be array from slots)
 * @param newVNode - New VNode (can be array from slots)
 * @param container - Container element
 */
export function diff(
  oldVNode: VNodeChild,
  newVNode: VNodeChild,
  container: Element,
): void {
  // Handle array types (e.g., from slots)
  // If either is array, use diffChildren for array comparison
  if (Array.isArray(oldVNode) || Array.isArray(newVNode)) {
    const oldChildren = Array.isArray(oldVNode) ? oldVNode : [oldVNode];
    const newChildren = Array.isArray(newVNode) ? newVNode : [newVNode];
    diffChildren(oldChildren, newChildren, container);
    return;
  }

  // Both null/undefined - no changes
  if (!oldVNode && !newVNode) {
    return;
  }

  // Old exists, new is null - remove
  if (oldVNode && !newVNode) {
    removeNode(oldVNode, container);
    return;
  }

  // Old is null, new exists - create and mount
  if (!oldVNode && newVNode) {
    const node = createRealNode(newVNode);
    if (node) {
      if (Array.isArray(node)) {
        node.forEach(n => container.appendChild(n));
      } else {
        container.appendChild(node);
      }
      activate({ vnode: newVNode, container });
    }
    return;
  }

  // Both are primitives
  if (
    (typeof oldVNode === 'string' ||
      typeof oldVNode === 'number' ||
      typeof oldVNode === 'boolean') &&
    (typeof newVNode === 'string' ||
      typeof newVNode === 'number' ||
      typeof newVNode === 'boolean')
  ) {
    // Text changed - replace text node
    if (oldVNode !== newVNode) {
      const oldText = String(oldVNode);
      const newText = String(newVNode);
      // Find and replace text node (simplified - assumes single text node)
      const textNodes = Array.from(container.childNodes).filter(
        node =>
          node.nodeType === Node.TEXT_NODE && node.textContent === oldText,
      );
      if (textNodes.length > 0) {
        textNodes[0].textContent = newText;
      }
    }
    return;
  }

  // One is primitive, one is VNode - replace
  const isOldVNode =
    typeof oldVNode === 'object' && oldVNode !== null && '__type__' in oldVNode;
  const isNewVNode =
    typeof newVNode === 'object' && newVNode !== null && '__type__' in newVNode;

  if (!isOldVNode || !isNewVNode) {
    replaceNode(oldVNode, newVNode, container);
    return;
  }

  // Both are VNodes - check type match
  const oldVN = oldVNode as VNode;
  const newVN = newVNode as VNode;

  // Type mismatch - replace entire node
  if (oldVN.__type__ !== newVN.__type__) {
    replaceNode(oldVN, newVN, container);
    return;
  }

  // Same type - diff by type
  switch (newVN.__type__) {
    case VNodeType.Element:
      diffElement(oldVN, newVN, container);
      break;

    case VNodeType.Fragment:
      diffFragment(oldVN, newVN, container);
      break;

    case VNodeType.FunctionComponent:
      diffFunctionComponent(oldVN, newVN, container);
      break;

    case VNodeType.ClassComponent:
      diffClassComponent(oldVN, newVN, container);
      break;
  }
}
