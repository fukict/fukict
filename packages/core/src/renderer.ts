import {
  appendChild,
  batchUpdate,
  clearChildren,
  createElement,
  createTextNode,
  removeNode,
  removeProperty,
  setEvents,
  setProperty,
  updateEvents,
  updateProperty,
} from './dom-utils.js';
import type {
  ComponentFunction,
  RenderOptions,
  VNode,
  VNodeChild,
} from './types.js';

/**
 * 核心渲染引擎
 * 负责将 VNode 树转换为真实 DOM
 */

// 存储 VNode 与 DOM 节点的映射关系
const vNodeToDOMMap = new WeakMap<VNode, Node>();
const domToVNodeMap = new WeakMap<Node, VNode>();

/**
 * 将 VNode 转换为 DOM 元素
 */
export function createDOMFromTree(vnode: VNode): Node {
  // 确保 children 总是数组
  if (!Array.isArray(vnode.children)) {
    vnode.children = [];
  }

  if (typeof vnode.type === 'function') {
    // 处理组件
    return createDOMFromComponent(vnode);
  }

  // 处理原生元素
  const element = createElement(vnode.type as string);

  // 设置属性
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      setProperty(element, key, value);
    }
  }

  // 设置事件监听器（编译时分离）
  if (vnode.events) {
    setEvents(element, vnode.events);
  } else {
  }

  // 渲染子节点
  for (const child of vnode.children) {
    const childNode = createDOMFromChild(child);
    if (childNode) {
      appendChild(element, childNode);
    }
  }

  // 建立映射关系
  vNodeToDOMMap.set(vnode, element);
  domToVNodeMap.set(element, vnode);

  return element;
}

/**
 * 处理组件 VNode
 */
function createDOMFromComponent(vnode: VNode): Node {
  const component = vnode.type as ComponentFunction;
  const childVNode = component(vnode.props || {});

  // 确保组件返回的 VNode 有正确的 children 结构
  if (!Array.isArray(childVNode.children)) {
    childVNode.children = [];
  }

  const domNode = createDOMFromTree(childVNode);

  // 组件的映射关系
  vNodeToDOMMap.set(vnode, domNode);
  domToVNodeMap.set(domNode, vnode);

  return domNode;
}

/**
 * 处理子节点
 */
function createDOMFromChild(child: VNodeChild): Node | null {
  if (child == null || typeof child === 'boolean') {
    return null;
  }

  if (typeof child === 'string' || typeof child === 'number') {
    return createTextNode(String(child));
  }

  return createDOMFromTree(child);
}

/**
 * 渲染 VNode 到容器
 */
export function render(vnode: VNode, options: RenderOptions): void {
  batchUpdate(() => {
    const { container, replace = false } = options;

    if (replace) {
      clearChildren(container);
    }

    const domNode = createDOMFromTree(vnode);
    appendChild(container, domNode);
  });
}

/**
 * 更新 DOM - 基于新旧 VNode 树的差异
 */
export function updateDOM(
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
): void {
  batchUpdate(() => {
    // 类型改变，完全替换
    if (oldVNode.type !== newVNode.type) {
      const newDomNode = createDOMFromTree(newVNode);
      const parent = domNode.parentNode;
      if (parent) {
        parent.replaceChild(newDomNode, domNode);
      }
      return;
    }

    // 更新属性
    updateProperties(domNode as Element, oldVNode.props, newVNode.props);

    // 更新事件监听器
    updateEvents(domNode as Element, newVNode.events, oldVNode.events);

    // 更新子节点
    updateChildren(domNode as Element, oldVNode.children, newVNode.children);

    // 更新映射关系
    domToVNodeMap.set(domNode, newVNode);
    vNodeToDOMMap.set(newVNode, domNode);
  });
}

/**
 * 更新元素属性
 */
function updateProperties(
  element: Element,
  oldProps: Record<string, any> | null,
  newProps: Record<string, any> | null,
): void {
  const oldP = oldProps || {};
  const newP = newProps || {};

  // 移除旧属性
  for (const key in oldP) {
    if (!(key in newP)) {
      removeProperty(element, key, oldP[key]);
    }
  }

  // 设置新属性
  for (const key in newP) {
    updateProperty(element, key, newP[key], oldP[key]);
  }
}

/**
 * 更新子节点（简单实现，后续可优化为 key-based diffing）
 */
function updateChildren(
  parent: Element,
  oldChildren: VNodeChild[],
  newChildren: VNodeChild[],
): void {
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    const childNode = parent.childNodes[i];

    if (!newChild) {
      // 移除多余的旧子节点
      if (childNode) {
        removeNode(childNode);
      }
    } else if (!oldChild) {
      // 添加新的子节点
      const newChildNode = createDOMFromChild(newChild);
      if (newChildNode) {
        appendChild(parent, newChildNode);
      }
    } else if (typeof oldChild !== typeof newChild) {
      // 类型不同，替换
      const newChildNode = createDOMFromChild(newChild);
      if (newChildNode && childNode) {
        parent.replaceChild(newChildNode, childNode);
      }
    } else if (typeof oldChild === 'object' && typeof newChild === 'object') {
      // 都是 VNode，递归更新
      updateDOM(oldChild, newChild, childNode);
    } else if (oldChild !== newChild) {
      // 文本节点内容不同
      if (childNode) {
        childNode.textContent = String(newChild);
      }
    }
  }
}

/**
 * 水合现有 DOM（用于 SSR 场景，当前简单实现）
 */
export function hydrate(vnode: VNode, existingDOM: Element): void {
  // 简单实现：建立映射关系
  vNodeToDOMMap.set(vnode, existingDOM);
  domToVNodeMap.set(existingDOM, vnode);

  // TODO: 实现完整的水合逻辑
}
