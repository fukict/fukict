/**
 * @fukict/widget - Utility Functions
 *
 * Utility functions for widget package
 */
import type { VNode } from '@fukict/runtime';

import { FUKICT_ATTRS } from '../constants/index.js';

/**
 * Extract ref name from VNode props
 *
 * @param vnode - VNode to extract ref from
 * @returns Ref name or undefined
 */
export function extractRefName(vnode: VNode): string | undefined {
  const refName = vnode.props?.[FUKICT_ATTRS.REF];
  return typeof refName === 'string' ? refName : undefined;
}

/**
 * Extract slot name from VNode props
 *
 * @param vnode - VNode to extract slot from
 * @returns Slot name or undefined
 */
export function extractSlotName(vnode: VNode): string | undefined {
  const slotName = vnode.props?.[FUKICT_ATTRS.SLOT];
  return typeof slotName === 'string' ? slotName : undefined;
}

/**
 * Check if a VNode has detach attribute
 *
 * @param vnode - VNode to check
 * @returns True if has detach attribute
 */
export function hasDetachAttr(vnode: VNode): boolean {
  return !!vnode.props?.[FUKICT_ATTRS.DETACH];
}

/**
 * Check if a VNode is marked as detached (internal flag)
 *
 * @param vnode - VNode to check
 * @returns True if detached
 */
export function isDetached(vnode: VNode): boolean {
  return !!(vnode as any).__detached__;
}

/**
 * Mark a VNode as detached (internal flag)
 *
 * @param vnode - VNode to mark
 */
export function markDetached(vnode: VNode): void {
  (vnode as any).__detached__ = true;
}
