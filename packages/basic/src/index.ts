/**
 * @fukict/runtime
 *
 * Lightweight DOM rendering runtime with extension mechanism
 */
// Package metadata
import { METADATA } from './metadata.js';

export { METADATA };

export const VERSION = METADATA.version;

// Types
export type {
  VNode,
  VNodeChild,
  UnregisterFn,
  RefCallback,
  CSSProperties,
  ClassValue,
  RuntimeAttributes,
  EventHandlers,
  HTMLAttributes,
  SVGAttributes,
  Slots,
  Ref,
  FukictLifecycle,
  FukictComponent,
  FukictProps,
  FukictSlots,
  FukictConstructor,
} from './types/index.js';

// Context types (v3.1)
export type { Context, ContextData } from './types/context.js';

export { VNodeType } from './types/index.js';

// JSX types (for extending in widget package)
export type { JSX } from './types/jsx.js';

export { Fragment } from './types/index.js';

// VNode creation
export { hyperscript, h, jsx, jsxs, jsxDEV } from './vnode.js';

// Class component
export { Fukict } from './component-class/index.js';

// Function component
export { defineFukict } from './component-function/index.js';
export type { FunctionComponent } from './component-function/index.js';

// Rendering
export { attach, replaceNode, unmount, diff } from './renderer/index.js';

// DOM node creation (exported for advanced use)
export { createRealNode } from './renderer/create.js';

// DOM helper utilities
export {
  isDomArray,
  normalizeDom,
  getFirstDomNode,
  getAllDomNodes,
  isVNode,
} from './utils/dom-helpers.js';

// DOM utilities (exported for widget package use)
export * as dom from './dom/index.js';
