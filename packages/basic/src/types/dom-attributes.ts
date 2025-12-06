/**
 * @fukict/runtime - DOM Attributes Types
 *
 * Runtime-specific attribute extensions for HTML elements
 * Extends built-in DOM types with ref, event handlers, and custom attributes
 */
import type { RefCallback, VNodeChild } from './core.js';
import type { EventHandlers } from './events.js';

/**
 * Style object type - mapped from CSSStyleDeclaration
 * Allows both CSSStyleDeclaration properties and number values
 */
export type CSSProperties = {
  [K in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[K] | number;
};

/**
 * Class value types
 * - string: 'foo bar'
 * - array: ['foo', 'bar']
 * - object: { foo: true, bar: false } (boolean mode)
 * - mixed: ['foo', { bar: true, baz: false }]
 */
export type ClassValue =
  | string
  | string[]
  | Record<string, boolean | undefined>
  | (string | Record<string, boolean | undefined>)[];

/**
 * Fukict slot attribute (for slot content marking)
 * Used in DOM elements and component children
 */
export interface FukictSlotAttribute {
  'fukict:slot'?: string;
}

/**
 * Fukict html attribute (for setting innerHTML)
 * Used in DOM elements as alternative to children
 */
export interface FukictHtmlAttribute {
  'fukict:html'?: string;
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
    FukictSlotAttribute,
    FukictHtmlAttribute {
  // Runtime ref (DOM element reference callback)
  ref?: RefCallback<T>;

  // Custom style handling (object or string)
  style?: CSSProperties | string;

  // Class with enhanced support (string, array, object, mixed)
  class?: ClassValue;

  // Explicitly forbid className (use class instead)
  className?: never;

  // Children support (JSX children)
  children?: VNodeChild | VNodeChild[];

  // Data attributes - allow any data-* attribute
  [key: `data-${string}`]: any;
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
  RuntimeAttributes<T> &
    Omit<
      Partial<T>,
      | keyof Element
      | keyof Node
      | keyof EventTarget
      | keyof GlobalEventHandlers
      | 'style'
      | 'children'
      | 'innerHTML'
      | 'innerText'
      | 'textContent'
      | 'addEventListener'
      | 'removeEventListener'
      | 'dispatchEvent'
    > & {
      // Re-add commonly used Element properties that should be allowed
      id?: string;
      className?: never; // Explicitly forbid (use class instead)
      classList?: never; // Explicitly forbid (use class instead)
      // ARIA and role attributes
      role?: string;
      'aria-label'?: string;
      'aria-labelledby'?: string;
      'aria-describedby'?: string;
      'aria-expanded'?: boolean | 'true' | 'false';
      'aria-hidden'?: boolean | 'true' | 'false';
      'aria-disabled'?: boolean | 'true' | 'false';
      'aria-controls'?: string;
      'aria-live'?: 'off' | 'polite' | 'assertive';
      'aria-required'?: boolean | 'true' | 'false';
      'aria-invalid'?: boolean | 'true' | 'false';
      'aria-current'?:
        | boolean
        | 'page'
        | 'step'
        | 'location'
        | 'date'
        | 'time'
        | 'true'
        | 'false';
      'aria-selected'?: boolean | 'true' | 'false';
      'aria-checked'?: boolean | 'true' | 'false' | 'mixed';
      'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
      'aria-valuenow'?: number;
      'aria-valuemin'?: number;
      'aria-valuemax'?: number;
      'aria-valuetext'?: string;
      'aria-orientation'?: 'horizontal' | 'vertical';
      'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
      'aria-atomic'?: boolean | 'true' | 'false';
      'aria-busy'?: boolean | 'true' | 'false';
      'aria-relevant'?:
        | 'additions'
        | 'removals'
        | 'text'
        | 'all'
        | 'additions text';
      'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
      'aria-multiline'?: boolean | 'true' | 'false';
      'aria-multiselectable'?: boolean | 'true' | 'false';
      'aria-readonly'?: boolean | 'true' | 'false';
      'aria-placeholder'?: string;
      'aria-haspopup'?:
        | boolean
        | 'true'
        | 'false'
        | 'menu'
        | 'listbox'
        | 'tree'
        | 'grid'
        | 'dialog';
      'aria-posinset'?: number;
      'aria-setsize'?: number;
      'aria-level'?: number;
      'aria-owns'?: string;
      'aria-activedescendant'?: string;
      'aria-colcount'?: number;
      'aria-colindex'?: number;
      'aria-colspan'?: number;
      'aria-rowcount'?: number;
      'aria-rowindex'?: number;
      'aria-rowspan'?: number;
      // Override style to support both string and object
      style?: CSSProperties | string;
      // Key attribute for list reconciliation
      key?: string | number;
    };

/**
 * SVG-specific presentation attributes
 * These attributes control the visual appearance of SVG elements
 */
export interface SVGPresentationAttributes {
  // Color and painting
  fill?: string;
  fillOpacity?: number | string;
  fillRule?: 'nonzero' | 'evenodd' | 'inherit';
  stroke?: string;
  strokeWidth?: number | string;
  strokeOpacity?: number | string;
  strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
  strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit';
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
  strokeMiterlimit?: number | string;

  // Opacity
  opacity?: number | string;

  // Transform
  transform?: string;
  transformOrigin?: string;

  // Text
  fontSize?: number | string;
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: string;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
  dominantBaseline?: string;

  // Clipping and masking
  clipPath?: string;
  clipRule?: 'nonzero' | 'evenodd' | 'inherit';
  mask?: string;

  // Filter effects
  filter?: string;

  // Color
  color?: string;
  colorInterpolation?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
  colorRendering?: 'auto' | 'optimizeSpeed' | 'optimizeQuality' | 'inherit';

  // Display
  visibility?: 'visible' | 'hidden' | 'collapse' | 'inherit';
  display?: string;

  // Markers
  markerStart?: string;
  markerMid?: string;
  markerEnd?: string;

  // Other
  vectorEffect?: string;
  paintOrder?: string;
  shapeRendering?:
    | 'auto'
    | 'optimizeSpeed'
    | 'crispEdges'
    | 'geometricPrecision'
    | 'inherit';
}

/**
 * SVG element attributes (SVGElement is not HTMLElement)
 *
 * Usage:
 * - SVGAttributes<SVGSVGElement> - for svg elements
 * - SVGAttributes<SVGPathElement> - for path elements
 */
export type SVGAttributes<T extends SVGElement = SVGElement> =
  RuntimeAttributes<T> &
    SVGPresentationAttributes & {
      id?: string;
      // Override style to support both string and object
      style?: CSSProperties | string;

      // SVG-specific attributes that are not in the DOM interface
      // These use camelCase naming convention for JSX
      viewBox?: string;
      xmlns?: string;
      xmlnsXlink?: string;
      xmlSpace?: 'default' | 'preserve';
      x?: number | string;
      y?: number | string;
      width?: number | string;
      height?: number | string;
      cx?: number | string;
      cy?: number | string;
      r?: number | string;
      rx?: number | string;
      ry?: number | string;
      x1?: number | string;
      y1?: number | string;
      x2?: number | string;
      y2?: number | string;
      d?: string;
      points?: string;
      offset?: number | string;
      stopColor?: string;
      stopOpacity?: number | string;
      gradientUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
      gradientTransform?: string;
      patternUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
      patternContentUnits?: 'userSpaceOnUse' | 'objectBoundingBox';
      patternTransform?: string;
      preserveAspectRatio?: string;
      href?: string;
      xlinkHref?: string;
      markerWidth?: number | string;
      markerHeight?: number | string;
      orient?: string | number;
      refX?: number | string;
      refY?: number | string;
      in?: string;
      in2?: string;
      result?: string;
      stdDeviation?: number | string;
      type?: string;
      values?: string;
      tableValues?: string;
      slope?: number | string;
      intercept?: number | string;
      amplitude?: number | string;
      exponent?: number | string;
      k1?: number | string;
      k2?: number | string;
      k3?: number | string;
      k4?: number | string;
      operator?: string;
      mode?: string;
      attributeName?: string;
      attributeType?: string;
      from?: number | string;
      to?: number | string;
      dur?: number | string;
      repeatCount?: number | string | 'indefinite';
      begin?: string;
      end?: string;
      calcMode?: 'discrete' | 'linear' | 'paced' | 'spline';
      keyTimes?: string;
      keySplines?: string;
      keyPoints?: string;
      path?: string;
      rotate?: number | string | 'auto' | 'auto-reverse';
      scale?: number | string;
      additive?: 'replace' | 'sum';
      accumulate?: 'none' | 'sum';
      restart?: 'always' | 'whenNotActive' | 'never';
    };
