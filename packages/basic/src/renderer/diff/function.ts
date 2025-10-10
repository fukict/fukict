/**
 * @fukict/basic - Diff: Function Component
 *
 * Diff function component VNodes
 */
import type { VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { replaceNode, shallowEqual } from './helpers.js';
import { diff } from './index.js';

/**
 * Diff Function Component VNode
 * - Shallow compare props
 * - Re-call function if props changed
 * - Recursively diff __rendered__
 */
export function diffFunctionComponent(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.FunctionComponent ||
    newVNode.__type__ !== VNodeType.FunctionComponent
  ) {
    throw new Error('Expected FunctionComponentVNode');
  }

  // Function changed - replace
  if (oldVNode.type !== newVNode.type) {
    replaceNode(oldVNode, newVNode, container);
    return;
  }

  // Shallow compare props
  if (shallowEqual(oldVNode.props, newVNode.props)) {
    // Props unchanged - reuse rendered result
    (newVNode as any).__rendered__ = (oldVNode as any).__rendered__;
    (newVNode as any).__dom__ = (oldVNode as any).__dom__;
    return;
  }

  // Props changed - re-call function
  // Merge children into props (like React)
  const propsWithChildren = {
    ...newVNode.props,
    children:
      newVNode.children.length === 1 ? newVNode.children[0] : newVNode.children,
  };
  const rendered = (newVNode.type as Function)(propsWithChildren);
  (newVNode as any).__rendered__ = rendered;

  // Diff old and new rendered result
  const oldRendered = (oldVNode as any).__rendered__;
  diff(oldRendered, rendered, container);

  // Update __dom__ reference
  if (rendered && typeof rendered === 'object' && '__dom__' in rendered) {
    (newVNode as any).__dom__ = (rendered as any).__dom__;
  }
}
