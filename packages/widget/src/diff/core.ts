/**
 * @fukict/widget - Diff Core
 *
 * Main diff algorithm with all logic together to avoid circular dependencies
 */
import type { VNode, VNodeChild } from '@fukict/runtime';
import { createNode, replaceNode, unmount } from '@fukict/runtime';

import {
  extractRefName,
  hasDetachAttr,
  isDetached,
  markDetached,
} from '../utils/index.js';
import type { Widget } from '../widget/class.js';
import { patchProps } from './props.js';
import {
  canReuseInstance,
  findDOMNode,
  isComponentVNode,
  isVNode,
} from './types.js';

/**
 * Diff two VNodes and patch DOM
 *
 * @param oldVNode - Old VNode
 * @param newVNode - New VNode
 * @param parentElement - Parent DOM element
 * @param parentWidget - Parent widget (for refs)
 * @returns New DOM node
 */
export function diff(
  oldVNode: VNode | null,
  newVNode: VNode | null,
  parentElement: Element,
  parentWidget?: Widget,
): Node | null {
  // Case 1: Both null - do nothing
  if (!oldVNode && !newVNode) {
    return null;
  }

  // Case 2: Old exists, new is null - unmount
  if (oldVNode && !newVNode) {
    const oldNode = findDOMNode(oldVNode);
    if (oldNode) {
      unmount(oldNode, oldVNode);
    }
    return null;
  }

  // Case 3: Old is null, new exists - mount
  if (!oldVNode && newVNode) {
    const newNode = createNode(newVNode);
    if (newNode) {
      parentElement.appendChild(newNode);
    }
    return newNode;
  }

  // Case 4: Both exist - diff
  if (oldVNode && newVNode) {
    // Check for detached nodes (持久化检查)
    if (isDetached(oldVNode)) {
      // Transfer detached mark
      markDetached(newVNode);
      // Skip entire subtree diff
      return findDOMNode(oldVNode);
    }

    // First-time detach marking
    if (hasDetachAttr(newVNode)) {
      markDetached(newVNode);
      // Continue processing for first-time marking
    }

    // Diff component nodes
    if (isComponentVNode(oldVNode) && isComponentVNode(newVNode)) {
      return diffComponent(oldVNode, newVNode, parentElement, parentWidget);
    }

    // Diff element nodes
    if (
      typeof oldVNode.type === 'string' &&
      typeof newVNode.type === 'string'
    ) {
      return diffElement(oldVNode, newVNode, parentElement, parentWidget);
    }

    // Different types - replace
    const oldNode = findDOMNode(oldVNode);
    if (oldNode) {
      replaceNode(oldNode, newVNode, oldVNode);
      return findDOMNode(newVNode);
    }
  }

  return null;
}

/**
 * Diff component VNodes
 */
function diffComponent(
  oldVNode: VNode,
  newVNode: VNode,
  parentElement: Element,
  parentWidget?: Widget,
): Node | null {
  const oldInstance = (oldVNode as any).__instance__;
  const oldRefName = extractRefName(oldVNode);
  const newRefName = extractRefName(newVNode);

  if (canReuseInstance(oldVNode, newVNode)) {
    // Reuse instance
    (newVNode as any).__instance__ = oldInstance;
    (newVNode as any).__instanceKey__ = oldInstance.__key__;

    // Handle ref changes
    if (parentWidget) {
      if (oldRefName !== newRefName) {
        if (oldRefName) {
          parentWidget.refs.delete(oldRefName);
        }
        if (newRefName) {
          parentWidget.refs.set(newRefName, oldInstance);
        }
      } else if (newRefName) {
        parentWidget.refs.set(newRefName, oldInstance);
      }
    }

    // Check for detach
    if (isDetached(newVNode)) {
      // Detached component: reuse instance but skip update()
      const instanceElement = oldInstance.element || null;
      // CRITICAL: Transfer __dom__ to newVNode
      if (instanceElement) {
        (newVNode as any).__dom__ = instanceElement;
      }
      return instanceElement;
    }

    // Normal component: update props
    oldInstance.update(newVNode.props);
    const instanceElement = oldInstance.element || null;

    // CRITICAL: Transfer __dom__ to newVNode for next update cycle
    if (instanceElement) {
      (newVNode as any).__dom__ = instanceElement;
    }

    return instanceElement;
  } else {
    // Cannot reuse - unmount old, create new
    if (oldRefName && parentWidget) {
      parentWidget.refs.delete(oldRefName);
    }

    if (oldInstance) {
      oldInstance.unmount();
    }

    // Create new instance
    const newNode = createNode(newVNode);
    if (newNode && parentElement) {
      // Find old node to replace
      const oldNode = findDOMNode(oldVNode);
      if (oldNode && oldNode.parentNode) {
        oldNode.parentNode.replaceChild(newNode, oldNode);
      } else {
        parentElement.appendChild(newNode);
      }
    }

    return newNode;
  }
}

/**
 * Diff element VNodes
 */
function diffElement(
  oldVNode: VNode,
  newVNode: VNode,
  parentElement: Element,
  parentWidget?: Widget,
): Node | null {
  const oldElement = findDOMNode(oldVNode) as Element;

  if (!oldElement) {
    const newNode = createNode(newVNode);
    if (newNode) {
      parentElement.appendChild(newNode);
    }
    return newNode;
  }

  // Same type element - patch
  if (oldVNode.type === newVNode.type) {
    // Patch props
    patchProps(oldElement, oldVNode.props || {}, newVNode.props || {});

    // Diff children
    diffChildren(
      oldElement,
      oldVNode.children || [],
      newVNode.children || [],
      parentWidget,
    );

    // CRITICAL: Transfer __dom__ to newVNode for next update cycle
    (newVNode as any).__dom__ = oldElement;

    return oldElement;
  } else {
    const newNode = createNode(newVNode);
    if (newNode && oldElement.parentNode) {
      oldElement.parentNode.replaceChild(newNode, oldElement);
    }
    return newNode;
  }
}

/**
 * Diff children (position-based, no key optimization)
 * Maps each old child to its DOM node for accurate patching
 */
function diffChildren(
  parentElement: Element,
  oldChildren: VNodeChild[],
  newChildren: VNodeChild[],
  parentWidget?: Widget,
): void {
  // Build a map of old VNode children to their corresponding DOM nodes
  const oldDOMMap = new Map<VNodeChild, Node>();
  let domIndex = 0;

  for (const oldChild of oldChildren) {
    if (
      oldChild === null ||
      oldChild === undefined ||
      typeof oldChild === 'boolean'
    ) {
      continue;
    }

    const domNode = parentElement.childNodes[domIndex];
    if (domNode) {
      oldDOMMap.set(oldChild, domNode);
      domIndex++;
    }
  }

  // Now diff position by position
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (i < oldChildren.length && i < newChildren.length) {
      // Both exist - diff
      const isOldVNode = isVNode(oldChild);
      const isNewVNode = isVNode(newChild);

      if (isOldVNode && isNewVNode) {
        diff(oldChild as VNode, newChild as VNode, parentElement, parentWidget);
      } else if (oldChild !== newChild) {
        // Text node changed - replace
        const oldNode = oldDOMMap.get(oldChild);
        if (oldNode) {
          const newNode = createNode(newChild);
          if (newNode) {
            parentElement.replaceChild(newNode, oldNode);
          }
        }
      } else {
        // console.log(
        //   `[diffChildren] → Skipping unchanged text at position ${i}`,
        // );
      }
    } else if (i < newChildren.length) {
      // New child - mount
      const newNode = createNode(newChild);
      if (newNode) {
        parentElement.appendChild(newNode);
      }
    } else {
      // Old child - unmount
      const oldNode = oldDOMMap.get(oldChild);
      if (oldNode) {
        if (isVNode(oldChild)) {
          unmount(oldNode, oldChild as VNode);
        } else {
          parentElement.removeChild(oldNode);
        }
      }
    }
  }
}
