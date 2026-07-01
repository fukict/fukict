/**
 * @fukict/runtime - DOM Element Creation
 *
 * Create HTML and SVG elements
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * SVG tag names that require createElementNS
 */
const SVG_TAGS = new Set([
  'svg',
  'animate',
  'animateMotion',
  'animateTransform',
  'circle',
  'clipPath',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'foreignObject',
  'g',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'set',
  'stop',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tspan',
  'use',
  'view',
]);

/**
 * Check if a tag is an SVG element
 */
export function isSVGTag(tag: string): boolean {
  return SVG_TAGS.has(tag);
}

/**
 * Check if a DOM element lives in the SVG namespace.
 *
 * Used for attribute/property decisions: SVG elements expose many geometry
 * attributes (x1, cx, cy, r, d, ...) as read-only IDL properties, so they must
 * be set via setAttribute. Namespace detection is tag-list-independent and
 * case-safe, unlike matching on tagName (whose camelCase form, e.g.
 * "linearGradient", is broken by toLowerCase()).
 */
export function isSVGElement(element: Element): boolean {
  return element.namespaceURI === SVG_NAMESPACE;
}

/**
 * Create an element (HTML or SVG)
 */
export function createElement(tag: string): Element {
  if (isSVGTag(tag)) {
    return document.createElementNS(SVG_NAMESPACE, tag);
  }
  return document.createElement(tag);
}

/**
 * Create a text node
 */
export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

/**
 * Create a comment node
 */
export function createComment(data: string): Comment {
  return document.createComment(data);
}
