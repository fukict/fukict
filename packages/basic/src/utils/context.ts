/**
 * @fukict/basic - Context Utilities
 *
 * Utility functions for Context system
 */
import type { ContextData } from '../types/context.js';
import type { VNode } from '../types/core.js';

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

  return new Proxy(value as any, {
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
      const result = Reflect.get(target, prop);
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
 * Traverses up the wrapper VNode tree to find nearest parent component with context.
 * The wrapper VNode is the ClassComponentVNode that wraps a component instance.
 *
 * @param vnode - Current VNode (unused, we traverse via __wrapper__ on instance)
 * @returns Parent context data or undefined
 * @internal
 */
export function getParentContext(vnode: VNode): ContextData | undefined {
  // Get instance from ClassComponentVNode
  const instance = (vnode as any).__instance__;
  if (!instance) {
    return undefined;
  }

  // Get wrapper VNode (the ClassComponentVNode that wraps this instance)
  const wrapper = instance.__wrapper__;
  if (!wrapper || !wrapper.props) {
    return undefined;
  }

  // Look for parent context by traversing up the VNode tree
  // We need to find the parent component that rendered this wrapper VNode
  // This requires walking through the children arrays to find parent relationship

  // For now, implement a simpler approach:
  // Look for context in parent by checking if wrapper has __parentInstance__
  // This will be set during rendering

  // Alternative: Search through all active component instances
  // But this violates the "no global state" principle

  // The correct approach: During render, when parent creates child VNode,
  // we should store parent instance reference on the child's wrapper VNode
  // Let's add __parentInstance__ field during createRealNode

  const parentInstance = (wrapper as any).__parentInstance__;
  if (parentInstance && parentInstance.__vnode__) {
    return parentInstance.__vnode__.__context__;
  }

  return undefined;
}
