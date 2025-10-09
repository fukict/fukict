/**
 * @fukict/widget - Diff Props
 */
import { isFukictAttr } from '../constants/index.js';

/**
 * Patch element props
 * Optimized to skip unchanged props
 */
export function patchProps(
  element: Element,
  oldProps: Record<string, any>,
  newProps: Record<string, any>,
): void {
  // Collect all prop keys (union of old and new)
  const allKeys = new Set<string>();
  for (const key in oldProps) {
    if (!isFukictAttr(key)) {
      allKeys.add(key);
    }
  }
  for (const key in newProps) {
    if (!isFukictAttr(key)) {
      allKeys.add(key);
    }
  }

  // Process each prop once
  for (const key of allKeys) {
    const oldValue = oldProps[key];
    const newValue = newProps[key];

    // Skip if unchanged
    if (oldValue === newValue) {
      continue;
    }

    // Remove if deleted
    if (newValue === undefined) {
      element.removeAttribute(key);
      continue;
    }

    // Set new value
    if (newValue != null) {
      element.setAttribute(key, String(newValue));
    }
  }
}
