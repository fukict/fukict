/**
 * @fukict/runtime - DOM Attributes Types
 *
 * Runtime-specific attribute extensions for HTML elements
 * Extends built-in DOM types with ref, event handlers, and custom attributes
 */
import type { RefCallback } from './core.js';
import type { EventHandlers } from './events.js';

/**
 * Style object type - mapped from CSSStyleDeclaration
 * Allows both CSSStyleDeclaration properties and number values
 */
export type CSSProperties = {
  [K in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[K] | number;
};

/**
 * Fukict slot attribute (for slot content marking)
 * Used in DOM elements and component children
 */
export interface FukictSlotAttribute {
  'fukict:slot'?: string;
}

/**
 * Fukict ref attribute (for component instance reference)
 * Used in class components and DOM elements
 */
export interface FukictRefAttribute {
  'fukict:ref'?: string;
}

/**
 * Fukict detach attribute (for detached rendering mode)
 * Used in class components only
 */
export interface FukictDetachAttribute {
  'fukict:detach'?: boolean;
}

/**
 * Runtime-specific attribute extensions
 * This type is merged with native HTML element attributes
 */
export interface RuntimeAttributes<T extends Element = Element>
  extends EventHandlers,
    FukictSlotAttribute {
  // Runtime ref (DOM element reference callback)
  ref?: RefCallback<T>;

  // Custom style handling (object or string)
  style?: CSSProperties | string;

  // Allow className as alias for class
  className?: string;

  // Data attributes
  [key: `data-${string}`]: any;

  // Allow other custom attributes
  [key: string]: any;
}

/**
 * HTML element attributes
 * Merges runtime attributes with native element properties
 *
 * Usage:
 * - HTMLAttributes<HTMLInputElement> - for input elements
 * - HTMLAttributes<HTMLImageElement> - for img elements
 * - HTMLAttributes<HTMLElement> - for generic elements
 */
export type HTMLAttributes<T extends HTMLElement = HTMLElement> =
  RuntimeAttributes<T> & Partial<Omit<T, keyof Element>>;

/**
 * SVG element attributes (SVGElement is not HTMLElement)
 *
 * Usage:
 * - SVGAttributes<SVGSVGElement> - for svg elements
 * - SVGAttributes<SVGPathElement> - for path elements
 */
export type SVGAttributes<T extends SVGElement = SVGElement> =
  RuntimeAttributes<T> & Partial<Omit<T, keyof Element>>;
