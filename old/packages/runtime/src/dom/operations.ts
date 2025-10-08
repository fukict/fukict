/**
 * DOM 节点操作工具
 * 提供高效的节点插入、删除、替换等操作
 *
 * @fileoverview 核心 DOM 节点操作工具
 * @module @fukict/runtime/dom/operations
 */

/**
 * 在指定位置前插入节点
 *
 * @param parent - 父元素
 * @param newNode - 要插入的新节点
 * @param referenceNode - 参考节点，新节点将插入在它之前，为 null 时插入到末尾
 * @throws {Error} 当父元素或新节点为空时抛出错误
 *
 * @example
 * ```typescript
 * const parent = document.getElementById('container');
 * const newDiv = createElement('div');
 * const firstChild = parent.firstElementChild;
 * insertBefore(parent, newDiv, firstChild); // 插入到第一个位置
 * ```
 */
export function insertBefore(
  parent: Element,
  newNode: Node,
  referenceNode: Node | null,
): void {
  if (!parent || !newNode) {
    throw new Error('Parent and newNode are required');
  }
  parent.insertBefore(newNode, referenceNode);
}

/**
 * 添加子节点到父元素末尾
 *
 * @param parent - 父元素
 * @param node - 要添加的子节点
 * @throws {Error} 当父元素或节点为空时抛出错误
 *
 * @example
 * ```typescript
 * const parent = document.getElementById('container');
 * const child = createElement('p');
 * appendChild(parent, child);
 * ```
 */
export function appendChild(parent: Element, node: Node): void {
  if (!parent || !node) {
    throw new Error('Parent and node are required');
  }
  parent.appendChild(node);
}

/**
 * 从 DOM 树中移除节点
 * 安全的节点移除操作，自动处理父节点检查
 *
 * @param node - 要移除的节点
 *
 * @example
 * ```typescript
 * const element = document.getElementById('to-remove');
 * removeNode(element); // 安全移除，无需手动检查父节点
 * ```
 */
export function removeNode(node: Node): void {
  if (!node) return;

  const parent = node.parentNode;
  if (parent) {
    parent.removeChild(node);
  }
}

/**
 * 替换 DOM 节点
 *
 * @param oldNode - 要被替换的旧节点
 * @param newNode - 新节点
 * @throws {Error} 当任一节点为空时抛出错误
 *
 * @example
 * ```typescript
 * const oldButton = document.getElementById('old-btn');
 * const newButton = createElement('button');
 * newButton.textContent = 'New Button';
 * replaceNode(oldButton, newButton);
 * ```
 */
export function replaceNode(oldNode: Node, newNode: Node): void {
  if (!oldNode || !newNode) {
    throw new Error('Both oldNode and newNode are required');
  }

  const parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
}

/**
 * 高效清空元素的所有子节点
 * 使用现代 DOM API 或语义清晰的批量操作，性能优于逐个删除
 *
 * @param element - 要清空的元素
 *
 * @performance
 * - replaceChildren(): 最新标准，性能最佳
 * - innerHTML = '': 兼容性好，性能优秀
 * - 循环删除: 兜底方案，性能一般
 *
 * @example
 * ```typescript
 * const container = document.getElementById('list');
 * clearChildren(container); // 高效清空所有子元素
 * ```
 */
export function clearChildren(element: Element): void {
  if (!element) return;

  // 优先使用现代 replaceChildren API（Chrome 86+, Firefox 78+）
  if ('replaceChildren' in element) {
    element.replaceChildren();
    return;
  }

  // 回退方案：使用 innerHTML 清空（语义更清晰，性能好）
  // 对所有元素类型都适用，包括 HTML 和 SVG
  try {
    (element as any).innerHTML = '';
  } catch {
    // 极少数情况下 innerHTML 不可用，使用传统方式
    const el = element as any;
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
}
