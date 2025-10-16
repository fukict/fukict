/**
 * @fukict/basic - Diff: Element
 *
 * Diff element VNodes
 */
import type { VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { diffChildren } from './children.js';
import { replaceNode } from './helpers.js';
import { patchProps } from './props.js';

/**
 * Diff Element VNode
 * - Reuse DOM node
 * - Patch props
 * - Recursively diff children
 */
export function diffElement(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.Element ||
    newVNode.__type__ !== VNodeType.Element
  ) {
    throw new Error('Expected ElementVNode');
  }

  // Tag name changed - replace entire element
  if (oldVNode.type !== newVNode.type) {
    replaceNode(oldVNode, newVNode, container);
    return;
  }

  // Reuse DOM element
  const element = oldVNode.__dom__ as Element;
  if (!element) {
    // DOM doesn't exist, replace node
    replaceNode(oldVNode, newVNode, container);
    return;
  }

  newVNode.__dom__ = element;

  // Patch props
  patchProps(element, oldVNode.props, newVNode.props);

  // Diff children
  diffChildren(oldVNode.children, newVNode.children, element);
}
