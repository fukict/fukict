/**
 * @fukict/basic - Diff: Fragment
 *
 * Diff fragment VNodes
 */
import type { VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { diffChildren } from './children.js';

/**
 * Diff Fragment VNode
 * - Diff children array
 * - Update __dom__ array
 */
export function diffFragment(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.Fragment ||
    newVNode.__type__ !== VNodeType.Fragment
  ) {
    throw new Error('Expected FragmentVNode');
  }

  // Diff children
  diffChildren(oldVNode.children, newVNode.children, container);

  // Update __dom__ reference (collect all current child nodes)
  const newNodes: Node[] = [];
  for (const child of newVNode.children) {
    if (child && typeof child === 'object' && '__dom__' in child) {
      const dom = child.__dom__;
      if (dom) {
        if (Array.isArray(dom)) {
          newNodes.push(...dom);
        } else {
          newNodes.push(dom);
        }
      }
    }
  }
  newVNode.__dom__ = newNodes;
}
