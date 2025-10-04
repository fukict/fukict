/**
 * VNode-DOM 双向映射缓存
 * 使用 WeakMap 实现自动垃圾回收的映射关系管理
 *
 * @fileoverview VNode 与 DOM 节点的双向映射缓存系统
 * @module @fukict/runtime/vnode-cache
 * @performance 使用 WeakMap 确保不阻止垃圾回收，自动内存管理
 */
import type { VNode } from '../types';

/**
 * VNode 到 DOM 节点的映射
 * 用于快速查找 VNode 对应的真实 DOM 节点
 */
const vNodeToDOMMap = new WeakMap<VNode, Node>();

/**
 * DOM 节点到 VNode 的映射
 * 用于反向查找 DOM 节点对应的 VNode
 */
const domToVNodeMap = new WeakMap<Node, VNode>();

/**
 * 建立 VNode 和 DOM 节点的双向映射关系
 *
 * @param vnode - 虚拟节点
 * @param dom - 真实 DOM 节点
 *
 * @example
 * ```typescript
 * const vnode = { type: 'div', props: {}, children: [] };
 * const dom = document.createElement('div');
 * setVNodeDOM(vnode, dom);
 * ```
 */
export function setVNodeDOM(vnode: VNode, dom: Node): void {
  if (!vnode || !dom) {
    console.warn('[@fukict/runtime] Invalid vnode or dom for cache');
    return;
  }

  vNodeToDOMMap.set(vnode, dom);
  domToVNodeMap.set(dom, vnode);
}

/**
 * 获取 VNode 对应的 DOM 节点
 *
 * @param vnode - 虚拟节点
 * @returns 对应的 DOM 节点，如果不存在则返回 undefined
 *
 * @example
 * ```typescript
 * const dom = getVNodeDOM(vnode);
 * if (dom) {
 *   // 使用 DOM 节点
 * }
 * ```
 */
export function getVNodeDOM(vnode: VNode): Node | undefined {
  return vNodeToDOMMap.get(vnode);
}

/**
 * 获取 DOM 节点对应的 VNode
 *
 * @param dom - DOM 节点
 * @returns 对应的 VNode，如果不存在则返回 undefined
 *
 * @example
 * ```typescript
 * const vnode = getDOMVNode(domElement);
 * if (vnode) {
 *   // 使用 VNode
 * }
 * ```
 */
export function getDOMVNode(dom: Node): VNode | undefined {
  return domToVNodeMap.get(dom);
}

/**
 * 清除 VNode 的映射关系
 *
 * @param vnode - 要清除映射的虚拟节点
 *
 * @example
 * ```typescript
 * clearVNodeDOM(vnode);
 * ```
 */
export function clearVNodeDOM(vnode: VNode): void {
  const dom = vNodeToDOMMap.get(vnode);
  if (dom) {
    domToVNodeMap.delete(dom);
  }
  vNodeToDOMMap.delete(vnode);
}

/**
 * 清除 DOM 节点的映射关系
 *
 * @param dom - 要清除映射的 DOM 节点
 *
 * @example
 * ```typescript
 * clearDOMVNode(domElement);
 * ```
 */
export function clearDOMVNode(dom: Node): void {
  const vnode = domToVNodeMap.get(dom);
  if (vnode) {
    vNodeToDOMMap.delete(vnode);
  }
  domToVNodeMap.delete(dom);
}
