/**
 * @fukict/basic - Class Component Type Definitions
 *
 * Types for Fukict class components (stateful, lifecycle, self-updating)
 * Runtime implementation is in component-class/index.ts
 */
import type { VNode, VNodeChild } from './core.js';

/**
 * Slots object type
 * Maps slot names to their content (single VNodeChild or array)
 */
export type Slots = Record<string, VNodeChild | VNodeChild[]>;

/**
 * Ref object type
 * Holds a reference to a DOM element or component instance
 *
 * @deprecated Direct instance assignment is preferred. Use `refs: { myRef: MyComponent }` instead.
 */
export interface Ref<T = any> {
  current: T | null;
}

/**
 * Refs object type (for class components)
 * Maps ref names to component instances or DOM elements directly (no wrapper)
 *
 * @example
 * ```ts
 * class Parent extends Fukict {
 *   // Type-safe refs
 *   declare readonly refs: {
 *     counter: Counter;
 *     input: HTMLInputElement;
 *   };
 *
 *   handleClick() {
 *     this.refs.counter.increment();
 *     this.refs.input.focus();
 *   }
 * }
 * ```
 */
export type Refs = Record<string, any>;

/**
 * Lifecycle hooks interface for Fukict class components
 */
export interface FukictLifecycle<P extends Record<string, any> = any> {
  /**
   * Called after component is mounted to DOM
   * Use for: DOM manipulation, event listeners, data fetching
   */
  mounted?(): void;

  /**
   * Called before component is unmounted from DOM
   * Use for: cleanup, removing event listeners, canceling timers
   */
  beforeUnmount?(): void;

  /**
   * Called after component is updated (props changed or self-update)
   * @param prevProps - Previous props before update
   */
  updated?(prevProps: P): void;
}

/**
 * Fukict class component interface
 *
 * Type parameters:
 * - P: Props type (extends Record<string, any>)
 * - S: Slots type (extends Slots, default to Slots)
 */
export interface FukictComponent<
  P extends Record<string, any> = {},
  S extends Slots = Slots,
> extends FukictLifecycle<P> {
  /** Component props (readonly) */
  readonly props: P;

  /** Extracted slots from children */
  readonly slots: S;

  /** Refs object (can be extended by subclasses) */
  readonly refs: Refs;

  /** Current rendered VNode (internal, framework use) */
  __vnode__: VNode | null;

  /** Parent DOM container (internal, framework use) */
  __container__: Element | null;

  /** Render method (must be implemented) */
  render(): VNode;

  /**
   * Update component (props-driven update with built-in diff)
   *
   * Called by renderer when parent updates props.
   * Can be overridden for custom update logic (e.g., shouldUpdate).
   * Skipped when fukict:detach is set (props updated, but no re-render).
   */
  update(newProps: P): void;

  /**
   * Mount method (called by renderer after instance creation)
   * @internal
   */
  mount(container: Element, placeholder?: Comment): void;

  /** Unmount method (internal, framework use) */
  unmount(): void;
}

/**
 * Helper type to extract props type from Fukict component
 */
export type FukictProps<T> =
  T extends FukictComponent<infer P, any> ? P : never;

/**
 * Helper type to extract slots type from Fukict component
 */
export type FukictSlots<T> =
  T extends FukictComponent<any, infer S> ? S : never;

/**
 * Helper type for Fukict class constructor
 */
export type FukictConstructor<
  P extends Record<string, any> = any,
  S extends Slots = Slots,
> = new (props: P, children?: VNodeChild[]) => FukictComponent<P, S>;
