/**
 * @fukict/widget - Type Definitions
 */
import type { VNode, VNodeChild } from '@fukict/runtime';

/**
 * Widget props base type
 */
export interface WidgetProps {
  children?: VNodeChild | VNodeChild[];
  [key: string]: any;
}

/**
 * Slots map type
 * Always stores arrays internally for consistency
 */
export type SlotsMap = Map<string, VNodeChild[]>;

/**
 * Refs map type
 * - Class components: Widget instance
 * - Detached nodes: DetachedRef
 * - Regular nodes: Element
 */
export type RefsMap = Map<string, any>;

/**
 * DetachedRef interface for detached nodes
 */
export interface DetachedRef<T extends Element = Element> {
  element: T;
  update: (newVNode: VNode) => void;
}

/**
 * Widget lifecycle hooks
 */
export interface WidgetLifecycle {
  /**
   * Called after the component is mounted to the DOM
   * DOM is already inserted, can access DOM properties
   */
  onMounted?(): void;

  /**
   * Called before the component is unmounted from the DOM
   */
  onBeforeUnmount?(): void;
}

/**
 * VNode with internal metadata
 */
export interface WidgetVNode extends VNode {
  __instance__?: any;
  __instanceKey__?: string;
  __component__?: Function;
  __detached__?: boolean;
}
