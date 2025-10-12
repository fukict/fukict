/**
 * @fukict/basic - Renderer: Create Real Nodes
 *
 * Create real DOM nodes from VNode (supports Node | Node[] return)
 */
import { extractSlots } from '../component-class/slot.js';
import * as dom from '../dom/index.js';
import type { VNode, VNodeChild } from '../types/index.js';
import { VNodeType } from '../types/index.js';
import { setAttributes } from './attributes.js';

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
  componentInstance?: any,
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
  componentInstance?: any,
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
function renderElement(vnode: VNode, componentInstance?: any): Node {
  // TypeScript now knows vnode is ElementVNode
  if (vnode.__type__ !== VNodeType.Element) {
    throw new Error('Expected ElementVNode');
  }

  const { type, props, children } = vnode;
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

  // 保存单个节点到 __dom__
  vnode.__dom__ = element;

  return element;
}

/**
 * Render Fragment VNode
 * Returns array of DOM nodes
 */
function renderFragment(vnode: VNode, componentInstance?: any): Node[] {
  // TypeScript now knows vnode is FragmentVNode
  if (vnode.__type__ !== VNodeType.Fragment) {
    throw new Error('Expected FragmentVNode');
  }

  const { children } = vnode;
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

  // 保存所有节点到 __dom__
  vnode.__dom__ = nodes;

  return nodes;
}

/**
 * Render Function Component VNode
 * Returns Node | Node[] | null (depends on rendered result)
 */
function renderFunctionComponent(
  vnode: VNode,
  componentInstance?: any,
): Node | Node[] | null {
  // TypeScript now knows vnode is FunctionComponentVNode
  if (vnode.__type__ !== VNodeType.FunctionComponent) {
    throw new Error('Expected FunctionComponentVNode');
  }

  const { type, props, children } = vnode;

  // Merge children into props (like React)
  const propsWithChildren = {
    ...props,
    children: children.length === 1 ? children[0] : children,
  };

  // Call function component
  const rendered = type(propsWithChildren);

  if (!rendered) {
    vnode.__rendered__ = undefined;
    vnode.__dom__ = null;
    return null;
  }

  // Render result (pass component instance for nested fukict:ref)
  const domNode = createRealNode(rendered, componentInstance);

  // Save rendered VNode and DOM
  vnode.__rendered__ = rendered;
  vnode.__dom__ = domNode; // 可能是 Node 或 Node[]

  return domNode;
}

/**
 * Render Class Component VNode
 * Returns Comment node as placeholder
 */
function renderClassComponent(vnode: VNode, componentInstance?: any): Node {
  // TypeScript now knows vnode is ClassComponentVNode
  if (vnode.__type__ !== VNodeType.ClassComponent) {
    throw new Error('Expected ClassComponentVNode');
  }

  const { type, props, children } = vnode;

  // 1. Create instance (only props)
  const instance = new (type as any)(props);

  // 2. Extract and set slots from children
  if (children) {
    instance.slots = extractSlots(children);
  }

  // 3. Handle fukict:ref for class components
  //    If parent is a class component and this component has fukict:ref,
  //    register this instance to parent's refs
  if (componentInstance && props && props['fukict:ref']) {
    const refName = props['fukict:ref'];
    if (typeof refName === 'string') {
      // Create or update ref in parent component
      if (!componentInstance.refs.has(refName)) {
        componentInstance.refs.set(refName, { current: null });
      }
      const ref = componentInstance.refs.get(refName);
      if (ref) {
        ref.current = instance;
      }
    }
  }

  // 4. Save instance
  vnode.__instance__ = instance;

  // 5. Create comment placeholder with instance ID and name
  const placeholder = dom.createComment(
    `fukict:${instance.__name__}#${instance.__id__}`,
  );

  // 6. Save placeholder to vnode
  vnode.__placeholder__ = placeholder;

  return placeholder;
}
