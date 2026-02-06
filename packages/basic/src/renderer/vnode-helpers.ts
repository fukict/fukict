/**
 * @fukict/basic - VNode Shared Utilities
 *
 * Shared logic for setting up VNode references across create and diff operations
 */
import type {
  ElementVNode,
  FragmentVNode,
  FunctionComponentVNode,
  PrimitiveVNode,
  VNode,
} from '../types/index.js';

/**
 * Setup ElementVNode with DOM reference
 *
 * Used by both renderElement (create) and diffElement (update).
 *
 * @param vnode - The ElementVNode to setup
 * @param element - The DOM element
 */
export function setupElementVNode(vnode: ElementVNode, element: Element): void {
  vnode.__node__ = element;
}

/**
 * Setup FragmentVNode with DOM nodes array reference
 *
 * Used by both renderFragment (create) and diffFragment (update).
 *
 * @param vnode - The FragmentVNode to setup
 * @param nodes - The array of DOM nodes
 */
export function setupFragmentVNode(vnode: FragmentVNode, nodes: Node[]): void {
  vnode.__node__ = nodes;
}

/**
 * Setup FunctionComponentVNode with rendered VNode and DOM reference
 *
 * Used by both renderFunctionComponent (create) and diffFunctionComponent (update).
 *
 * @param vnode - The FunctionComponentVNode to setup
 * @param rendered - The rendered VNode result (can be undefined)
 * @param domNode - The DOM node or nodes (can be null or Node or Node[])
 */
export function setupFunctionComponentVNode(
  vnode: FunctionComponentVNode,
  rendered: VNode | undefined,
  domNode: Node | Node[] | null,
): void {
  vnode.__render__ = rendered;
  vnode.__node__ = domNode;
}

/**
 * Setup PrimitiveVNode with DOM reference
 *
 * Used by both renderPrimitive (create) and diffPrimitive (update).
 *
 * @param vnode - The PrimitiveVNode to setup
 * @param node - The Text or Comment node
 */
export function setupPrimitiveVNode(
  vnode: PrimitiveVNode,
  node: Text | Comment,
): void {
  vnode.__node__ = node;
}
