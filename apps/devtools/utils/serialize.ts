import { CONFIG } from '~/constants';
import type { ComponentId } from '~/types';

/**
 * Serialize data for transmission (handles circular references, limits depth)
 */
export function serialize(
  value: any,
  maxDepth: number = CONFIG.MAX_PROPS_DEPTH,
  currentDepth: number = 0,
  seen: WeakSet<object> = new WeakSet(),
): any {
  // Handle primitives
  if (value === null || value === undefined) {
    return value;
  }

  const type = typeof value;
  if (type === 'string') {
    return value.length > CONFIG.MAX_STRING_LENGTH
      ? value.slice(0, CONFIG.MAX_STRING_LENGTH) + '...'
      : value;
  }

  if (type === 'number' || type === 'boolean') {
    return value;
  }

  // Handle functions (including classes)
  if (type === 'function') {
    // Check if it's a class (has prototype with constructor)
    const isClass =
      value.prototype &&
      value.prototype.constructor === value &&
      Object.getOwnPropertyNames(value.prototype).length > 1;

    if (isClass) {
      return `[Class: ${value.name || 'anonymous'}]`;
    }
    return `[Function: ${value.name || 'anonymous'}]`;
  }

  // Handle symbols
  if (type === 'symbol') {
    return `[Symbol: ${value.description || ''}]`;
  }

  // Max depth reached
  if (currentDepth >= maxDepth) {
    return '[...]';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
    return value.map(item => serialize(item, maxDepth, currentDepth + 1, seen));
  }

  // Handle objects
  if (type === 'object') {
    // Circular reference
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);

    // Check for component instance (must be before other checks)
    if (isComponentInstance(value)) {
      return {
        __type: 'ComponentInstance',
        name: getComponentName(value),
        id: componentIdMap.has(value) ? componentIdMap.get(value) : null,
      };
    }

    // Check for DOM elements
    if (value instanceof Element) {
      return {
        __type: 'Element',
        tagName: value.tagName,
        id: value.id || null,
        className: value.className || null,
      };
    }

    // Special objects
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    if (value instanceof RegExp) {
      return { __type: 'RegExp', value: value.toString() };
    }
    if (value instanceof Map) {
      return {
        __type: 'Map',
        value: Array.from(value.entries()).map(([k, v]) => [
          serialize(k, maxDepth, currentDepth + 1, seen),
          serialize(v, maxDepth, currentDepth + 1, seen),
        ]),
      };
    }
    if (value instanceof Set) {
      return {
        __type: 'Set',
        value: Array.from(value).map(v =>
          serialize(v, maxDepth, currentDepth + 1, seen),
        ),
      };
    }

    // Plain objects
    const result: Record<string, any> = {};
    const keys = Object.keys(value);

    // Skip problematic keys that can't be cloned
    const skipKeys = new Set([
      'constructor',
      '__proto__',
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
    ]);

    // Limit number of keys
    const maxKeys = 50;
    const limitedKeys = keys
      .filter(key => !skipKeys.has(key))
      .slice(0, maxKeys);

    for (const key of limitedKeys) {
      try {
        result[key] = serialize(value[key], maxDepth, currentDepth + 1, seen);
      } catch {
        result[key] = '[Error serializing]';
      }
    }

    if (keys.length > maxKeys) {
      result.__truncated = `... ${keys.length - maxKeys} more keys`;
    }

    return result;
  }

  return String(value);
}

/**
 * Generate unique component ID
 */
let componentIdCounter = 0;
const componentIdMap = new WeakMap<any, ComponentId>();

export function getComponentId(instance: any): ComponentId {
  if (componentIdMap.has(instance)) {
    return componentIdMap.get(instance)!;
  }

  const id = `component-${++componentIdCounter}`;
  componentIdMap.set(instance, id);
  return id;
}

/**
 * Generate a deterministic ID for a function component based on tree position.
 * Format: fc:{parentId}:{fnName}:{index}
 */
export function getFunctionComponentId(
  parentId: string,
  fnName: string,
  index: number,
): ComponentId {
  return `fc:${parentId}:${fnName}:${index}`;
}

/**
 * Extract component name from instance
 */
export function getComponentName(instance: any): string {
  if (!instance) return 'Unknown';

  // Try constructor name
  if (instance.constructor && instance.constructor.name) {
    return instance.constructor.name;
  }

  // Try function name
  if (typeof instance === 'function' && instance.name) {
    return instance.name;
  }

  // Try displayName (common pattern)
  if (instance.displayName) {
    return instance.displayName;
  }

  return 'Anonymous';
}

/**
 * Check if value is a Fukict component instance
 */
export function isComponentInstance(value: any): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check for class component (has render method)
  if (typeof value.render === 'function') {
    return true;
  }

  // Check for function component marker
  if (value.__isFukictComponent === true) {
    return true;
  }

  return false;
}
