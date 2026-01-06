/**
 * @fukict/runtime - Renderer: Attributes
 *
 * Set attributes on elements
 */
import type { Fukict } from '../component-class/fukict.js';
import * as dom from '../dom/index.js';
import { isSVGTag } from '../dom/index.js';

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

    // Handle fukict:html (innerHTML setter)
    if (key === 'fukict:html') {
      dom.setProperty(element, 'innerHTML', value ?? '');
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

    // Check if property exists on element (for Web Components and special properties)
    // SVG elements must use setAttribute as their attributes are DOM attributes
    if (key in element && !isSVGTag(element.tagName.toLowerCase())) {
      dom.setProperty(element, key, value);
      continue;
    }

    // Default: set as attribute
    dom.setAttribute(element, key, value);
  }
}
