/**
 * @fukict/basic - Diff: Props
 *
 * Patch element properties
 */
import * as dom from '../../dom/index.js';
import { isSVGTag } from '../../dom/index.js';
import type { ClassValue } from '../../types/dom-attributes.js';

/**
 * Prop value types
 */
type PropValue = unknown;

/**
 * Patch element props
 */
export function patchProps(
  element: Element,
  oldProps: Record<string, PropValue> | null,
  newProps: Record<string, PropValue> | null,
): void {
  const old = oldProps || {};
  const newP = newProps || {};

  // Remove old props not in new
  for (const key of Object.keys(old)) {
    if (!(key in newP)) {
      removeProp(element, key, old[key]);
    }
  }

  // Set new props
  for (const key of Object.keys(newP)) {
    const oldValue = old[key];
    const newValue = newP[key];

    if (oldValue !== newValue) {
      setProp(element, key, newValue, oldValue);
    }
  }
}

/**
 * Set single prop
 */
export function setProp(
  element: Element,
  key: string,
  value: PropValue,
  oldValue?: PropValue,
): void {
  // Handle ref callback
  if (key === 'ref' && typeof value === 'function') {
    (value as (el: Element) => void)(element);
    return;
  }

  // Handle fukict:html (innerHTML setter)
  if (key === 'fukict:html') {
    dom.setProperty(element, 'innerHTML', value ?? '');
    return;
  }

  // Handle events (on: prefix)
  if (key.startsWith('on:')) {
    const eventName = key.slice(3);
    // Remove old listener if exists
    if (oldValue && typeof oldValue === 'function') {
      dom.removeEventListener(element, eventName, oldValue as EventListener);
    }
    // Add new listener
    if (value && typeof value === 'function') {
      dom.addEventListener(element, eventName, value as EventListener);
    }
    return;
  }

  // Handle style object
  if (key === 'style' && typeof value === 'object' && value !== null) {
    const oldStyle = (
      typeof oldValue === 'object' && oldValue !== null ? oldValue : {}
    ) as Record<string, string>;
    const newStyle = value as Record<string, string>;

    // Remove old styles not in new
    for (const styleKey of Object.keys(oldStyle)) {
      if (!(styleKey in newStyle)) {
        dom.setStyle(element as HTMLElement, styleKey, '');
      }
    }

    // Set new styles
    for (const [styleKey, styleValue] of Object.entries(newStyle)) {
      dom.setStyle(element as HTMLElement, styleKey, styleValue);
    }
    return;
  }

  // Handle special properties
  if (key === 'value' || key === 'checked' || key === 'selected') {
    dom.setProperty(element, key, value);
    return;
  }

  // Handle class with enhanced support
  if (key === 'class') {
    dom.setClass(element, value as ClassValue);
    return;
  }

  // Check if property exists on element (for Web Components)
  // SVG elements must use setAttribute
  if (key in element && !isSVGTag(element.tagName.toLowerCase())) {
    dom.setProperty(element, key, value);
    return;
  }

  // Default: set as attribute
  dom.setAttribute(element, key, value);
}

/**
 * Remove single prop
 */
export function removeProp(
  element: Element,
  key: string,
  oldValue: PropValue,
): void {
  // Handle fukict:html (innerHTML cleanup)
  if (key === 'fukict:html') {
    dom.setProperty(element, 'innerHTML', '');
    return;
  }

  // Handle events (on: prefix)
  if (key.startsWith('on:')) {
    const eventName = key.slice(3);
    if (typeof oldValue === 'function') {
      dom.removeEventListener(element, eventName, oldValue as EventListener);
    }
    return;
  }

  // Handle special properties
  if (key === 'value' || key === 'checked' || key === 'selected') {
    dom.setProperty(element, key, '');
    return;
  }

  // Check if property exists on element (for Web Components)
  // SVG elements must use removeAttribute
  if (key in element && !isSVGTag(element.tagName.toLowerCase())) {
    dom.setProperty(element, key, undefined);
    return;
  }

  // Default: remove attribute
  dom.removeAttribute(element, key);
}
