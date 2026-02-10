/**
 * @fukict/basic - Diff: Reconciler
 *
 * Core diff algorithm with recursive operations.
 * All functions that need to call diff() are in this file to avoid circular dependencies.
 */
import type { FunctionComponent } from '../../component-function/index.js';
import type {
  ElementVNode,
  FragmentVNode,
  FunctionComponentVNode,
  VNode,
  VNodeChild,
} from '../../types/index.js';
import { VNodeType } from '../../types/index.js';
import { createRealNode } from '../create.js';
import { activate } from '../mount.js';
import {
  setupElementVNode,
  setupFragmentVNode,
  setupFunctionComponentVNode,
} from '../vnode-helpers.js';
import { diffClassComponent } from './class.js';
import { removeNode, replaceNode } from './dom-ops.js';
import { diffPrimitive } from './primitive.js';
import { patchProps } from './props.js';
import { shallowEqual } from './utils.js';

// ============================================
// Children Diff
// ============================================

/**
 * Diff children arrays
 *
 * Performance optimized: All children are VNodes (primitives wrapped in PrimitiveVNode by h()).
 * No need for primitive type checking - directly diff VNodes using cached __node__ references.
 */
export function diffChildren(
  oldChildren: VNodeChild[],
  newChildren: VNodeChild[],
  container: Element,
): void {
  const oldLen = oldChildren.length;
  const newLen = newChildren.length;
  const commonLen = Math.min(oldLen, newLen);

  // Diff common children - all are VNodes with __node__ cache
  for (let i = 0; i < commonLen; i++) {
    diff(oldChildren[i], newChildren[i], container);
  }

  // Remove extra old children
  if (oldLen > newLen) {
    for (let i = commonLen; i < oldLen; i++) {
      removeNode(oldChildren[i], container);
    }
  }

  // Append new children
  if (newLen > oldLen) {
    for (let i = commonLen; i < newLen; i++) {
      const node = createRealNode(newChildren[i]);
      if (node) {
        if (Array.isArray(node)) {
          node.forEach(n => container.appendChild(n));
        } else {
          container.appendChild(node);
        }
        activate({ vnode: newChildren[i], container });
      }
    }
  }
}

// ============================================
// Element Diff
// ============================================

/**
 * Diff Element VNode
 * - Reuse DOM node
 * - Patch props
 * - Recursively diff children
 */
function diffElement(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  const oldElementVNode = oldVNode as ElementVNode;
  const newElementVNode = newVNode as ElementVNode;

  // Tag name changed - replace entire element
  if (oldElementVNode.type !== newElementVNode.type) {
    replaceNode(oldElementVNode, newElementVNode, container);
    return;
  }

  // Reuse DOM element
  const element = oldElementVNode.__node__ as Element;
  if (!element) {
    // DOM doesn't exist, replace node
    replaceNode(oldElementVNode, newElementVNode, container);
    return;
  }

  // Setup ElementVNode: save DOM reference
  setupElementVNode(newElementVNode, element);

  // Patch props
  patchProps(element, oldElementVNode.props, newElementVNode.props);

  // Diff children
  diffChildren(oldElementVNode.children, newElementVNode.children, element);
}

// ============================================
// Fragment Diff
// ============================================

/**
 * Diff Fragment VNode
 * - Diff children array
 * - Update __node__ array
 */
function diffFragment(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  const newFragmentVNode = newVNode as FragmentVNode;

  // Diff children
  diffChildren(oldVNode.children, newFragmentVNode.children, container);

  // Update __node__ reference (collect all current child nodes)
  const newNodes: Node[] = [];
  for (const child of newFragmentVNode.children) {
    if (child && typeof child === 'object' && '__node__' in child) {
      const dom = child.__node__;
      if (dom) {
        if (Array.isArray(dom)) {
          newNodes.push(...dom);
        } else {
          newNodes.push(dom);
        }
      }
    }
  }

  // Setup FragmentVNode: save DOM nodes array reference
  setupFragmentVNode(newFragmentVNode, newNodes);
}

// ============================================
// Function Component Diff
// ============================================

/**
 * Diff Function Component VNode
 * - Shallow compare props
 * - Re-call function if props changed
 * - Recursively diff __render__
 */
function diffFunctionComponent(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
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
    // Setup FunctionComponentVNode with reused data
    setupFunctionComponentVNode(
      newFuncVNode,
      oldFuncVNode.__render__,
      oldFuncVNode.__node__ ?? null,
    );
    return;
  }

  // Props changed - re-call function
  // Merge children into props
  const propsWithChildren: Record<string, unknown> = {
    ...newFuncVNode.props,
    children:
      newFuncVNode.children.length === 1
        ? newFuncVNode.children[0]
        : newFuncVNode.children,
  };

  // Call function component with typed signature
  const funcComponent = newFuncVNode.type as unknown as FunctionComponent;
  const rendered: VNodeChild = funcComponent(propsWithChildren);

  // Store rendered VNode (only if it's a VNode object)
  const renderedVNode =
    rendered && typeof rendered === 'object' && '__type__' in rendered
      ? (rendered as VNode)
      : undefined;

  // Diff old and new rendered result
  const oldRendered = oldFuncVNode.__render__;
  diff(oldRendered, rendered, container);

  // Update __node__ reference (only for non-ClassComponent VNodes)
  let domNode: Node | Node[] | null = null;
  if (
    renderedVNode &&
    renderedVNode.__type__ !== VNodeType.ClassComponent &&
    '__node__' in renderedVNode
  ) {
    domNode = renderedVNode.__node__ ?? null;
  }

  // Setup FunctionComponentVNode: save rendered VNode and DOM reference
  setupFunctionComponentVNode(newFuncVNode, renderedVNode, domNode);
}

// ============================================
// Main Diff Entry
// ============================================

/**
 * Diff and patch VNode tree
 *
 * @param oldVNode - Old VNode (can be array from slots)
 * @param newVNode - New VNode (can be array from slots)
 * @param container - Container element
 */
export function diff(
  oldVNode: VNodeChild,
  newVNode: VNodeChild,
  container: Element,
): void {
  // Handle array types (e.g., from slots)
  // If either is array, use diffChildren for array comparison
  if (Array.isArray(oldVNode) || Array.isArray(newVNode)) {
    const oldChildren = Array.isArray(oldVNode) ? oldVNode : [oldVNode];
    const newChildren = Array.isArray(newVNode) ? newVNode : [newVNode];
    diffChildren(oldChildren, newChildren, container);
    return;
  }

  // Both null/undefined - no changes
  if (!oldVNode && !newVNode) {
    return;
  }

  // Old exists, new is null - remove
  if (oldVNode && !newVNode) {
    removeNode(oldVNode, container);
    return;
  }

  // Old is null, new exists - create and mount
  if (!oldVNode && newVNode) {
    const node = createRealNode(newVNode);
    if (node) {
      if (Array.isArray(node)) {
        node.forEach(n => container.appendChild(n));
      } else {
        container.appendChild(node);
      }
      activate({ vnode: newVNode, container });
    }
    return;
  }

  // All children are VNodes (primitives wrapped in PrimitiveVNode by h())
  // Direct type assertion - no need for expensive typeof checks
  const oldVN = oldVNode as VNode;
  const newVN = newVNode as VNode;

  // Type mismatch - replace entire node
  if (oldVN.__type__ !== newVN.__type__) {
    replaceNode(oldVN, newVN, container);
    return;
  }

  // Same type - diff by type
  switch (newVN.__type__) {
    case VNodeType.Element:
      diffElement(oldVN, newVN, container);
      break;

    case VNodeType.Fragment:
      diffFragment(oldVN, newVN, container);
      break;

    case VNodeType.FunctionComponent:
      diffFunctionComponent(oldVN, newVN, container);
      break;

    case VNodeType.ClassComponent:
      diffClassComponent(oldVN, newVN, container);
      break;

    case VNodeType.Primitive:
      diffPrimitive(oldVN, newVN, container);
      break;
  }
}
