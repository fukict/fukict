/**
 * @fukict/runtime - Type Definitions Index
 *
 * Centralized export for all runtime types
 */

// Core types
export type { VNode, VNodeChild, RefCallback, UnregisterFn } from './core.js';
export { Fragment } from './core.js';

// Extension system types
export type { ComponentHandler } from './extensions';

// Event types
export type { EventHandlers } from './events';

// DOM attribute types
export type {
  CSSProperties,
  RuntimeAttributes,
  HTMLAttributes,
  SVGAttributes,
} from './dom-attributes';

// JSX types (for TypeScript compiler)
export type { JSX } from './jsx';
