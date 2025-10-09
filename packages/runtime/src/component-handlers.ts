/**
 * @fukict/runtime - Component Handlers Registry
 *
 * Component handler registration mechanism
 * Allows external packages (like Widget) to register custom component renderers
 */
import type { ComponentHandler, UnregisterFn } from './types/index.js';

/**
 * Registered component handlers (sorted by priority)
 */
const handlers: ComponentHandler[] = [];

/**
 * Register a component handler
 *
 * @param handler - Component handler
 * @returns Unregister function
 */
export function registerComponentHandler(
  handler: ComponentHandler,
): UnregisterFn {
  // Set default priority
  if (handler.priority === undefined) {
    handler.priority = 100;
  }

  // Insert handler in priority order (lower priority value = higher precedence)
  const index = handlers.findIndex(
    h => (h.priority ?? 100) > handler.priority!,
  );
  if (index === -1) {
    handlers.push(handler);
  } else {
    handlers.splice(index, 0, handler);
  }

  // Return unregister function
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  };
}

/**
 * Find matching handler for a component
 *
 * @param component - Component function
 * @returns Matched handler or null
 */
export function findComponentHandler(
  component: Function,
): ComponentHandler | null {
  // Always traverse handlers array (no caching)
  for (const handler of handlers) {
    if (handler.detect(component)) {
      return handler;
    }
  }

  return null;
}

/**
 * Process attribute through all handlers
 * Attributes are global and should be checked by all handlers
 *
 * @param element - DOM element
 * @param key - Attribute key
 * @param value - Attribute value
 * @returns true if handled by any handler
 */
export function processAttribute(
  element: Element,
  key: string,
  value: any,
): boolean {
  // Note: Attributes are global, not tied to specific components
  // So we check all handlers
  for (const handler of handlers) {
    if (handler.processAttribute) {
      if (handler.processAttribute(element, key, value)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get all registered handlers (for debugging)
 */
export function getHandlers(): ComponentHandler[] {
  return [...handlers];
}

