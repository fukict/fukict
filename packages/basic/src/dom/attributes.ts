/**
 * @fukict/runtime - DOM Attributes
 *
 * Attribute and property manipulation
 */
import { ClassValue } from '../types/dom-attributes';

/**
 * Convert ClassValue to class string
 *
 * @param value - Class value in various formats
 * @returns Normalized class string
 */
function normalizeClassValue(value: ClassValue): string {
  // Handle string
  if (typeof value === 'string') {
    return value;
  }

  // Handle array
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'string') {
          return item;
        }
        // Handle object in array
        return normalizeClassValue(item);
      })
      .filter(Boolean)
      .join(' ');
  }

  // Handle object (boolean mode)
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .filter(([_, enabled]) => enabled)
      .map(([className]) => className)
      .join(' ');
  }

  return '';
}

/**
 * Set class attribute on element with enhanced support
 *
 * Supports multiple formats:
 * - string: 'foo bar'
 * - array: ['foo', 'bar'] => 'foo bar'
 * - object: { foo: true, bar: false } => 'foo'
 * - mixed: ['foo', { bar: true, baz: false }] => 'foo bar'
 *
 * @param element - DOM element
 * @param value - Class value in various formats
 */
export function setClass(element: Element, value: ClassValue): void {
  const classString = normalizeClassValue(value);
  if (classString) {
    element.setAttribute('class', classString);
  } else {
    element.removeAttribute('class');
  }
}

/**
 * Set attribute on element
 */
export function setAttribute(
  element: Element,
  key: string,
  value: unknown,
): void {
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
export function setProperty(
  element: Element,
  key: string,
  value: unknown,
): void {
  (element as unknown as Record<string, unknown>)[key] = value;
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
    (element.style as unknown as Record<string, string>)[key] = value + 'px';
  } else {
    (element.style as unknown as Record<string, string | number>)[key] = value;
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
