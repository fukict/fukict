/**
 * @fukict/basic - Diff: Class Component
 *
 * Diff class component VNodes
 */
import type { FukictComponent } from '../../types/class.js';
import type { ClassComponentVNode, VNode } from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { setupClassComponentVNode } from '../class-helpers.js';
import { replaceNode } from './helpers.js';

/**
 * Extended FukictComponent interface with internal properties
 * (These are defined in Fukict class but not in FukictComponent interface)
 */
interface FukictComponentInternal extends FukictComponent {
  __wrapper__: VNode | null;
}

/**
 * Diff Class Component VNode
 * - Update slots and refs
 * - Call instance.update(newProps)
 * - Handle detached mode (fukict:detach)
 */
export function diffClassComponent(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
  parentInstance?: FukictComponent,
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
  const instance = oldClassVNode.__instance__ as
    | FukictComponentInternal
    | undefined;

  if (!instance) {
    console.warn('[diffClassComponent] Instance is undefined, skipping diff');
    return;
  }

  // Setup ClassComponentVNode: instance, slots, refs, wrapper, parent reference
  setupClassComponentVNode(newClassVNode, instance, parentInstance);

  // Copy placeholder from old vnode
  newClassVNode.__placeholder__ = oldClassVNode.__placeholder__;

  // Check detached mode
  if (newClassVNode.props && newClassVNode.props['fukict:detach']) {
    // Detached mode: only update props, skip update()
    // Use same pattern as Fukict.update() - cast to bypass readonly
    (instance.props as Record<string, any>) = newClassVNode.props;
    return;
  }

  // Normal mode: call instance.update(newProps)
  if (typeof instance.update === 'function') {
    instance.update(newClassVNode.props ?? {});
  }
}
