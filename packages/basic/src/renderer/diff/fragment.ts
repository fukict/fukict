/**
 * @fukict/basic - Diff: Fragment
 *
 * Diff fragment VNodes
 */
import type { FragmentVNode, VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { setupFragmentVNode } from '../vnode-helpers.js';
import { diffChildren } from './children.js';

/**
 * Diff Fragment VNode
 * - Diff children array
 * - Update __node__ array
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

  const newFragmentVNode = newVNode as FragmentVNode;

  // Diff children
  diffChildren(oldVNode.children, newFragmentVNode.children, container);

  // Update __node__ reference (collect all current child nodes)
  const newNodes: Node[] = [];
  for (const child of newFragmentVNode.children) {
    if (child && typeof child === 'object' && '__node__' in child) {
      const dom = child.__node__;
      if (dom) {
        if (Array.isArray(dom)) {
          newNodes.push(...dom);
        } else {
          newNodes.push(dom);
        }
      }
    }
  }

  // Setup FragmentVNode: save DOM nodes array reference
  setupFragmentVNode(newFragmentVNode, newNodes);
}
