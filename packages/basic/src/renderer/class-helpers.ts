/**
 * @fukict/basic - Class Component Shared Utilities
 *
 * Shared logic for creating and updating class components
 */
import { extractSlots } from '../component-class/slot.js';
import type { Ref } from '../types/class.js';
import type { ClassComponentVNode, VNode } from '../types/index.js';

/**
 * Internal component instance type (for working with protected properties)
 * This matches the runtime shape of Fukict class instances
 */
interface ComponentInstanceInternal {
  slots: any;
  refs: Map<string | symbol, Ref>;
  __wrapper__: VNode | null;
}

/**
 * Setup ClassComponentVNode with instance, slots, refs, and parent references
 *
 * This function handles the common logic for both creating and updating class components:
 * 1. Saves instance to vnode
 * 2. Extracts and sets slots from children
 * 3. Registers instance to parent's refs (if fukict:ref is specified)
 * 4. Updates wrapper VNode reference
 * 5. Updates parent instance reference on wrapper VNode
 *
 * Used by both renderClassComponent (create) and diffClassComponent (update).
 *
 * @param vnode - The ClassComponentVNode to setup
 * @param instance - The class component instance
 * @param parentInstance - The parent component instance (optional)
 */
export function setupClassComponentVNode(
  vnode: ClassComponentVNode,
  instance: unknown,
  parentInstance?: unknown,
): void {
  const instanceInternal = instance as ComponentInstanceInternal;

  // 1. Save instance to vnode
  vnode.__instance__ = instance;

  // 2. Extract and set slots from children
  if (vnode.children) {
    instanceInternal.slots = extractSlots(vnode.children);
  }

  // 3. Handle fukict:ref for class components
  //    If parent is a class component and this component has fukict:ref,
  //    register this instance to parent's refs
  if (parentInstance && vnode.props && vnode.props['fukict:ref']) {
    const refName: unknown = vnode.props['fukict:ref'];
    if (typeof refName === 'string') {
      const parentInternal = parentInstance as ComponentInstanceInternal;

      // Create or update ref in parent component
      if (!parentInternal.refs.has(refName)) {
        parentInternal.refs.set(refName, { current: null });
      }
      const ref = parentInternal.refs.get(refName);
      if (ref) {
        ref.current = instance;
      }
    }
  }

  // 4. Update wrapper VNode reference
  instanceInternal.__wrapper__ = vnode;

  // 5. Update parent instance reference on wrapper VNode (for context chain)
  if (parentInstance) {
    (
      vnode as ClassComponentVNode & { __parentInstance__?: unknown }
    ).__parentInstance__ = parentInstance;
  }
}
