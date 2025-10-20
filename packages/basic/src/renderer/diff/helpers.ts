/**
 * @fukict/basic - Diff: Helpers
 *
 * Helper functions for diff operations
 */
import type {
  ClassComponentVNode,
  ElementVNode,
  FragmentVNode,
  FukictComponent,
  FunctionComponentVNode,
  PrimitiveVNode,
  VNode,
  VNodeChild,
} from '../../types/index.js';
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
      const classVNode = vnodeObj as ClassComponentVNode;
      const instance = classVNode.__instance__ as FukictComponent | undefined;

      // Get from instance's rendered DOM
      const instanceVNode = instance?.__vnode__;
      if (instanceVNode && '__dom__' in instanceVNode) {
        const dom = instanceVNode.__dom__ as Node | Node[] | undefined;
        if (dom) {
          return Array.isArray(dom) ? dom[0] : dom;
        }
      }

      // Fallback: if not mounted yet, check placeholder
      const placeholder = classVNode.__placeholder__;
      if (placeholder?.parentNode) {
        return placeholder;
      }

      return null;
    }

    // Other types - get from __dom__
    const dom = vnodeObj.__dom__;
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
 * Unmount VNode recursively (call beforeUnmount on all class components)
 */
function unmountVNode(vnode: VNodeChild): void {
  if (!vnode) return;

  // Primitive - nothing to unmount
  if (
    typeof vnode === 'string' ||
    typeof vnode === 'number' ||
    typeof vnode === 'boolean'
  ) {
    return;
  }

  // Array - unmount each item
  if (Array.isArray(vnode)) {
    vnode.forEach(child => unmountVNode(child));
    return;
  }

  // VNode object
  if (typeof vnode === 'object' && '__type__' in vnode) {
    const vnodeObj = vnode as VNode;

    // Class Component - call unmount (which will handle its own __vnode__)
    if (vnodeObj.__type__ === VNodeType.ClassComponent) {
      const classVNode = vnodeObj as ClassComponentVNode;
      const instance = classVNode.__instance__ as FukictComponent | undefined;
      if (instance?.unmount) {
        instance.unmount();
      }
      return;
    }

    // Function Component - unmount its rendered vnode
    if (vnodeObj.__type__ === VNodeType.FunctionComponent) {
      const funcVNode = vnodeObj as FunctionComponentVNode;
      const renderedVNode = funcVNode.__rendered__;
      if (renderedVNode) {
        unmountVNode(renderedVNode);
      }
      return;
    }

    // Fragment - unmount all children
    if (vnodeObj.__type__ === VNodeType.Fragment) {
      const fragmentVNode = vnodeObj as FragmentVNode;
      if (fragmentVNode.children && Array.isArray(fragmentVNode.children)) {
        fragmentVNode.children.forEach(child => unmountVNode(child));
      }
      return;
    }

    // Element - unmount all children recursively
    if (vnodeObj.__type__ === VNodeType.Element) {
      const elementVNode = vnodeObj as ElementVNode;
      if (elementVNode.children && Array.isArray(elementVNode.children)) {
        elementVNode.children.forEach(child => unmountVNode(child));
      }
      return;
    }

    // Primitive - nothing to unmount
    if (vnodeObj.__type__ === VNodeType.Primitive) {
      return;
    }
  }
}

/**
 * Remove node from DOM
 */
export function removeNode(vnode: VNodeChild, container: Element): void {
  if (!vnode) return;

  // First, unmount all components recursively (trigger beforeUnmount hooks)
  unmountVNode(vnode);

  // Then remove DOM nodes
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

    // Class Component - remove placeholder if exists
    if (vnodeObj.__type__ === VNodeType.ClassComponent) {
      const classVNode = vnodeObj as ClassComponentVNode;
      const placeholder = classVNode.__placeholder__;
      if (placeholder?.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
      return;
    }

    // Primitive VNode - remove text or comment node
    if (vnodeObj.__type__ === VNodeType.Primitive) {
      const primitiveVNode = vnodeObj as PrimitiveVNode;
      const dom = primitiveVNode.__dom__;
      if (dom?.parentNode) {
        dom.parentNode.removeChild(dom);
      }
      return;
    }

    // Other types - remove __dom__
    const dom = vnodeObj.__dom__;
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
export function shallowEqual(
  a: Record<string, unknown> | null,
  b: Record<string, unknown> | null,
): boolean {
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
