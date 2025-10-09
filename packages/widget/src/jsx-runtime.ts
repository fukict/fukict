/**
 * @fukict/widget - JSX Runtime
 *
 * Re-exports @fukict/runtime JSX runtime and extends types for Widget-specific attributes
 * Use with: "jsxImportSource": "@fukict/widget"
 */
import type { JSX as RuntimeJSX } from '@fukict/runtime';

// Re-export all runtime functions
export { Fragment, jsx, jsxs, jsxDEV } from '@fukict/runtime';

/**
 * Extended JSX namespace for Widget
 * Adds support for fukict:ref, fukict:slot, fukict:detach attributes
 */
export declare namespace JSX {
  // Inherit all runtime JSX types
  interface Element extends RuntimeJSX.Element {}
  interface IntrinsicElements extends RuntimeJSX.IntrinsicElements {}
  interface ElementChildrenAttribute
    extends RuntimeJSX.ElementChildrenAttribute {}

  // Extend with Widget-specific attributes
  interface IntrinsicAttributes {
    /**
     * Component reference name
     * Registers component instance in parent's refs map
     *
     * @example
     * <MyWidget fukict:ref="myWidget" />
     * // Access via: this.refs.get('myWidget')
     */
    'fukict:ref'?: string;

    /**
     * Named slot identifier
     * Marks element as slot content for parent component
     *
     * @example
     * <div fukict:slot="header">Header Content</div>
     * // Access via: this.slots.get('header')
     */
    'fukict:slot'?: string;

    /**
     * Detach marker
     * Prevents diff/patch on this subtree (performance optimization)
     *
     * @example
     * <ExpensiveComponent fukict:detach />
     * // This subtree will be skipped during parent updates
     */
    'fukict:detach'?: boolean;

    /**
     * Children prop
     * All components support children
     */
    children?: RuntimeJSX.Element | RuntimeJSX.Element[];
  }
}
