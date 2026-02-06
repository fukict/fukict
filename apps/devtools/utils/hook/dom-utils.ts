/**
 * DOM utility functions for hook
 * Pure functions - no shared state dependency
 */
import type { ComponentInfo } from './types.js';

/**
 * Recursively find DOM nodes from VNode
 */
export function findDOMFromVNode(vnode: any): Node | Node[] | null {
  if (!vnode) return null;

  if (vnode.__node__) {
    return vnode.__node__;
  }

  if (vnode.__type__ === 'class' && vnode.__instance__) {
    return findDOMFromVNode(vnode.__instance__._render);
  }

  if (vnode.__type__ === 'function' && vnode.__render__) {
    return findDOMFromVNode(vnode.__render__);
  }

  if (vnode.children && Array.isArray(vnode.children)) {
    for (const child of vnode.children) {
      if (Array.isArray(child)) {
        for (const c of child) {
          const dom = findDOMFromVNode(c);
          if (dom) return dom;
        }
      } else {
        const dom = findDOMFromVNode(child);
        if (dom) return dom;
      }
    }
  }

  return null;
}

/** Bounds result type */
export type Bounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Extract first Element from a DOM node result
 */
function resolveElement(domNode: Node | Node[]): Element | null {
  if (Array.isArray(domNode)) {
    if (domNode.length === 0) return null;
    const el = domNode[0];
    return el instanceof Element ? el : null;
  }
  return domNode instanceof Element ? domNode : null;
}

/**
 * Calculate element bounds (absolute position)
 */
function calcBounds(element: Element): Bounds {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Get DOM element bounds for a class component instance
 */
export function getComponentBounds(instance: any): Bounds | undefined {
  try {
    const domNode = findDOMFromVNode(instance._render);
    if (!domNode) return undefined;
    const element = resolveElement(domNode);
    return element ? calcBounds(element) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get DOM element bounds from a function component vnode
 */
export function getFunctionComponentBounds(vnode: any): Bounds | undefined {
  try {
    const domNode = findDOMFromVNode(vnode.__render__ || vnode);
    if (!domNode) return undefined;
    const element = resolveElement(domNode);
    return element ? calcBounds(element) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extract VNode metadata from a component instance
 */
export function extractVNodeInfo(instance: any): ComponentInfo['vnodeInfo'] {
  const vnode = instance._render;
  let nodeType: string | null = null;
  let childrenCount = 0;

  if (vnode) {
    const domNode = findDOMFromVNode(vnode);
    if (domNode) {
      if (Array.isArray(domNode)) {
        nodeType =
          domNode.length > 0
            ? ((domNode[0] as Element).nodeName ?? null)
            : null;
      } else {
        nodeType = (domNode as Element).nodeName ?? null;
      }
    }
    if (vnode.children && Array.isArray(vnode.children)) {
      childrenCount = vnode.children.length;
    }
  }

  return {
    type: vnode?.__type__ ?? 'unknown',
    hasRender: !!instance._render,
    nodeType,
    childrenCount,
  };
}
