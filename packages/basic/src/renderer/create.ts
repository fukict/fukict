/**
 * @fukict/basic - Renderer: Create Real Nodes
 *
 * Create real DOM nodes from VNode (supports Node | Node[] return)
 */
import { Fukict } from '../component-class/fukict.js';
import type { FunctionComponent } from '../component-function/index.js';
import * as dom from '../dom/index.js';
import type {
  ClassComponentVNode,
  ElementVNode,
  FragmentVNode,
  FunctionComponentVNode,
  VNode,
  VNodeChild,
} from '../types/index.js';
import { VNodeType } from '../types/index.js';
import { setAttributes } from './attributes.js';
import { setupClassComponentVNode } from './class-helpers.js';
import {
  setupElementVNode,
  setupFragmentVNode,
  setupFunctionComponentVNode,
} from './vnode-helpers.js';

/**
 * Create real DOM node(s) from VNode
 *
 * @param vnode - VNode or primitive (can be array from slots)
 * @param componentInstance - Optional component instance for fukict:ref
 * @returns Node | Node[] | null
 *   - Element: returns Node
 *   - Fragment: returns Node[]
 *   - Function Component: returns Node | Node[] (depends on rendered result)
 *   - Class Component: returns Comment placeholder
 *   - Primitives: returns Text Node
 *   - Array: returns Node[] (flattened)
 */
export function createRealNode(
  vnode: VNodeChild,
  componentInstance?: Fukict,
): Node | Node[] | null {
  // Handle arrays (e.g., from slots)
  // Recursively flatten and render each item
  if (Array.isArray(vnode)) {
    const nodes: Node[] = [];
    for (const item of vnode) {
      const node = createRealNode(item, componentInstance);
      if (node) {
        if (Array.isArray(node)) {
          nodes.push(...node);
        } else {
          nodes.push(node);
        }
      }
    }
    return nodes.length === 0 ? null : nodes;
  }

  // Filter out invalid values
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') {
    return null;
  }

  // Primitive values become text nodes
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return dom.createTextNode(String(vnode));
  }

  // VNode object - use discriminated union
  if (typeof vnode === 'object' && '__type__' in vnode) {
    return createElementFromVNode(vnode as VNode, componentInstance);
  }

  return null;
}

/**
 * Create element from VNode object
 *
 * @param vnode - VNode
 * @param componentInstance - Optional component instance for fukict:ref
 * @returns Node | Node[] | null
 */
export function createElementFromVNode(
  vnode: VNode,
  componentInstance?: Fukict,
): Node | Node[] | null {
  // Use discriminated union for type-safe rendering
  switch (vnode.__type__) {
    case VNodeType.Element:
      return renderElement(vnode, componentInstance);

    case VNodeType.Fragment:
      return renderFragment(vnode, componentInstance);

    case VNodeType.FunctionComponent:
      return renderFunctionComponent(vnode, componentInstance);

    case VNodeType.ClassComponent:
      return renderClassComponent(vnode, componentInstance);

    default:
      return null;
  }
}

/**
 * Render Element VNode
 * Returns single DOM node
 */
function renderElement(vnode: VNode, componentInstance?: Fukict): Node {
  // TypeScript now knows vnode is ElementVNode
  if (vnode.__type__ !== VNodeType.Element) {
    throw new Error('Expected ElementVNode');
  }

  const elementVNode = vnode as ElementVNode;
  const { type, props, children } = elementVNode;
  const element = dom.createElement(type);

  // Set attributes and events
  if (props) {
    setAttributes(element, props, componentInstance);
  }

  // Render children (pass component instance for nested fukict:ref)
  if (Array.isArray(children)) {
    for (const child of children) {
      const node = createRealNode(child, componentInstance);

      if (!node) continue;

      // node 可能是单个或数组
      if (Array.isArray(node)) {
        node.forEach(n => element.appendChild(n));
      } else {
        element.appendChild(node);
      }
    }
  } else {
    console.warn('Element vnode children is not an array:', vnode);
  }

  // Setup ElementVNode: save DOM reference
  setupElementVNode(elementVNode, element);

  return element;
}

/**
 * Render Fragment VNode
 * Returns array of DOM nodes
 */
function renderFragment(vnode: VNode, componentInstance?: Fukict): Node[] {
  // TypeScript now knows vnode is FragmentVNode
  if (vnode.__type__ !== VNodeType.Fragment) {
    throw new Error('Expected FragmentVNode');
  }

  const fragmentVNode = vnode as FragmentVNode;
  const { children } = fragmentVNode;
  const nodes: Node[] = [];

  if (Array.isArray(children)) {
    for (const child of children) {
      const node = createRealNode(child, componentInstance);

      if (!node) continue;

      // node 可能是单个 Node 或 Node[]（嵌套 Fragment）
      if (Array.isArray(node)) {
        nodes.push(...node);
      } else {
        nodes.push(node);
      }
    }
  } else {
    console.warn('Element vnode children is not an array:', vnode);
  }

  // Setup FragmentVNode: save DOM nodes array reference
  setupFragmentVNode(fragmentVNode, nodes);

  return nodes;
}

/**
 * Render Function Component VNode
 * Returns Node | Node[] | null (depends on rendered result)
 */
function renderFunctionComponent(
  vnode: VNode,
  componentInstance?: Fukict,
): Node | Node[] | null {
  // TypeScript now knows vnode is FunctionComponentVNode
  if (vnode.__type__ !== VNodeType.FunctionComponent) {
    throw new Error('Expected FunctionComponentVNode');
  }

  // Type assertion after runtime check
  const funcVNode = vnode as FunctionComponentVNode;
  const { type, props, children } = funcVNode;

  // Merge children into props (like React)
  const propsWithChildren = {
    ...props,
    children: children.length === 1 ? children[0] : children,
  };

  // Call function component with proper typing
  const funcComponent = type as unknown as FunctionComponent;
  const rendered = funcComponent(propsWithChildren);

  if (!rendered) {
    // Setup FunctionComponentVNode with empty result
    setupFunctionComponentVNode(funcVNode, undefined, null);
    return null;
  }

  // Render result (pass component instance for nested fukict:ref)
  const domNode = createRealNode(rendered, componentInstance);

  // Setup FunctionComponentVNode: save rendered VNode and DOM reference
  setupFunctionComponentVNode(funcVNode, rendered, domNode);

  return domNode;
}

/**
 * Render Class Component VNode
 * Returns Comment node as placeholder
 */
function renderClassComponent(vnode: VNode, componentInstance?: Fukict): Node {
  // TypeScript now knows vnode is ClassComponentVNode
  if (vnode.__type__ !== VNodeType.ClassComponent) {
    throw new Error('Expected ClassComponentVNode');
  }

  // Type assertion after runtime check
  const classVNode = vnode as ClassComponentVNode;
  const { type, props } = classVNode;

  // 1. Create instance (only props)
  // Type assertion is safe here because we know it's a class constructor
  const ComponentClass = type as new (props: Record<string, any>) => Fukict;
  const instance = new ComponentClass(props ?? {});

  // 2. Setup ClassComponentVNode: instance, slots, refs, wrapper, parent reference
  setupClassComponentVNode(classVNode, instance, componentInstance);

  // 3. Create comment placeholder with instance ID and name
  const placeholder = dom.createComment(
    `fukict:${instance.__name__}#${instance.__id__}`,
  );

  // 4. Save placeholder to vnode
  classVNode.__placeholder__ = placeholder;

  return placeholder;
}
