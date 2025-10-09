/**
 * @fukict/runtime - Extension System Types
 *
 * Types for the runtime extension mechanism
 */
import type { VNode, VNodeChild } from './core.js';

/**
 * Component Handler - centralized extension mechanism
 *
 * Runtime only handles:
 * - Component detection (detect)
 * - Component rendering (render)
 * - Attribute processing (processAttribute)
 *
 * Lifecycle management (onMount, onUnmount) should be handled by Widget layer.
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

  /** Process attribute setting (return true if handled) */
  processAttribute?(element: Element, key: string, value: any): boolean;
}
