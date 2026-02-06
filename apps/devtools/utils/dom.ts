/**
 * Get element's bounding rect relative to viewport
 */
export function getElementRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * Scroll element into view smoothly
 */
export function scrollToElement(element: Element): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
  });
}

/**
 * Get element's computed styles
 */
export function getElementStyles(element: Element): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}
