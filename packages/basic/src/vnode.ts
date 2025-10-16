/**
 * @fukict/runtime - VNode Creation (hyperscript)
 *
 * Create VNode from function calls
 */
import { Fukict } from './component-class/fukict.js';
import type { VNode, VNodeChild } from './types/index.js';
import { Fragment, VNodeType } from './types/index.js';

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
 * @param type - Element tag name or component function
 * @param props - Properties (including on: prefixed events)
 * @param children - Child nodes
 * @returns VNode (plain structure, __type__ expected from babel-plugin)
 */
export function hyperscript(
  type: string | Function | typeof Fragment,
  props: Record<string, any> | null,
  children: VNodeChild[],
): VNode {
  const vnode = {
    type,
    props: props || {},
    children,
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
