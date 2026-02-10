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

  let countA = 0;
  for (const key in a) {
    if (a[key] !== b[key]) return false;
    countA++;
  }
  let countB = 0;
  for (const _ in b) countB++;
  return countA === countB;
}
