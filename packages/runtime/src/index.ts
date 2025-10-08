/**
 * @fukict/runtime
 *
 * Lightweight DOM rendering runtime with extension mechanism
 */

// Types
export type {
  VNode,
  VNodeChild,
  ComponentHandler,
  UnregisterFn,
  RefCallback,
  CSSProperties,
  RuntimeAttributes,
  EventHandlers,
  HTMLAttributes,
  SVGAttributes,
} from './types/index.js';

export { Fragment } from './types/index.js';

// VNode creation
export { hyperscript, h, jsx, jsxs, jsxDEV } from './vnode.js';

// Rendering
export { render, replaceNode, unmount } from './renderer/index.js';

// Component handlers registry
export {
  registerComponentHandler,
  findComponentHandler,
  getHandlers,
} from './component-handlers.js';

// DOM utilities (exported for widget package use)
export * as dom from './dom/index.js';
