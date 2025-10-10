/**
 * @fukict/basic - Diff: Props
 *
 * Patch element properties
 */
import * as dom from '../../dom/index.js';

/**
 * Patch element props
 */
export function patchProps(
  element: Element,
  oldProps: Record<string, any> | null,
  newProps: Record<string, any> | null,
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
  value: any,
  oldValue?: any,
): void {
  // Handle ref callback
  if (key === 'ref' && typeof value === 'function') {
    value(element);
    return;
  }

  // Handle events (on: prefix)
  if (key.startsWith('on:')) {
    const eventName = key.slice(3);
    // Remove old listener if exists
    if (oldValue && typeof oldValue === 'function') {
      dom.removeEventListener(element, eventName, oldValue);
    }
    // Add new listener
    if (value && typeof value === 'function') {
      dom.addEventListener(element, eventName, value);
    }
    return;
  }

  // Handle style object
  if (key === 'style' && typeof value === 'object') {
    const oldStyle = (typeof oldValue === 'object' ? oldValue : {}) as Record<
      string,
      string
    >;
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

  // Handle className -> class
  if (key === 'className') {
    dom.setAttribute(element, 'class', value);
    return;
  }

  // Default: set as attribute
  dom.setAttribute(element, key, value);
}

/**
 * Remove single prop
 */
export function removeProp(element: Element, key: string, oldValue: any): void {
  // Handle events (on: prefix)
  if (key.startsWith('on:')) {
    const eventName = key.slice(3);
    if (typeof oldValue === 'function') {
      dom.removeEventListener(element, eventName, oldValue);
    }
    return;
  }

  // Handle special properties
  if (key === 'value' || key === 'checked' || key === 'selected') {
    dom.setProperty(element, key, '');
    return;
  }

  // Handle className -> class
  if (key === 'className') {
    dom.removeAttribute(element, 'class');
    return;
  }

  // Default: remove attribute
  dom.removeAttribute(element, key);
}
