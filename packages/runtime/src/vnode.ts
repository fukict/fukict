/**
 * @fukict/runtime - VNode Creation (hyperscript)
 *
 * Create VNode from function calls
 */
import type { VNode, VNodeChild } from './types/index.js';
import { Fragment } from './types/index.js';

/**
 * Create a VNode
 *
 * @param type - Element tag name or component function
 * @param props - Properties (including on: prefixed events)
 * @param children - Child nodes
 * @returns VNode
 */
export function hyperscript(
  type: string | Function | typeof Fragment,
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode {
  return {
    type,
    props,
    children: flattenChildren(children),
  };
}

/**
 * Flatten nested children arrays
 *
 * @param children - Raw children (may contain nested arrays)
 * @returns Flattened array
 */
function flattenChildren(children: VNodeChild[]): VNodeChild[] {
  const result: VNodeChild[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      // Recursively flatten arrays
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }

  return result;
}

/**
 * Alias for hyperscript (shorter name)
 */
export const h = hyperscript;

/**
 * JSX automatic runtime (for jsx-runtime transform)
 * This is a simplified version - actual implementation may differ
 */
export function jsx(
  type: string | Function | typeof Fragment,
  props: Record<string, any>,
): VNode {
  const { children, ...restProps } = props;
  return hyperscript(
    type,
    restProps,
    ...(Array.isArray(children)
      ? children
      : children != null
        ? [children]
        : []),
  );
}

// For JSX automatic runtime
export const jsxs = jsx;
export const jsxDEV = jsx;
