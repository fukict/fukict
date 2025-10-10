/**
 * @fukict/runtime - DOM Attributes
 *
 * Attribute and property manipulation
 */

/**
 * Set attribute on element
 */
export function setAttribute(element: Element, key: string, value: any): void {
  if (value == null || value === false) {
    element.removeAttribute(key);
  } else if (value === true) {
    element.setAttribute(key, '');
  } else {
    element.setAttribute(key, String(value));
  }
}

/**
 * Remove attribute from element
 */
export function removeAttribute(element: Element, key: string): void {
  element.removeAttribute(key);
}

/**
 * Set property on element (for special properties like value, checked)
 */
export function setProperty(element: Element, key: string, value: any): void {
  (element as any)[key] = value;
}

/**
 * Set style property
 */
export function setStyle(
  element: HTMLElement,
  key: string,
  value: string | number,
): void {
  if (typeof value === 'number' && !isUnitlessNumber(key)) {
    (element.style as any)[key] = value + 'px';
  } else {
    (element.style as any)[key] = value;
  }
}

/**
 * Check if CSS property should be unitless
 */
function isUnitlessNumber(key: string): boolean {
  const unitlessNumbers = new Set([
    'animationIterationCount',
    'columnCount',
    'fillOpacity',
    'flexGrow',
    'flexShrink',
    'fontWeight',
    'lineHeight',
    'opacity',
    'order',
    'orphans',
    'widows',
    'zIndex',
    'zoom',
  ]);
  return unitlessNumbers.has(key);
}
