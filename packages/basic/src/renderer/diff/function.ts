/**
 * @fukict/basic - Diff: Function Component
 *
 * Diff function component VNodes
 */
import type { FunctionComponent } from '../../component-function';
import type {
  FunctionComponentVNode,
  VNode,
  VNodeChild,
} from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { replaceNode, shallowEqual } from './helpers.js';
import { diff } from './index.js';

/**
 * Diff Function Component VNode
 * - Shallow compare props
 * - Re-call function if props changed
 * - Recursively diff __rendered__
 */
export function diffFunctionComponent(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.FunctionComponent ||
    newVNode.__type__ !== VNodeType.FunctionComponent
  ) {
    throw new Error('Expected FunctionComponentVNode');
  }

  // Type assertion after runtime check
  const oldFuncVNode = oldVNode as FunctionComponentVNode;
  const newFuncVNode = newVNode as FunctionComponentVNode;

  // Function changed - replace
  if (oldFuncVNode.type !== newFuncVNode.type) {
    replaceNode(oldFuncVNode, newFuncVNode, container);
    return;
  }

  // Shallow compare props
  if (shallowEqual(oldFuncVNode.props, newFuncVNode.props)) {
    // Props unchanged - reuse rendered result
    newFuncVNode.__rendered__ = oldFuncVNode.__rendered__;
    newFuncVNode.__dom__ = oldFuncVNode.__dom__;
    return;
  }

  // Props changed - re-call function
  // Merge children into props (like React)
  const propsWithChildren: Record<string, unknown> = {
    ...(newFuncVNode.props ?? {}),
    children:
      newFuncVNode.children.length === 1
        ? newFuncVNode.children[0]
        : newFuncVNode.children,
  };

  // Call function component with typed signature
  const funcComponent = newFuncVNode.type as unknown as FunctionComponent;
  const rendered: VNodeChild = funcComponent(propsWithChildren);

  // Store rendered VNode (only if it's a VNode object)
  if (rendered && typeof rendered === 'object' && '__type__' in rendered) {
    newFuncVNode.__rendered__ = rendered as VNode;
  }

  // Diff old and new rendered result
  const oldRendered = oldFuncVNode.__rendered__;
  diff(oldRendered, rendered, container);

  // Update __dom__ reference (only for non-ClassComponent VNodes)
  if (rendered && typeof rendered === 'object' && '__type__' in rendered) {
    const renderedVNode = rendered as VNode;
    // ClassComponentVNode doesn't have __dom__, skip for that type
    if (
      renderedVNode.__type__ !== VNodeType.ClassComponent &&
      '__dom__' in renderedVNode
    ) {
      newFuncVNode.__dom__ = renderedVNode.__dom__;
    }
  }
}
