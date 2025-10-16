/**
 * @fukict/basic - Diff: Class Component
 *
 * Diff class component VNodes
 */
import type { FukictComponent } from '../../types/class.js';
import type { ClassComponentVNode, VNode } from '../../types/index.js';
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

  // Type assertion after runtime check
  const oldClassVNode = oldVNode as ClassComponentVNode;
  const newClassVNode = newVNode as ClassComponentVNode;

  // Class changed - replace entire component
  if (oldClassVNode.type !== newClassVNode.type) {
    replaceNode(oldClassVNode, newClassVNode, container);
    return;
  }

  // Reuse instance
  const instance = oldClassVNode.__instance__ as FukictComponent | undefined;
  newClassVNode.__instance__ = instance;

  // Check detached mode
  if (newClassVNode.props && newClassVNode.props['fukict:detach']) {
    // Detached mode: only update props, skip update()
    if (instance) {
      // Use same pattern as Fukict.update() - cast to bypass readonly
      (instance.props as Record<string, any>) = newClassVNode.props;
    }
    return;
  }

  // Normal mode: call instance.update(newProps)
  if (instance && typeof instance.update === 'function') {
    instance.update(newClassVNode.props ?? {});
  }
}
