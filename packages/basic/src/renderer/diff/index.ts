/**
 * @fukict/basic - Diff Module
 *
 * Public exports for diff operations
 */

// Core diff functions
export { diff, diffChildren } from './reconciler.js';

// DOM operations
export { removeNode, replaceNode } from './dom-ops.js';

// Utils
export { shallowEqual } from './utils.js';

// Props
export { patchProps } from './props.js';
