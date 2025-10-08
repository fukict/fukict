/**
 * @fukict/runtime - DOM Utilities
 *
 * Unified exports for DOM operations
 */

// Element creation
export { createElement, createTextNode, isSVGTag } from './element.js';

// Node operations
export {
  appendChild,
  removeChild,
  replaceChild,
  insertBefore,
} from './node.js';

// Attributes and properties
export {
  setAttribute,
  removeAttribute,
  setProperty,
  setStyle,
} from './attributes.js';

// Events
export { addEventListener, removeEventListener } from './events.js';
