/**
 * @fukict/widget - Diff Types
 */
import type { VNode } from '@fukict/runtime';

/**
 * Check if VNode is a component (has __instance__)
 */
export function isComponentVNode(vnode: any): boolean {
  return vnode && typeof vnode === 'object' && '__instance__' in vnode;
}

/**
 * Check if a value is a VNode object
 */
export function isVNode(value: any): value is VNode {
  return value && typeof value === 'object' && 'type' in value;
}

/**
 * Check if component instance can be reused
 */
export function canReuseInstance(oldVNode: VNode, newVNode: VNode): boolean {
  // 1. Component type must match
  if (oldVNode.type !== newVNode.type) {
    return false;
  }

  // 2. If key is specified, keys must match
  const oldKey = oldVNode.props?.key ?? (oldVNode as any).__instanceKey__;
  const newKey = newVNode.props?.key;

  if (oldKey !== undefined && newKey !== undefined) {
    return oldKey === newKey;
  }

  // 3. Default: can reuse (same type component)
  return true;
}

/**
 * Find DOM node from VNode
 */
export function findDOMNode(vnode: VNode | any): Node | null {
  if (!vnode) return null;

  // Check if DOM reference is stored on VNode (from runtime)
  if ((vnode as any).__dom__) {
    return (vnode as any).__dom__;
  }

  // Component VNode - get element from instance
  const instance = (vnode as any).__instance__;
  if (instance && instance.element) {
    return instance.element;
  }

  // For text nodes, this function shouldn't be called
  // Text nodes are handled directly in diffChildren
  return null;
}
