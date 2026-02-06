/**
 * @fukict/basic - DOM Helper Utilities
 *
 * Helper functions for working with DOM references in VNodes
 */
import type { VNode } from '../types/index.js';
import { VNodeType } from '../types/index.js';

/**
 * Check if __node__ is an array (Fragment or multi-node)
 */
export function isDomArray(dom: unknown): dom is Node[] {
  return Array.isArray(dom);
}

/**
 * Normalize __node__ to array (for unified processing)
 */
export function normalizeDom(dom: Node | Node[] | null | undefined): Node[] {
  if (!dom) return [];
  if (Array.isArray(dom)) return dom;
  return [dom];
}

/**
 * Get first DOM node from VNode
 * Returns null for class components (they don't have __node__)
 */
export function getFirstDomNode(vnode: VNode): Node | null {
  // Class components don't have __node__
  if (vnode.__type__ === VNodeType.ClassComponent) {
    return null;
  }

  const dom = '__node__' in vnode ? vnode.__node__ : null;
  if (!dom) return null;

  if (Array.isArray(dom)) {
    return dom[0] || null;
  }

  return dom;
}

/**
 * Get all DOM nodes from VNode
 * Returns empty array for class components
 */
export function getAllDomNodes(vnode: VNode): Node[] {
  // Class components don't have __node__
  if (vnode.__type__ === VNodeType.ClassComponent) {
    return [];
  }

  const dom = '__node__' in vnode ? vnode.__node__ : null;
  return normalizeDom(dom);
}

/**
 * Check if vnode is a valid VNode object
 */
export function isVNode(value: unknown): value is VNode {
  return typeof value === 'object' && value !== null && '__type__' in value;
}
