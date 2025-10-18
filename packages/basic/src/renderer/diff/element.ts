/**
 * @fukict/basic - Diff: Element
 *
 * Diff element VNodes
 */
import type { ElementVNode, VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { setupElementVNode } from '../vnode-helpers.js';
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

  const oldElementVNode = oldVNode as ElementVNode;
  const newElementVNode = newVNode as ElementVNode;

  // Tag name changed - replace entire element
  if (oldElementVNode.type !== newElementVNode.type) {
    replaceNode(oldElementVNode, newElementVNode, container);
    return;
  }

  // Reuse DOM element
  const element = oldElementVNode.__dom__ as Element;
  if (!element) {
    // DOM doesn't exist, replace node
    replaceNode(oldElementVNode, newElementVNode, container);
    return;
  }

  // Setup ElementVNode: save DOM reference
  setupElementVNode(newElementVNode, element);

  // Patch props
  patchProps(element, oldElementVNode.props, newElementVNode.props);

  // Diff children
  diffChildren(oldElementVNode.children, newElementVNode.children, element);
}
