/**
 * @fukict/widget - Constants
 *
 * Widget-specific attribute names and constants
 */

/**
 * Widget attribute prefix
 */
export const FUKICT_ATTR_PREFIX = 'fukict:';

/**
 * Widget-specific attribute names
 */
export const FUKICT_ATTRS = {
  /** Reference attribute for accessing component instances */
  REF: 'fukict:ref',

  /** Detach attribute for skipping diff/patch */
  DETACH: 'fukict:detach',

  /** Slot attribute for named slots */
  SLOT: 'fukict:slot',
} as const;

/**
 * Check if an attribute key is a fukict attribute
 */
export function isFukictAttr(key: string): boolean {
  return key.startsWith(FUKICT_ATTR_PREFIX);
}
