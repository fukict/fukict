/**
 * DOM 创建器
 * 负责将 VNode 树转换为真实 DOM 节点
 *
 * @fileoverview VNode 到 DOM 的初始创建逻辑
 * @module @fukict/runtime/renderer/creator
 */
import type { VNode, VNodeChild } from '../../types';
import { setProperty } from '../dom/attributes';
import { setEvents } from '../dom/events';
import { createElement, createTextNode } from '../dom/factory';
import { appendChild } from '../dom/operations';
import { setVNodeDOM } from '../vnode-cache';
import { createDOMFromComponent } from './component';

/**
 * 将 VNode 树转换为真实 DOM 节点
 * 支持原生元素、函数组件和编码范式组件的完整渲染
 *
 * @param vnode - 要渲染的虚拟节点
 * @returns 创建的 DOM 节点
 *
 * @features
 * - 自动区分原生元素和组件类型
 * - 完整的属性和事件绑定
 * - 递归子节点渲染
 * - 双向映射关系建立
 * - ref 回调支持
 *
 * @performance 使用 WeakMap 存储映射关系，自动垃圾回收
 */
export function createDOMFromTree(vnode: VNode): Node {
  if (!vnode || typeof vnode !== 'object') {
    throw new Error('Invalid VNode: expected object');
  }

  if (typeof vnode.type === 'function') {
    // 处理函数组件和编码范式组件
    return createDOMFromComponent(vnode, createDOMFromTree);
  }

  if (typeof vnode.type !== 'string') {
    throw new Error(
      `Invalid VNode type: expected string or function, got ${typeof vnode.type}`,
    );
  }

  // 处理原生 HTML 元素
  const element = createElement(vnode.type);

  // 批量设置属性（性能优化）
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      setProperty(element, key, value);
    }
  }

  // 设置事件监听器（编译时分离的事件处理）
  if (vnode.events) {
    setEvents(element, vnode.events);
  }

  // 递归渲染子节点 - 使用防御性拷贝，保护原始数据
  const children = Array.isArray(vnode.children) ? vnode.children : [];
  for (const child of children) {
    const childNode = createDOMFromChild(child);
    if (childNode) {
      appendChild(element, childNode);
    }
  }

  // 建立双向映射关系（支持后续的增量更新）
  setVNodeDOM(vnode, element);

  // 调用 ref 回调（React 风格的 ref 支持）
  if (vnode.ref && typeof vnode.ref === 'function') {
    try {
      vnode.ref(element);
    } catch (error) {
      console.warn('[@fukict/runtime] Error in ref callback:', error);
    }
  }

  return element;
}

/**
 * 处理单个子节点的渲染
 * 支持多种子节点类型的统一处理
 *
 * @param child - 子节点（可能是 VNode、字符串、数字、布尔值或 null）
 * @returns DOM 节点或 null
 *
 * @features
 * - 自动类型识别和转换
 * - null/undefined/false 的过滤处理
 * - 字符串和数字的文本节点创建
 * - VNode 的递归渲染
 */
export function createDOMFromChild(child: VNodeChild): Node | null {
  // 过滤掉无效值（React 兼容行为）
  if (child == null || typeof child === 'boolean') {
    return null;
  }

  // 处理原始类型值
  if (typeof child === 'string' || typeof child === 'number') {
    return createTextNode(String(child));
  }

  // 处理 VNode 对象 - 此时 child 不可能是 boolean
  if (typeof child === 'object' && child !== null && 'type' in child) {
    return createDOMFromTree(child as VNode);
  }

  // 其他类型，转换为字符串处理
  return createTextNode(String(child));
}
