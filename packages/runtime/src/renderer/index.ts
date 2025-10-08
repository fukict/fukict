/**
 * 渲染器模块入口
 * 提供完整的 VNode 到 DOM 渲染能力
 *
 * @fileoverview 核心渲染 API 和模块导出
 * @module @fukict/runtime/renderer
 */
import type { RenderOptions, VNode } from '../../types';
import { createTextNode } from '../dom/factory';
import { appendChild, clearChildren } from '../dom/operations';
import { assertBrowserEnvironment } from '../env';
import { setVNodeDOM } from '../vnode-cache';
import { createDOMFromTree } from './creator';

/**
 * 将 VNode 渲染到指定的 DOM 容器中
 * 框架的主要入口函数，支持替换和追加两种模式
 *
 * @param vnode - 要渲染的根 VNode
 * @param options - 渲染选项配置
 *
 * @features
 * - 容器清空和替换模式
 * - 错误处理和验证
 * - 完整的渲染管道
 *
 * @throws {Error} 当容器无效时抛出错误
 *
 * @example
 * ```typescript
 * const vnode = { type: 'div', props: { className: 'app' }, children: [] };
 * render(vnode, { container: document.getElementById('root'), replace: true });
 * ```
 */
export function render(vnode: VNode, options: RenderOptions): void {
  // 确保在浏览器环境中运行
  assertBrowserEnvironment('render');

  if (!vnode) {
    throw new Error('Invalid VNode: cannot render null or undefined');
  }

  if (!options.container) {
    throw new Error('Invalid container: container element is required');
  }

  const { container, replace = false } = options;

  try {
    // 根据选项决定是否清空容器
    if (replace) {
      clearChildren(container);
    }

    // 创建 DOM 树并插入容器
    const domNode = createDOMFromTree(vnode);
    appendChild(container, domNode);
  } catch (error) {
    console.error('[@fukict/runtime] Error during render:', error);
    // 在生产环境中，可以选择显示错误信息而不是崩溃
    const errorNode = createTextNode('[Render Error]');
    if (replace) {
      clearChildren(container);
    }
    appendChild(container, errorNode);
    throw error; // 重新抛出错误，让调用者处理
  }
}

/**
 * DOM 水合功能（SSR 支持）
 * 将现有的服务端渲染 DOM 与 VNode 树建立关联
 *
 * @param vnode - 要水合的 VNode 树
 * @param existingDOM - 现有的 DOM 元素
 *
 * @todo 实现完整的水合逻辑，包括：
 * - 深度遍历和验证 DOM 结构
 * - 属性和事件的客户端激活
 * - 不匹配时的错误处理
 * - 性能优化的选择性水合
 *
 * @example
 * ```typescript
 * const vnode = { type: 'div', props: {}, children: [] };
 * const existingDOM = document.getElementById('ssr-root');
 * hydrate(vnode, existingDOM);
 * ```
 */
export function hydrate(vnode: VNode, existingDOM: Element): void {
  if (!vnode || !existingDOM) {
    throw new Error('Invalid arguments: vnode and existingDOM are required');
  }

  try {
    // 当前简单实现：仅建立映射关系
    setVNodeDOM(vnode, existingDOM);

    // TODO: 实现完整的水合逻辑
    // - 验证 DOM 结构与 VNode 的匹配性
    // - 激活事件监听器
    // - 递归处理子节点
    // - 处理客户端特有的属性

    console.warn('[@fukict/runtime] Hydration is not fully implemented yet');
  } catch (error) {
    console.error('[@fukict/runtime] Error during hydration:', error);
    throw error;
  }
}

// 转发导出其他渲染器模块
export { createDOMFromTree } from './creator';

// 不导出 component 模块（内部使用）
