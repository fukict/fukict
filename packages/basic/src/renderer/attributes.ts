/**
 * @fukict/runtime - Renderer: Attributes
 *
 * Set attributes on elements
 */
import type { Fukict } from '../component-class/fukict.js';
import * as dom from '../dom/index.js';

/**
 * Set attributes on element
 *
 * @param element - DOM element
 * @param props - Props object
 * @param _componentInstance - (Unused) Component instance, kept for compatibility
 */
export function setAttributes(
  element: Element,
  props: Record<string, unknown>,
  _componentInstance?: Fukict,
): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') {
      continue;
    }

    // Skip fukict:ref (handled in class-helpers.ts)
    if (key === 'fukict:ref') {
      continue;
    }

    // TODO: dom 应该统一处理流程

    // Handle ref callback
    if (key === 'ref' && typeof value === 'function') {
      (value as (element: Element) => void)(element);
      continue;
    }

    // Handle events (on: prefix)
    if (key.startsWith('on:')) {
      const eventName = key.slice(3);
      dom.addEventListener(element, eventName, value as EventListener);
      continue;
    }

    // Handle style object
    if (key === 'style' && typeof value === 'object' && value !== null) {
      for (const [styleKey, styleValue] of Object.entries(value)) {
        dom.setStyle(
          element as HTMLElement,
          styleKey,
          styleValue as string | number,
        );
      }
      continue;
    }

    // Handle special properties
    if (key === 'value' || key === 'checked' || key === 'selected') {
      dom.setProperty(element, key, value);
      continue;
    }

    // Handle class with enhanced support
    if (key === 'class') {
      dom.setClass(
        element,
        value as string | string[] | Record<string, boolean>,
      );
      continue;
    }

    // Default: set as attribute
    dom.setAttribute(element, key, value);
  }
}
