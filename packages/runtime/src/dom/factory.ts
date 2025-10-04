/**
 * DOM 节点创建工厂
 * 提供类型安全的节点创建操作
 *
 * @fileoverview 核心 DOM 节点创建工具
 * @module @fukict/runtime/dom/factory
 */

/**
 * 创建 HTML 元素
 *
 * @param tag - HTML 标签名称
 * @returns 创建的 DOM 元素
 * @throws {Error} 当标签名无效时抛出错误
 *
 * @example
 * ```typescript
 * const div = createElement('div');
 * const button = createElement('button');
 * ```
 */
export function createElement(tag: string): Element {
  if (!tag || typeof tag !== 'string') {
    throw new Error(`Invalid tag name: ${tag}`);
  }
  return document.createElement(tag);
}

/**
 * 创建文本节点
 *
 * @param text - 文本内容，支持任意类型（会自动转换为字符串）
 * @returns 文本节点
 *
 * @example
 * ```typescript
 * const textNode = createTextNode('Hello World');
 * const numberNode = createTextNode(42); // 自动转换为 "42"
 * ```
 */
export function createTextNode(text: string): Text {
  return document.createTextNode(String(text ?? ''));
}

/**
 * 创建文档片段
 * 文档片段是轻量级容器，可用于批量操作 DOM，提升性能
 *
 * @returns 文档片段
 *
 * @example
 * ```typescript
 * const fragment = createFragment();
 * fragment.appendChild(createElement('div'));
 * fragment.appendChild(createElement('span'));
 * document.body.appendChild(fragment); // 一次性插入多个元素
 * ```
 */
export function createFragment(): DocumentFragment {
  return document.createDocumentFragment();
}
