import type { Slots } from '../types/class';
import type { VNodeChild } from '../types/core';

/**
 * Compose slots by adding a slot to the slots object
 *
 * @param slots - Slots object to modify
 * @param key - Slot name
 * @param slot - Slot content to add
 */
function composeSlots(slots: Slots, key: string, slot: VNodeChild) {
  if (!slots) return;

  if (!slots[key]) {
    slots[key] = slot;
  } else if (Array.isArray(slots[key])) {
    slots[key].push(slot);
  } else {
    slots[key] = [slots[key], slot];
  }
}

/** Extract slots from children
 *
 * @param children - Child nodes
 * @returns Slots object or undefined
 */
export function extractSlots(children?: VNodeChild[]): Slots {
  if (!children) return {};

  const slots: Slots = {};

  for (const child of children) {
    // Skip null/undefined
    if (typeof child === 'undefined' || child === null) continue;

    // Text nodes or non-VNode - add to default slot
    if (
      typeof child !== 'object' ||
      !('type' in child) ||
      !child.__slot_name__
    ) {
      composeSlots(slots, 'default', child);
      continue;
    }

    // With slot's name, it's a named slot
    composeSlots(slots, child.__slot_name__, child);
  }

  return slots;
}
