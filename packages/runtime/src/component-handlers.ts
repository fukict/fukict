/**
 * @fukict/runtime - Component Handlers Registry
 *
 * Component handler registration mechanism
 * Allows external packages (like Widget) to register custom component renderers
 */
import type { ComponentHandler, UnregisterFn, VNode } from './types/index.js';

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
  for (const handler of handlers) {
    if (handler.detect(component)) {
      return handler;
    }
  }
  return null;
}

/**
 * Process VNode through all handlers
 *
 * @param vnode - VNode to process
 * @returns Processed VNode
 */
export function processVNode(vnode: VNode): VNode {
  let result = vnode;

  for (const handler of handlers) {
    if (handler.processVNode) {
      result = handler.processVNode(result);
    }
  }

  return result;
}

/**
 * Call onMount for all handlers
 *
 * @param element - DOM element
 * @param vnode - Associated VNode
 */
export function callOnMount(element: Element, vnode: VNode): void {
  for (const handler of handlers) {
    if (handler.onMount) {
      handler.onMount(element, vnode);
    }
  }
}

/**
 * Process attribute through handlers
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
 * Call onUnmount for all handlers
 *
 * @param element - DOM element
 * @param vnode - Associated VNode
 */
export function callOnUnmount(element: Element, vnode: VNode): void {
  for (const handler of handlers) {
    if (handler.onUnmount) {
      handler.onUnmount(element, vnode);
    }
  }
}

/**
 * Get all registered handlers (for debugging)
 */
export function getHandlers(): ComponentHandler[] {
  return [...handlers];
}
