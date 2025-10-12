/**
 * @fukict/runtime - Renderer: Attributes
 *
 * Set attributes on elements
 */
import * as dom from '../dom/index.js';

/**
 * Set attributes on element
 *
 * @param element - DOM element
 * @param props - Props object
 * @param componentInstance - Optional component instance for fukict:ref
 */
export function setAttributes(
  element: Element,
  props: Record<string, any>,
  componentInstance?: any,
): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') {
      continue;
    }

    // Handle fukict:ref (class component refs)
    if (
      key === 'fukict:ref' &&
      typeof value === 'string' &&
      componentInstance
    ) {
      // Register ref in component's refs Map
      if (!componentInstance.refs.has(value)) {
        componentInstance.refs.set(value, { current: null });
      }
      const ref = componentInstance.refs.get(value);
      if (ref) {
        ref.current = element;
      }
      continue;
    }

    // Handle ref callback
    if (key === 'ref' && typeof value === 'function') {
      value(element);
      continue;
    }

    // Handle events (on: prefix)
    if (key.startsWith('on:')) {
      const eventName = key.slice(3);
      dom.addEventListener(element, eventName, value);
      continue;
    }

    // Handle style object
    if (key === 'style' && typeof value === 'object') {
      for (const [styleKey, styleValue] of Object.entries(value)) {
        dom.setStyle(element as HTMLElement, styleKey, styleValue as any);
      }
      continue;
    }

    // Handle special properties
    if (key === 'value' || key === 'checked' || key === 'selected') {
      dom.setProperty(element, key, value);
      continue;
    }

    // Handle className -> class
    if (key === 'className') {
      dom.setAttribute(element, 'class', value);
      continue;
    }

    // Default: set as attribute
    dom.setAttribute(element, key, value);
  }
}
