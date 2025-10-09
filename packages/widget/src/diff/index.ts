/**
 * @fukict/widget - Diff/Patch Algorithm
 *
 * Minimal diff algorithm for VNode trees
 * - Component instance reuse
 * - Detached node handling
 * - Position-based children diff (no key-based optimization in v1)
 */

// Export main diff function
export { diff } from './core.js';

// Export utility functions (for internal use or testing)
export {
  isComponentVNode,
  isVNode,
  canReuseInstance,
  findDOMNode,
} from './types.js';

export { patchProps } from './props.js';
