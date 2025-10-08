/**
 * Widget 层 DOM 差异更新器
 *
 * 负责基于新旧 VNode 树执行最小化 DOM 更新
 * 从 runtime 层迁移并增强，支持子组件实例管理
 *
 * @fileoverview VNode 差异比较和 DOM 增量更新算法
 * @module @fukict/widget/differ
 */

import type { VNode, VNodeChild } from '@fukict/runtime';
import {
  removeProperty,
  updateProperty,
  createElement,
  createTextNode,
  appendChild,
  removeNode,
} from '@fukict/runtime';

/**
 * 高效的 DOM 差异更新算法
 *
 * 基于新旧 VNode 树的比较，执行最小化的 DOM 操作
 *
 * @param oldVNode - 旧的 VNode 树
 * @param newVNode - 新的 VNode 树
 * @param domNode - 对应的 DOM 节点
 *
 * @algorithm
 * 1. 类型检查：类型不同则完全替换
 * 2. 属性差异更新：只更新变化的属性
 * 3. 事件监听器差异更新：智能事件管理
 * 4. 子节点递归比较：最小化子树更新
 * 5. ref 回调管理：正确处理 ref 生命周期
 *
 * @performance
 * - 避免不必要的 DOM 操作
 * - 智能的属性和事件差异算法
 * - 高效的子节点更新策略
 */
export function patchDOM(
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
): void {
  if (!oldVNode || !newVNode || !domNode) {
    throw new Error(
      '[@fukict/widget] Invalid arguments: oldVNode, newVNode, and domNode are required',
    );
  }

  // 类型改变时完全替换（最简单但有效的策略）
  if (oldVNode.type !== newVNode.type) {
    try {
      const newDomNode = createDOMFromVNode(newVNode);
      const parent = domNode.parentNode;
      if (parent) {
        parent.replaceChild(newDomNode, domNode);

        // 清理旧的 ref
        if (oldVNode.ref && typeof oldVNode.ref === 'function') {
          oldVNode.ref(null);
        }

        // 调用新的 ref
        if (newVNode.ref && typeof newVNode.ref === 'function') {
          newVNode.ref(newDomNode);
        }
      }
    } catch (error) {
      console.error('[@fukict/widget] Error during DOM replacement:', error);
    }
    return;
  }

  // 对于相同类型的元素，执行增量更新
  const element = domNode as Element;

  try {
    // 差异更新属性（只操作变化的属性）
    patchProperties(element, newVNode.props, oldVNode.props);

    // 差异更新事件监听器（智能事件管理）
    patchEvents(element, newVNode.events, oldVNode.events);

    // 递归更新子节点（使用安全的数组处理）
    const oldChildren = Array.isArray(oldVNode.children)
      ? oldVNode.children
      : [];
    const newChildren = Array.isArray(newVNode.children)
      ? newVNode.children
      : [];
    patchChildren(element, oldChildren, newChildren);

    // 管理 ref 回调的生命周期
    if (oldVNode.ref !== newVNode.ref) {
      // 清理旧的 ref
      if (oldVNode.ref && typeof oldVNode.ref === 'function') {
        try {
          oldVNode.ref(null);
        } catch (error) {
          console.warn('[@fukict/widget] Error in old ref cleanup:', error);
        }
      }

      // 设置新的 ref
      if (newVNode.ref && typeof newVNode.ref === 'function') {
        try {
          newVNode.ref(element);
        } catch (error) {
          console.warn('[@fukict/widget] Error in new ref callback:', error);
        }
      }
    }
  } catch (error) {
    console.error('[@fukict/widget] Error during DOM update:', error);
  }
}

/**
 * 差异更新元素属性
 *
 * @param element - 目标 DOM 元素
 * @param newProps - 新属性对象
 * @param oldProps - 旧属性对象
 */
function patchProperties(
  element: Element,
  newProps: Record<string, any> | null,
  oldProps: Record<string, any> | null,
): void {
  const oldP = oldProps || {};
  const newP = newProps || {};

  // 移除不再存在的属性
  for (const key in oldP) {
    if (!(key in newP)) {
      removeProperty(element, key);
    }
  }

  // 更新或添加属性（updateProperty 内部会进行值比较优化）
  for (const key in newP) {
    updateProperty(element, key, newP[key], oldP[key]);
  }
}

/**
 * 差异更新事件监听器
 *
 * @param element - 目标 DOM 元素
 * @param newEvents - 新事件映射表
 * @param oldEvents - 旧事件映射表
 */
function patchEvents(
  element: Element,
  newEvents: Record<string, EventListener> | null,
  oldEvents: Record<string, EventListener> | null,
): void {
  if (!element) return;

  // 如果新旧事件完全相同，直接返回（性能优化）
  if (newEvents === oldEvents) return;

  const oldE = oldEvents || {};
  const newE = newEvents || {};

  // 移除不再存在的事件类型
  for (const eventType in oldE) {
    if (!(eventType in newE)) {
      const oldHandler = oldE[eventType];
      if (typeof oldHandler === 'function') {
        element.removeEventListener(eventType, oldHandler);
      }
    }
  }

  // 更新或添加事件
  for (const eventType in newE) {
    const newHandler = newE[eventType];
    const oldHandler = oldE[eventType];

    // 如果处理器引用相同，跳过
    if (newHandler === oldHandler) continue;

    // 移除旧处理器
    if (oldHandler && typeof oldHandler === 'function') {
      element.removeEventListener(eventType, oldHandler);
    }

    // 添加新处理器
    if (newHandler && typeof newHandler === 'function') {
      element.addEventListener(eventType, newHandler);
    }
  }
}

/**
 * 简化的子节点差异更新算法
 *
 * @param parent - 父元素
 * @param oldChildren - 旧子节点数组
 * @param newChildren - 新子节点数组
 */
function patchChildren(
  parent: Element,
  oldChildren: VNodeChild[],
  newChildren: VNodeChild[],
): void {
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    const childNode = parent.childNodes[i];

    if (newChild === undefined || newChild === null) {
      // 新子节点不存在，移除旧节点
      if (childNode) {
        removeNode(childNode);
      }
    } else if (oldChild === undefined || oldChild === null) {
      // 旧子节点不存在，添加新节点
      const newChildNode = createDOMFromChild(newChild);
      if (newChildNode) {
        appendChild(parent, newChildNode);
      }
    } else if (typeof oldChild !== typeof newChild) {
      // 类型不同，完全替换
      const newChildNode = createDOMFromChild(newChild);
      if (newChildNode && childNode) {
        parent.replaceChild(newChildNode, childNode);
      }
    } else if (typeof oldChild === 'object' && typeof newChild === 'object') {
      // 都是 VNode 对象，递归更新
      if (childNode && 'type' in oldChild && 'type' in newChild) {
        patchDOM(oldChild, newChild, childNode);
      }
    } else if (oldChild !== newChild) {
      // 原始值类型且内容不同，更新文本内容
      if (childNode && childNode.nodeType === Node.TEXT_NODE) {
        childNode.textContent = String(newChild);
      }
    }
    // 如果 oldChild === newChild，则无需操作（性能优化）
  }
}

/**
 * 从 VNode 创建 DOM 节点
 *
 * @param vnode - VNode 对象
 * @returns DOM 节点
 */
function createDOMFromVNode(vnode: VNode): Node {
  if (typeof vnode.type !== 'string') {
    throw new Error('[@fukict/widget] Cannot create DOM from component VNode');
  }

  const element = createElement(vnode.type);

  // 设置属性
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      if (key.startsWith('fukict:')) continue; // 跳过 fukict 内部属性
      updateProperty(element, key, value, undefined);
    }
  }

  // 设置事件
  if (vnode.events) {
    for (const [eventType, handler] of Object.entries(vnode.events)) {
      if (typeof handler === 'function') {
        element.addEventListener(eventType, handler);
      }
    }
  }

  // 递归创建子节点
  if (vnode.children) {
    const children = Array.isArray(vnode.children) ? vnode.children : [vnode.children];
    for (const child of children) {
      const childNode = createDOMFromChild(child);
      if (childNode) {
        appendChild(element, childNode);
      }
    }
  }

  // 调用 ref
  if (vnode.ref && typeof vnode.ref === 'function') {
    try {
      vnode.ref(element);
    } catch (error) {
      console.warn('[@fukict/widget] Error in ref callback:', error);
    }
  }

  return element;
}

/**
 * 从子节点创建 DOM 节点
 *
 * @param child - VNodeChild
 * @returns DOM 节点或 null
 */
function createDOMFromChild(child: VNodeChild): Node | null {
  // 过滤掉无效值
  if (child == null || typeof child === 'boolean') {
    return null;
  }

  // 处理原始类型值
  if (typeof child === 'string' || typeof child === 'number') {
    return createTextNode(String(child));
  }

  // 处理 VNode 对象
  if (typeof child === 'object' && 'type' in child) {
    return createDOMFromVNode(child as VNode);
  }

  // 其他类型，转换为字符串处理
  return createTextNode(String(child));
}
