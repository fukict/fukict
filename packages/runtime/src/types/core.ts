/**
 * @fukict/runtime - Core Type Definitions
 *
 * Core VNode and basic runtime types
 */

/**
 * VNode child types - supports primitives, VNodes, and nested arrays
 */
export type VNodeChild =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | VNodeChild[];

/**
 * Virtual Node structure
 */
export interface VNode {
  type: string | Function | symbol;
  props: Record<string, any> | null;
  children: VNodeChild[];

  // Internal metadata (added by runtime/extensions)
  __instance__?: any;
  __component__?: Function;
  __detached__?: boolean;
  __slot__?: string;
}

/**
 * Fragment symbol for multiple root elements
 */
export const Fragment = Symbol('Fragment');

/**
 * Ref callback type
 */
export type RefCallback<T extends Element = Element> = (element: T) => void;

/**
 * Unregister function returned by registration APIs
 */
export type UnregisterFn = () => void;
