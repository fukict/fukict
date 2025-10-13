/**
 * @fukict/basic - Context Types
 *
 * Context system for passing data down the component tree
 * without prop drilling. Context is stored on VNode tree with
 * no global state.
 */

/**
 * Context definition
 *
 * Use Symbol or string as key for type-safe context.
 * Symbol is recommended for production to avoid naming collisions.
 *
 * @example
 * ```ts
 * // contexts.ts
 * export const THEME_CONTEXT = Symbol('theme');
 * export interface ThemeContext {
 *   mode: 'light' | 'dark';
 *   color: string;
 * }
 * ```
 */
export interface Context<T> {
  key: string | symbol;
  defaultValue?: T;
}

/**
 * Context data structure on VNode
 * @internal
 */
export interface ContextData {
  [key: string | symbol]: any;
  __parent__?: ContextData;
}
