/**
 * @fukict/basic - Class Component Shared Utilities
 *
 * Shared logic for creating and updating class components
 */
import { extractSlots } from '../component-class/slot.js';
import type { ClassComponentVNode, VNode } from '../types/index.js';

/**
 * Internal component instance type (for working with protected properties)
 * This matches the runtime shape of Fukict class instances
 */
interface ComponentInstanceInternal {
  $slots: any;
  $refs: Record<string, any>;
  _parent: unknown | null;
}

/**
 * Internal VNode type with ref owner tracking
 * Note: Uses type instead of interface because VNode is a union type
 */
type VNodeWithRefOwner = VNode & {
  __refOwner__?: unknown;
};

/**
 * Mark slot VNodes with their ref owner (the component that created them)
 *
 * This is critical for correct ref registration:
 * - When slots are rendered, the VNode is created in the parent component
 * - But rendered in the child component
 * - refs should be registered to the parent (ref owner), not the child (slot renderer)
 * - Note: This does NOT change slots ownership - slots still belong to the child component
 *
 * @param slots - Slots object
 * @param refOwner - The component that created these VNodes (parent component)
 */
function markRefOwner(slots: Record<string, unknown>, refOwner: unknown): void {
  if (!refOwner) return;

  for (const slot of Object.values(slots)) {
    if (Array.isArray(slot)) {
      slot.forEach(vnode => {
        if (typeof vnode === 'object' && vnode && '__type__' in vnode) {
          (vnode as VNodeWithRefOwner).__refOwner__ = refOwner;
        }
      });
    } else if (typeof slot === 'object' && slot && '__type__' in slot) {
      (slot as VNodeWithRefOwner).__refOwner__ = refOwner;
    }
  }
}

/**
 * Setup ClassComponentVNode with instance, slots, refs, and parent references
 *
 * This function handles the common logic for both creating and updating class components:
 * 1. Saves instance to vnode
 * 2. Extracts and sets slots from children, marks slot owner
 * 3. Registers instance to parent's $refs (if fukict:ref is specified)
 * 4. Sets parent instance reference
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
  //    Mark each slot VNode with __refOwner__ so refs are registered correctly
  if (vnode.children) {
    const slots = extractSlots(vnode.children);

    // Mark slot VNodes with their ref owner (parentInstance)
    // Note: This does NOT change slots ownership - slots still belong to current component
    markRefOwner(slots, parentInstance);

    instanceInternal.$slots = slots;
  }

  // 3. Handle fukict:ref for class components
  //    Use __refOwner__ if present (for components in slots)
  //    Otherwise use parentInstance (for direct children)
  const refTarget = (vnode as VNodeWithRefOwner).__refOwner__ || parentInstance;

  if (refTarget && vnode.props && vnode.props['fukict:ref']) {
    const refName: unknown = vnode.props['fukict:ref'];
    if (typeof refName === 'string') {
      const targetInternal = refTarget as ComponentInstanceInternal;

      // Directly assign instance to parent's $refs (no Ref wrapper)
      targetInternal.$refs[refName] = instance;
    }
  }

  // 4. Set parent instance reference (for context chain)
  // Only update when parentInstance is explicitly provided (during creation).
  // During diff, parentInstance is undefined — preserve existing _parent.
  if (parentInstance !== undefined) {
    instanceInternal._parent = parentInstance;
  }
}
