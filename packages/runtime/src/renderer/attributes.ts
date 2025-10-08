/**
 * @fukict/runtime - Renderer: Attributes
 *
 * Set attributes on elements
 */
import { processAttribute } from '../component-handlers.js';
import * as dom from '../dom/index.js';

/**
 * Set attributes on element
 *
 * @param element - DOM element
 * @param props - Props object
 */
export function setAttributes(
  element: Element,
  props: Record<string, any>,
): void {
  for (const [key, value] of Object.entries(props)) {
    // Let extension handlers process first
    if (processAttribute(element, key, value)) {
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
