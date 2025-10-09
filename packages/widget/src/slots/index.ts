/**
 * @fukict/widget - Slots Utilities
 *
 * Extract and manage slots from children
 */
import type { VNodeChild } from '@fukict/runtime';

import type { SlotsMap } from '../types/index.js';
import { extractSlotName } from '../utils/index.js';

/**
 * Extract slots from children
 * Optimized to avoid unnecessary array allocations
 *
 * @param children - Children nodes
 * @returns Slots map
 */
export function extractSlots(children?: VNodeChild | VNodeChild[]): SlotsMap {
  const slots: SlotsMap = new Map();

  if (!children) {
    return slots;
  }

  // Normalize to array
  const childrenArray = Array.isArray(children) ? children : [children];

  const defaultSlot: VNodeChild[] = [];

  for (const child of childrenArray) {
    // Skip null/undefined
    if (child === null || child === undefined) {
      continue;
    }

    // Text nodes or non-VNode - add to default slot
    if (typeof child !== 'object' || !('type' in child)) {
      defaultSlot.push(child);
      continue;
    }

    // Check for fukict:slot attribute using utility
    const slotName = extractSlotName(child);

    if (slotName) {
      // Named slot - get or create array
      let existing = slots.get(slotName);
      if (!existing) {
        existing = [];
        slots.set(slotName, existing);
      }
      existing.push(child);
    } else {
      // Default slot
      defaultSlot.push(child);
    }
  }

  // Set default slot if not empty
  if (defaultSlot.length > 0) {
    slots.set('default', defaultSlot);
  }

  return slots;
}

/**
 * Get slot content
 *
 * @param slots - Slots map
 * @param name - Slot name
 * @returns Slot content (single item if only one, array if multiple, undefined if none)
 */
export function getSlot(
  slots: SlotsMap,
  name: string = 'default',
): VNodeChild | VNodeChild[] | undefined {
  const content = slots.get(name);

  if (!content || content.length === 0) {
    return undefined;
  }

  // Return single item if only one
  if (content.length === 1) {
    return content[0];
  }

  // Return array if multiple
  return content;
}
