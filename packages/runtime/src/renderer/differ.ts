/**
 * DOM 差异更新器
 * 负责基于新旧 VNode 树执行最小化 DOM 更新
 *
 * @fileoverview VNode 差异比较和 DOM 增量更新算法
 * @module @fukict/runtime/renderer/differ
 */
import type { VNode, VNodeChild } from '../../types';
import { removeProperty, updateProperty } from '../dom/attributes';
import { updateEvent } from '../dom/events';
import { removeNode } from '../dom/operations';
import { appendChild } from '../dom/operations';
import { setVNodeDOM } from '../vnode-cache';
import { createDOMFromChild, createDOMFromTree } from './creator';

/**
 * 高效的 DOM 差异更新算法
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
 * 6. 映射关系维护：保持数据一致性
 *
 * @performance
 * - 避免不必要的 DOM 操作
 * - 智能的属性和事件差异算法
 * - 高效的子节点更新策略
 */
export function updateDOM(
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
): void {
  if (!oldVNode || !newVNode || !domNode) {
    throw new Error(
      'Invalid arguments: oldVNode, newVNode, and domNode are required',
    );
  }

  // 类型改变时完全替换（最简单但有效的策略）
  if (oldVNode.type !== newVNode.type) {
    try {
      const newDomNode = createDOMFromTree(newVNode);
      const parent = domNode.parentNode;
      if (parent) {
        parent.replaceChild(newDomNode, domNode);

        // 清理旧的 ref
        if (oldVNode.ref && typeof oldVNode.ref === 'function') {
          oldVNode.ref(null);
        }
      }
    } catch (error) {
      console.error('[@fukict/runtime] Error during DOM replacement:', error);
    }
    return;
  }

  // 对于相同类型的元素，执行增量更新
  const element = domNode as Element;

  try {
    // 差异更新属性（只操作变化的属性）
    updateProperties(element, newVNode.props, oldVNode.props);

    // 差异更新事件监听器（智能事件管理）
    updateEvents(element, newVNode.events, oldVNode.events);

    // 递归更新子节点（使用安全的数组处理）
    const oldChildren = Array.isArray(oldVNode.children)
      ? oldVNode.children
      : [];
    const newChildren = Array.isArray(newVNode.children)
      ? newVNode.children
      : [];
    updateChildren(element, oldChildren, newChildren);

    // 管理 ref 回调的生命周期
    if (oldVNode.ref !== newVNode.ref) {
      // 清理旧的 ref
      if (oldVNode.ref && typeof oldVNode.ref === 'function') {
        try {
          oldVNode.ref(null);
        } catch (error) {
          console.warn('[@fukict/runtime] Error in old ref cleanup:', error);
        }
      }

      // 设置新的 ref
      if (newVNode.ref && typeof newVNode.ref === 'function') {
        try {
          newVNode.ref(element);
        } catch (error) {
          console.warn('[@fukict/runtime] Error in new ref callback:', error);
        }
      }
    }

    // 更新双向映射关系
    setVNodeDOM(newVNode, domNode);
  } catch (error) {
    console.error('[@fukict/runtime] Error during DOM update:', error);
  }
}

/**
 * 差异更新元素属性
 * 高效的属性管理，只操作发生变化的属性
 *
 * @param element - 目标 DOM 元素
 * @param newProps - 新属性对象
 * @param oldProps - 旧属性对象
 *
 * @performance 使用对象遍历和差异比较，避免不必要的 DOM 操作
 *
 * @algorithm
 * 1. 遍历旧属性，移除不存在于新属性中的项
 * 2. 遍历新属性，更新或添加属性
 * 3. 利用 updateProperty 的内置优化（值相等时跳过）
 */
function updateProperties(
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
 * 高效的事件管理，只操作发生变化的事件
 *
 * @param element - 目标 DOM 元素
 * @param newEvents - 新事件映射表
 * @param oldEvents - 旧事件映射表
 *
 * @performance 使用对象遍历和差异比较，避免不必要的事件操作
 *
 * @algorithm
 * 1. 遍历旧事件，移除不存在于新事件中的类型
 * 2. 遍历新事件，更新或添加事件处理器
 * 3. 利用 updateEvent 的内置优化（引用相等时跳过）
 */
function updateEvents(
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

  // 更新或添加事件（updateEvent 内部会进行引用比较优化）
  for (const eventType in newE) {
    updateEvent(element, eventType, newE[eventType], oldE[eventType]);
  }
}

/**
 * 简化的子节点差异更新算法
 * 保持 Runtime 层的职责单一，提供基础但有效的子节点管理
 *
 * @param parent - 父元素
 * @param oldChildren - 旧子节点数组
 * @param newChildren - 新子节点数组
 *
 * @algorithm
 * 1. 计算最大长度，确保处理所有位置
 * 2. 逐位置比较子节点
 * 3. 处理添加、删除、替换、更新四种情况
 * 4. 递归调用 updateDOM 处理 VNode 子节点
 *
 * @note 这是简化版本，更复杂的场景可能需要 key-based 算法
 *
 * @performance 避免全量重建，只处理必要的变更
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
        updateDOM(oldChild, newChild, childNode);
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
