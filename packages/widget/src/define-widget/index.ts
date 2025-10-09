/**
 * @fukict/widget - defineWidget Function
 *
 * Factory function for creating function components.
 * Function components are lightweight, stateless components without lifecycle.
 */
import type { VNode } from '@fukict/runtime';

import type { WidgetProps } from '../types/index.js';

/**
 * Function component type
 */
export type WidgetFunction<TProps extends WidgetProps = WidgetProps> = (
  props: TProps,
) => VNode;

/**
 * Internal marker for function components
 */
const WIDGET_FUNCTION_TYPE = Symbol('WIDGET_FUNCTION');

/**
 * Define a function component
 *
 * @param fn - Function component
 * @returns Marked function component
 *
 * @example
 * ```tsx
 * const Greeting = defineWidget(({ name }: { name: string }) => (
 *   <div>Hello {name}</div>
 * ));
 * ```
 */
export function defineWidget<TProps extends WidgetProps = WidgetProps>(
  fn: WidgetFunction<TProps>,
): WidgetFunction<TProps> {
  // Mark as widget function component
  (fn as any).__COMPONENT_TYPE__ = 'WIDGET_FUNCTION';
  (fn as any).__WIDGET_FUNCTION_TYPE__ = WIDGET_FUNCTION_TYPE;

  return fn;
}

/**
 * Check if a function is a widget function component
 * @param fn - Function to check
 */
export function isWidgetFunction(fn: any): fn is WidgetFunction {
  return (
    typeof fn === 'function' &&
    (fn.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION' ||
      fn.__WIDGET_FUNCTION_TYPE__ === WIDGET_FUNCTION_TYPE)
  );
}
