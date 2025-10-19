/**
 * @fukict/runtime - Type Definitions Index
 *
 * Centralized export for all runtime types
 */

// Core types
export type {
  VNode,
  VNodeChild,
  RefCallback,
  UnregisterFn,
  ElementVNode,
  FragmentVNode,
  FunctionComponentVNode,
  ClassComponentVNode,
} from './core.js';
export { Fragment, VNodeType } from './core.js';

// Class component types
export type {
  Slots,
  Ref,
  Refs,
  FukictLifecycle,
  FukictComponent,
  FukictProps,
  FukictSlots,
  FukictConstructor,
} from './class.js';

// Event types
export type { EventHandlers } from './events';

// DOM attribute types
export type {
  CSSProperties,
  ClassValue,
  RuntimeAttributes,
  HTMLAttributes,
  SVGAttributes,
  FukictSlotAttribute,
  FukictRefAttribute,
  FukictDetachAttribute,
} from './dom-attributes';

// JSX types (for TypeScript compiler)
export type { JSX } from './jsx';
