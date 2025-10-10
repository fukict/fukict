/**
 * @fukict/basic - Diff: Helpers
 *
 * Helper functions for diff operations
 */
import type { VNode, VNodeChild } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { createRealNode } from '../create.js';
import { activate } from '../mount.js';

/**
 * Get the first DOM node from a VNode
 */
function getFirstDomNode(vnode: VNodeChild): Node | null {
  if (!vnode) return null;

  // Primitive - not reliable
  if (
    typeof vnode === 'string' ||
    typeof vnode === 'number' ||
    typeof vnode === 'boolean'
  ) {
    return null;
  }

  // VNode object
  if (typeof vnode === 'object' && '__type__' in vnode) {
    const vnodeObj = vnode as VNode;

    // Class Component - get DOM from instance
    if (vnodeObj.__type__ === VNodeType.ClassComponent) {
      const instance = (vnodeObj as any).__instance__;

      // Get from instance's rendered DOM
      const dom = instance?.__vnode__?.__dom__;
      if (dom) {
        return Array.isArray(dom) ? dom[0] : dom;
      }

      // Fallback: if not mounted yet, check placeholder
      const placeholder = (vnodeObj as any).__placeholder__;
      if (placeholder && placeholder.parentNode) {
        return placeholder;
      }

      return null;
    }

    // Other types - get from __dom__
    const dom = (vnodeObj as any).__dom__;
    if (dom) {
      return Array.isArray(dom) ? dom[0] : dom;
    }
  }

  return null;
}

/**
 * Replace old node with new node
 */
export function replaceNode(
  oldVNode: VNodeChild,
  newVNode: VNodeChild,
  container: Element,
): void {
  if (!oldVNode) {
    throw new Error('Old VNode is required for replaceNode');
  }

  // Get the first DOM node of oldVNode to find insertion position
  const oldFirstNode = getFirstDomNode(oldVNode);
  const nextSibling = oldFirstNode?.nextSibling ?? null;

  // Remove old node
  removeNode(oldVNode, container);

  // Create new node
  const node = createRealNode(newVNode);

  if (!node) {
    return;
  }

  // Insert placeholder at the same position
  const placeholder = document.createComment('fukict-replace');

  if (nextSibling && nextSibling.parentNode === container) {
    container.insertBefore(placeholder, nextSibling);
  } else {
    container.appendChild(placeholder);
  }

  // Use activate in placeholder mode - it will replace placeholder with DOM
  activate({ vnode: newVNode, placeholder });
}

/**
 * Remove node from DOM
 */
export function removeNode(vnode: VNodeChild, container: Element): void {
  if (!vnode) return;

  // Primitive - find and remove text node (simplified)
  if (
    typeof vnode === 'string' ||
    typeof vnode === 'number' ||
    typeof vnode === 'boolean'
  ) {
    const text = String(vnode);
    const textNodes = Array.from(container.childNodes).filter(
      node => node.nodeType === Node.TEXT_NODE && node.textContent === text,
    );
    textNodes.forEach(node => container.removeChild(node));
    return;
  }

  // VNode object
  if (typeof vnode === 'object' && '__type__' in vnode) {
    const vnodeObj = vnode as VNode;

    // Class Component - call unmount
    if (vnodeObj.__type__ === VNodeType.ClassComponent) {
      const instance = (vnodeObj as any).__instance__;
      if (instance && typeof instance.unmount === 'function') {
        instance.unmount();
      }

      // Remove placeholder if exists
      const placeholder = (vnodeObj as any).__placeholder__;
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }

      return;
    }

    // Other types - remove __dom__
    const dom = (vnodeObj as any).__dom__;
    if (dom) {
      if (Array.isArray(dom)) {
        dom.forEach((node: Node) => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      } else if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    }
  }
}

/**
 * Shallow compare two objects
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
