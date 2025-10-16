/**
 * @fukict/basic - Diff: Class Component
 *
 * Diff class component VNodes
 */
import type { VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { replaceNode } from './helpers.js';

/**
 * Diff Class Component VNode
 * - Call instance.update(newProps)
 * - Handle detached mode (fukict:detach)
 */
export function diffClassComponent(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.ClassComponent ||
    newVNode.__type__ !== VNodeType.ClassComponent
  ) {
    throw new Error('Expected ClassComponentVNode');
  }

  // Class changed - replace entire component
  if (oldVNode.type !== newVNode.type) {
    replaceNode(oldVNode, newVNode, container);
    return;
  }

  // Reuse instance
  const instance = oldVNode.__instance__;
  newVNode.__instance__ = instance;

  // Check detached mode
  if (newVNode.props && newVNode.props['fukict:detach']) {
    // Detached mode: only update props, skip update()
    instance.props = newVNode.props;
    return;
  }

  // Normal mode: call instance.update(newProps)
  if (instance && typeof instance.update === 'function') {
    instance.update(newVNode.props);
  }
}
