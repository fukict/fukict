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
 * @param componentInstance - Optional component instance for fukict:ref
 */
export function setAttributes(
  element: Element,
  props: Record<string, unknown>,
  componentInstance?: Fukict,
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
