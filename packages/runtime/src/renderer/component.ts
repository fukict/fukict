/**
 * 组件渲染器
 * 负责函数组件和编码范式组件的渲染逻辑
 *
 * @fileoverview 组件类型 VNode 的专用渲染器
 * @module @fukict/runtime/renderer/component
 */
import type { ComponentFunction, VNode } from '../../types';
import { createTextNode } from '../dom/factory';
import {
  isRegisteredComponent,
  renderRegisteredComponent,
} from '../pattern-registry';

/**
 * 渲染函数组件和编码范式组件
 * 支持多种组件类型的统一处理和错误恢复
 *
 * @param vnode - 组件类型的 VNode
 * @param createDOMFromTree - DOM 树创建函数（由 creator 模块提供，避免循环依赖）
 * @returns 渲染后的 DOM 节点
 *
 * @algorithm
 * 1. 检查是否为注册的编码范式组件
 * 2. 如果是，使用专用的范式渲染器
 * 3. 否则作为普通函数组件处理
 * 4. 处理组件返回值的多种类型
 * 5. 错误边界处理和恢复
 *
 * @error_handling 组件渲染失败时显示错误信息而不是崩溃
 */
export function createDOMFromComponent(
  vnode: VNode,
  createDOMFromTree: (vnode: VNode) => Node,
): Node {
  const component = vnode.type as ComponentFunction;

  if (!component || typeof component !== 'function') {
    throw new Error('Invalid component: expected function');
  }

  // 检查是否为已注册的编码范式组件（Widget 等）
  if (isRegisteredComponent(component)) {
    const props = vnode.props || {};
    const children = vnode.children || [];

    try {
      // 使用注册的范式处理器渲染组件
      const renderedVNode = renderRegisteredComponent(
        component,
        props,
        children,
      );
      if (renderedVNode) {
        return createDOMFromTree(renderedVNode);
      }
    } catch (error) {
      console.error(
        `[@fukict/runtime] Error rendering registered component ${component.name || 'Anonymous'}:`,
        error,
      );
      return createTextNode(
        `[Pattern Component Error: ${component.name || 'Anonymous'}]`,
      );
    }
  }

  // 处理普通函数组件
  try {
    const props = vnode.props || {};
    const children = vnode.children || [];

    // 调用组件函数，传入完整的 props（包含 children）
    const result = component({ ...props, children }) as any;

    // 处理组件返回值的多种情况
    if (result && typeof result === 'object' && 'type' in result) {
      // 返回 VNode，递归处理
      return createDOMFromTree(result as VNode);
    }

    if (typeof result === 'string' || typeof result === 'number') {
      // 返回原始值，创建文本节点
      return createTextNode(String(result));
    }

    // 返回空值或 false，创建空文本节点（React 兼容行为）
    if (result === null || result === undefined || result === false) {
      return createTextNode('');
    }

    // 其他类型的返回值，转换为字符串
    return createTextNode(String(result));
  } catch (error) {
    // 错误边界：组件渲染失败时的恢复机制
    console.error(
      `[@fukict/runtime] Error rendering component ${component.name || 'Anonymous'}:`,
      error,
    );
    return createTextNode(
      `[Component Error: ${component.name || 'Anonymous'}]`,
    );
  }
}
