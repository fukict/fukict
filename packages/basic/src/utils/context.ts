/**
 * @fukict/basic - Context Utilities
 *
 * Utility functions for Context system
 */
import type { FukictComponent } from '../types/class.js';
import type { ContextData } from '../types/context.js';
import type { ClassComponentVNode, VNode } from '../types/core.js';

/**
 * Internal component instance with parent reference
 */
interface ComponentInstanceInternal extends FukictComponent {
  _parent?: ComponentInstanceInternal | null;
}

/**
 * Create immutable proxy for context values
 *
 * Prevents child components from mutating context values,
 * ensuring unidirectional data flow.
 *
 * **Important**: Proxy only prevents mutation, it does NOT trigger updates.
 * Context updates must be explicit:
 * 1. Call provideContext() to replace the context value
 * 2. Call this.update() to trigger re-rendering
 * 3. Child components get new value via getContext() during render
 *
 * @param value - Context value to wrap
 * @returns Proxied immutable value
 * @internal
 */
export function createImmutableProxy<T>(value: T): T {
  // Primitive values don't need proxy
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return new Proxy(value as object, {
    set() {
      console.warn(
        '[Fukict] Context values are immutable and cannot be modified',
      );
      return false; // Block modification, but does NOT trigger update
    },
    deleteProperty() {
      console.warn(
        '[Fukict] Context values are immutable and cannot be modified',
      );
      return false;
    },
    get(target, prop) {
      const result = Reflect.get(target, prop) as unknown;
      // Deep proxy for nested objects
      if (typeof result === 'object' && result !== null) {
        return createImmutableProxy(result);
      }
      return result;
    },
  }) as T;
}

/**
 * Get parent context from VNode
 *
 * Traverses up the parent instance chain to find nearest parent component with context.
 *
 * @param vnode - Current VNode (used to get instance, then traverse via _parent)
 * @returns Parent context data or undefined
 * @internal
 */
export function getParentContext(vnode: VNode): ContextData | undefined {
  // Get instance from ClassComponentVNode
  const vnodeWithInstance = vnode as ClassComponentVNode;
  const instance = vnodeWithInstance.__instance__ as
    | ComponentInstanceInternal
    | undefined;
  if (!instance) {
    return undefined;
  }

  // Traverse via _parent (direct parent instance reference)
  const parentInstance = instance._parent;
  if (parentInstance && parentInstance._render) {
    return parentInstance._render.__context__;
  }

  return undefined;
}
