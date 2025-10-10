/**
 * @fukict/runtime - DOM Events
 *
 * Event listener management
 */

/**
 * Add event listener
 */
export function addEventListener(
  element: Element,
  type: string,
  handler: EventListener,
): void {
  element.addEventListener(type, handler);
}

/**
 * Remove event listener
 */
export function removeEventListener(
  element: Element,
  type: string,
  handler: EventListener,
): void {
  element.removeEventListener(type, handler);
}
