/**
 * @fukict/basic - Diff: Utils
 *
 * Pure utility functions with no external dependencies
 */

/**
 * Shallow compare two objects
 */
export function shallowEqual(
  a: Record<string, unknown> | null,
  b: Record<string, unknown> | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
