/**
 * @fukict/runtime - Extension System Types
 *
 * Types for the runtime extension mechanism
 */
import type { VNode, VNodeChild } from './core';

/**
 * Component Handler - centralized extension mechanism
 */
export interface ComponentHandler {
  /** Handler name for debugging */
  name: string;

  /** Priority (lower = higher priority, default: 100) */
  priority?: number;

  /** Detect if a function is this type of component */
  detect(fn: Function): boolean;

  /** Render component to VNode (can return null) */
  render(
    component: Function,
    props: Record<string, any>,
    children: VNodeChild[],
  ): VNode | null;

  /** Process VNode after creation (optional) */
  processVNode?(vnode: VNode): VNode;

  /** Called when DOM element is mounted (optional) */
  onMount?(element: Element, vnode: VNode): void;

  /** Process attribute setting (return true if handled) */
  processAttribute?(element: Element, key: string, value: any): boolean;

  /** Called when DOM element is unmounted (optional) */
  onUnmount?(element: Element, vnode: VNode): void;
}
