import {
  createComponentInstance,
  getComponentReference,
  isComponentRegistered,
} from './component-registry.js';
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
  if (typeof vnode.type === 'function') {
    // 处理组件
    return createDOMFromComponent(vnode);
  }

  // 处理注册的组件类型
  if (vnode.type === '__registered_component__') {
    return createDOMFromRegisteredComponent(vnode);
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
  }

  // 渲染子节点 - 使用局部变量，不修改原始数据
  const children = Array.isArray(vnode.children) ? vnode.children : [];
  for (const child of children) {
    const childNode = createDOMFromChild(child);
    if (childNode) {
      appendChild(element, childNode);
    }
  }

  // 建立映射关系
  vNodeToDOMMap.set(vnode, element);
  domToVNodeMap.set(element, vnode);

  // 调用 ref 回调（如果存在）
  if (vnode.ref) {
    vnode.ref(element);
  }

  return element;
}

/**
 * 处理组件 VNode
 */
function createDOMFromComponent(vnode: VNode): Node {
  const component = vnode.type as ComponentFunction;

  // 检查是否为已注册的组件（仅检查，不创建实例）
  if (isComponentRegistered(component)) {
    // 如果是已注册的组件，转换为注册组件类型处理
    const registeredVNode: VNode = {
      type: '__registered_component__',
      props: {
        component,
        componentProps: vnode.props || {},
        onMount: vnode.props?.onMount || null,
      },
      events: null,
      children: [],
    };
    return createDOMFromRegisteredComponent(registeredVNode);
  }

  // 如果组件未注册，直接调用函数组件并处理返回的 VNode
  try {
    const props = vnode.props || {};
    const children = vnode.children || [];
    
    // 调用函数组件，传入 props 和 children
    const result = component({ ...props, children });
    
    // 如果函数返回 VNode，递归处理
    if (result && typeof result === 'object' && 'type' in result) {
      return createDOMFromTree(result);
    }
    
    // 如果返回字符串或数字，创建文本节点
    if (typeof result === 'string' || typeof result === 'number') {
      return createTextNode(String(result));
    }
    
    // 如果返回 null、undefined 或 false，创建空文本节点
    return createTextNode('');
    
  } catch (error) {
    // 如果函数调用出错，记录错误并返回错误信息
    console.error(`Error rendering component ${component.name || 'Anonymous'}:`, error);
    return createTextNode(`[Component Error: ${component.name || 'Anonymous'}]`);
  }
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
 * 处理注册组件 VNode
 */
function createDOMFromRegisteredComponent(vnode: VNode): Node {
  const props = vnode.props || {};
  const { component, componentProps, onMount } = props;
  const instance = createComponentInstance(component, componentProps);

  if (instance) {
    const container = createElement('div');
    instance.mount(container);

    // 获取实例引用并调用回调
    if (onMount) {
      const ref = getComponentReference(component, instance);
      onMount(ref);
    }

    // 返回实际的 DOM 元素
    const actualElement = instance.element || container.firstElementChild;
    if (actualElement) {
      // 建立映射关系
      vNodeToDOMMap.set(vnode, actualElement);
      domToVNodeMap.set(actualElement, vnode);
      return actualElement;
    }
  }

  // 如果组件创建失败，返回空的文本节点
  const emptyNode = createTextNode('');
  vNodeToDOMMap.set(vnode, emptyNode);
  domToVNodeMap.set(emptyNode, vnode);
  return emptyNode;
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
    // 对于原生元素，进行常规更新
    // 更新属性
    updateProperties(domNode as Element, oldVNode.props, newVNode.props);

    // 更新事件监听器
    updateEvents(domNode as Element, newVNode.events, oldVNode.events);

    // 更新子节点 - 使用安全的方式处理 children
    const oldChildren = Array.isArray(oldVNode.children)
      ? oldVNode.children
      : [];
    const newChildren = Array.isArray(newVNode.children)
      ? newVNode.children
      : [];
    updateChildren(domNode as Element, oldChildren, newChildren);

    // 更新 ref 回调
    if (oldVNode.ref !== newVNode.ref) {
      // 如果旧的 ref 存在，先调用 null
      if (oldVNode.ref) {
        oldVNode.ref(null);
      }
      // 如果新的 ref 存在，调用新的 ref
      if (newVNode.ref) {
        newVNode.ref(domNode as Element);
      }
    }

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
      removeProperty(element, key);
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
