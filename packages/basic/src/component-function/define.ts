/**
 * @fukict/basic - Function Component Helper
 *
 * Helper function for type inference in function components
 */
import type { FukictSlotAttribute } from '../types';
import type { VNode, VNodeChild } from '../types/core.js';

/**
 * Props type for function component with children support
 * Children can have fukict:slot attribute
 */
export type FunctionComponentProps<P = {}> = P &
  FukictSlotAttribute & {
    children?: VNodeChild | VNodeChild[];
  };

/**
 * Function component type with props and children
 */
export type FunctionComponent<P = {}> = (
  props: FunctionComponentProps<P>,
) => VNode | null;

/**
 * Define a function component with type inference
 *
 * This is a no-op helper function that provides better TypeScript type inference.
 * It doesn't change the runtime behavior, just helps with types.
 *
 * @example
 * ```typescript
 * const Greeting = defineFukict<{ name: string }>((props) => {
 *   return h('div', null, [`Hello, ${props.name}!`]);
 * });
 * ```
 *
 * @param fn - Function component
 * @returns The same function with better types
 */
export function defineFukict<P = {}>(
  fn: FunctionComponent<P>,
): FunctionComponent<P> {
  return fn;
}
