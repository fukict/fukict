/**
 * @fukict/widget
 *
 * Component abstraction layer for Fukict with lifecycle and state management.
 */

// Re-export runtime APIs (users import everything from widget)
export { render, h, hyperscript, Fragment } from '@fukict/runtime';

// Export component APIs
export { Widget } from './widget/index.js';
export { defineWidget } from './define-widget/index.js';

// Export slots utilities
export { extractSlots, getSlot } from './slots/index.js';

// Export utility functions
export {
  extractRefName,
  extractSlotName,
  hasDetachAttr,
  isDetached,
  markDetached,
} from './utils/index.js';

// Export constants
export { FUKICT_ATTR_PREFIX, FUKICT_ATTRS, isFukictAttr } from './constants/index.js';

// Export types
export type {
  WidgetProps,
  SlotsMap,
  RefsMap,
  DetachedRef,
  WidgetLifecycle,
  WidgetVNode,
} from './types/index.js';

export type { WidgetFunction } from './define-widget/index.js';

// Re-export runtime types
export type { VNode, VNodeChild } from '@fukict/runtime';

// Initialize handlers (side effect import)
import './handlers/index.js';
