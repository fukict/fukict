/**
 * @fukict/runtime - VNode Creation (hyperscript)
 *
 * Create VNode from function calls
 */
import { Fukict } from './component-class/fukict.js';
import type { PrimitiveVNode, PrimitiveValue, VNode } from './types/index.js';
import { Fragment, VNodeType } from './types/index.js';

/**
 * Create a PrimitiveVNode from a primitive value
 */
function createPrimitiveVNode(value: PrimitiveValue): PrimitiveVNode {
  return {
    __type__: VNodeType.Primitive,
    type: 'primitive',
    value,
    props: null,
    children: [],
  };
}

/**
 * Normalize a single child to VNode
 * Converts primitive values to PrimitiveVNode
 */
function normalizeChild(child: any): VNode | null {
  // Already a VNode
  if (child && typeof child === 'object' && '__type__' in child) {
    return child as VNode;
  }

  // Primitive values -> PrimitiveVNode
  if (
    typeof child === 'string' ||
    typeof child === 'number' ||
    typeof child === 'boolean' ||
    child === null ||
    child === undefined
  ) {
    return createPrimitiveVNode(child);
  }

  // Arrays should be flattened before this point
  if (Array.isArray(child)) {
    console.warn('Nested array in normalizeChild, should be flattened first');
    return null;
  }

  return null;
}

/**
 * Flatten and normalize children array
 * Converts all children to VNode instances
 */
function normalizeChildren(children: any[]): VNode[] {
  const result: VNode[] = [];

  for (const child of children) {
    // Flatten nested arrays (from slots, map, etc.)
    if (Array.isArray(child)) {
      result.push(...normalizeChildren(child));
    } else {
      const normalized = normalizeChild(child);
      if (normalized !== null) {
        result.push(normalized);
      }
    }
  }

  return result;
}

/**
 * Detect VNode type at runtime (fallback if babel-plugin is not used)
 */
function detectVNodeType(type: string | Function | typeof Fragment): VNodeType {
  // Fragment
  if (type === Fragment) {
    return VNodeType.Fragment;
  }

  // Element (string tag name)
  if (typeof type === 'string') {
    return VNodeType.Element;
  }

  // Function
  if (typeof type === 'function') {
    // Class Component (extends Fukict)
    if (type.prototype && type.prototype instanceof Fukict) {
      return VNodeType.ClassComponent;
    }

    // Function Component
    return VNodeType.FunctionComponent;
  }

  // Fallback to element
  return VNodeType.Element;
}

/**
 * Create a VNode
 *
 * Runtime hyperscript function creates a plain VNode structure.
 * The __type__ field should be added by babel-plugin at compile time.
 * If not present, we detect it at runtime (slower but works).
 *
 * Children are normalized: all primitive values are wrapped in PrimitiveVNode.
 *
 * @param type - Element tag name or component function
 * @param props - Properties (including on: prefixed events)
 * @param children - Child nodes (accepts any type, will be normalized)
 * @returns VNode (plain structure, __type__ expected from babel-plugin)
 */
export function hyperscript(
  type: string | Function | typeof Fragment,
  props: Record<string, any> | null,
  children: any[],
): VNode {
  // Normalize children to VNode[]
  const normalizedChildren = normalizeChildren(children);

  const vnode = {
    type,
    props: props || {},
    children: normalizedChildren,
  } as VNode;

  // If __type__ not set by babel-plugin, detect it at runtime
  if (!('__type__' in vnode)) {
    (vnode as VNode).__type__ = detectVNodeType(type);
  }

  return vnode;
}

/**
 * Alias for hyperscript (shorter name)
 */
export const h = hyperscript;

/**
 * JSX automatic runtime exports
 * These are standard exports for JSX automatic runtime
 * All point to hyperscript since our babel plugin directly generates hyperscript calls
 */
export const jsx = hyperscript;
export const jsxs = hyperscript;
export const jsxDEV = hyperscript;
