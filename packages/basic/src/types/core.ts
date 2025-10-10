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
  | VNodeChild[]; // Support nested arrays (e.g., from slots)

/**
 * VNode type enum
 */
export enum VNodeType {
  Element = 'element',
  Fragment = 'fragment',
  FunctionComponent = 'function',
  ClassComponent = 'class',
}

/**
 * Base VNode properties (shared by all VNode types)
 */
interface VNodeBase {
  /** Props (including on: prefixed events) */
  props: Record<string, any> | null;

  /** Child VNodes */
  children: VNodeChild[];

  /**
   * Detached flag
   * When true, component won't be updated by parent
   */
  __detached__?: boolean;

  /**
   * Slot name for slot mechanism
   */
  __slot_name__?: string;
}

/**
 * Element VNode
 * - type: string (tag name like 'div', 'span')
 * - __dom__: Node (single DOM element)
 */
export interface ElementVNode extends VNodeBase {
  __type__: VNodeType.Element;
  type: string;
  __dom__?: Node | null;
}

/**
 * Fragment VNode
 * - type: Fragment symbol
 * - __dom__: Node[] (all child nodes)
 */
export interface FragmentVNode extends VNodeBase {
  __type__: VNodeType.Fragment;
  type: symbol;
  __dom__?: Node[] | null;
}

/**
 * Function Component VNode
 * - type: Function
 * - __rendered__: VNode (cached result of function call)
 * - __dom__: Node | Node[] (depends on rendered result)
 */
export interface FunctionComponentVNode extends VNodeBase {
  __type__: VNodeType.FunctionComponent;
  type: Function;
  __rendered__?: VNode;
  __dom__?: Node | Node[] | null;
}

/**
 * Class Component VNode
 * - type: Function (class constructor)
 * - __instance__: FukictInstance (component instance)
 * - __placeholder__: Comment node as placeholder for insertion position
 * - __dom__: ❌ NOT USED (managed by instance)
 */
export interface ClassComponentVNode extends VNodeBase {
  __type__: VNodeType.ClassComponent;
  type: Function;
  __instance__?: any; // FukictInstance
  __placeholder__?: Comment; // Comment node placeholder
  // Note: __dom__ is intentionally omitted for class components
}

/**
 * VNode - Discriminated Union
 *
 * Use __type__ to narrow down to specific VNode type:
 *
 * ```typescript
 * if (vnode.__type__ === VNodeType.Element) {
 *   // vnode is ElementVNode
 *   const element: Node = vnode.__dom__;
 * } else if (vnode.__type__ === VNodeType.Fragment) {
 *   // vnode is FragmentVNode
 *   const nodes: Node[] = vnode.__dom__;
 * } else if (vnode.__type__ === VNodeType.FunctionComponent) {
 *   // vnode is FunctionComponentVNode
 *   const rendered = vnode.__rendered__;
 * } else if (vnode.__type__ === VNodeType.ClassComponent) {
 *   // vnode is ClassComponentVNode
 *   const instance = vnode.__instance__;
 * }
 * ```
 */
export type VNode =
  | ElementVNode
  | FragmentVNode
  | FunctionComponentVNode
  | ClassComponentVNode;

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
