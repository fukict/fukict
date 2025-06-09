/**
 * DOM 操作工具集
 * 提供高效、类型安全的 DOM 创建、更新、插入等操作
 *
 * @fileoverview 核心 DOM 操作工具，优化性能和开发体验
 * @version 1.0.0
 */

// DOM 属性映射表 - 处理 React/JSX 到 HTML 属性名称转换
const PROPERTY_NAME_MAP: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
};

// 需要作为 DOM 属性而非 HTML 属性设置的字段
// 这些属性直接设置到 DOM 对象上能获得更好的性能和正确的行为
const DOM_PROPERTIES = new Set([
  'checked',
  'selected',
  'defaultChecked',
  'defaultSelected',
  'multiple',
  'value',
  'defaultValue',
]);

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

/**
 * 设置元素属性，智能处理不同类型的属性
 * 自动区分 DOM 属性和 HTML 属性，确保正确的设置方式
 *
 * @param element - 目标元素
 * @param key - 属性名（支持 JSX 风格，如 className）
 * @param value - 属性值
 *
 * @features
 * - 自动处理 className → class 等属性名映射
 * - 智能选择 DOM 属性 vs HTML 属性设置方式
 * - 优雅的错误处理和回退机制
 * - 自动过滤 children 等特殊属性
 *
 * @example
 * ```typescript
 * const button = createElement('button');
 * setProperty(button, 'className', 'btn primary'); // 自动转换为 class
 * setProperty(button, 'disabled', true); // 作为 DOM 属性设置
 * setProperty(button, 'data-id', '123'); // 作为 HTML 属性设置
 * ```
 */
export function setProperty(
  element: Element,
  key: string,
  value: unknown,
): void {
  if (!element || !key || key === 'children') return;

  // 处理 null/undefined 值
  if (value == null) {
    removeProperty(element, key);
    return;
  }

  // 获取实际的属性名（处理 className -> class 等映射）
  const actualKey = PROPERTY_NAME_MAP[key] || key;

  try {
    // 优先作为 DOM 属性设置（性能更好，行为更正确）
    if (DOM_PROPERTIES.has(actualKey) || actualKey in element) {
      (element as any)[actualKey] = value;
    } else {
      // 作为 HTML 属性设置
      element.setAttribute(actualKey, String(value));
    }
  } catch (error) {
    console.warn(`Failed to set property ${key}:`, error);
    // 回退到 setAttribute
    try {
      element.setAttribute(actualKey, String(value));
    } catch (fallbackError) {
      console.error(`Failed to set attribute ${key}:`, fallbackError);
    }
  }
}

/**
 * 移除元素属性
 * 智能处理 DOM 属性和 HTML 属性的移除
 *
 * @param element - 目标元素
 * @param key - 要移除的属性名
 *
 * @example
 * ```typescript
 * const input = document.querySelector('input');
 * removeProperty(input, 'disabled'); // 移除 disabled 属性
 * removeProperty(input, 'data-value'); // 移除自定义属性
 * ```
 */
export function removeProperty(element: Element, key: string): void {
  if (!element || !key || key === 'children') return;

  const actualKey = PROPERTY_NAME_MAP[key] || key;

  try {
    // 如果是 DOM 属性，设置为合适的默认值
    if (DOM_PROPERTIES.has(actualKey) || actualKey in element) {
      const descriptor = Object.getOwnPropertyDescriptor(element, actualKey);
      if (descriptor?.set) {
        (element as any)[actualKey] = getDefaultValue(actualKey);
      }
    } else {
      element.removeAttribute(actualKey);
    }
  } catch (error) {
    console.warn(`Failed to remove property ${key}:`, error);
    // 回退到 removeAttribute
    try {
      element.removeAttribute(actualKey);
    } catch (fallbackError) {
      console.error(`Failed to remove attribute ${key}:`, fallbackError);
    }
  }
}

/**
 * 获取 DOM 属性的默认值
 * 用于正确重置属性状态
 *
 * @param key - 属性名
 * @returns 属性的默认值
 * @internal
 */
function getDefaultValue(key: string): unknown {
  switch (key) {
    case 'checked':
    case 'selected':
    case 'defaultChecked':
    case 'defaultSelected':
    case 'multiple':
      return false;
    case 'value':
    case 'defaultValue':
      return '';
    default:
      return null;
  }
}

/**
 * 更新元素属性，只在值发生变化时执行操作
 * 性能优化的属性更新，避免不必要的 DOM 操作
 *
 * @param element - 目标元素
 * @param key - 属性名
 * @param newValue - 新值
 * @param oldValue - 旧值
 *
 * @performance 使用严格相等比较，只在值真正改变时才更新 DOM
 *
 * @example
 * ```typescript
 * updateProperty(element, 'className', 'new-class', 'old-class'); // 会更新
 * updateProperty(element, 'className', 'same-class', 'same-class'); // 不会更新
 * ```
 */
export function updateProperty(
  element: Element,
  key: string,
  newValue: unknown,
  oldValue: unknown,
): void {
  // 使用严格相等比较，对于对象引用也适用
  if (newValue === oldValue) return;

  if (newValue == null) {
    removeProperty(element, key);
  } else {
    setProperty(element, key, newValue);
  }
}

/**
 * 批量设置事件监听器
 * 用于编译时分离的事件处理器统一绑定
 *
 * @param element - 目标元素
 * @param events - 事件类型到处理器的映射表
 *
 * @features
 * - 自动验证事件处理器类型
 * - 安全的批量绑定操作
 * - 详细的错误提示
 *
 * @example
 * ```typescript
 * const button = createElement('button');
 * setEvents(button, {
 *   click: () => console.log('Clicked!'),
 *   mouseover: (e) => console.log('Mouse over:', e.target),
 *   keydown: handleKeyDown
 * });
 * ```
 */
export function setEvents(
  element: Element,
  events: Record<string, EventListener>,
): void {
  if (!element || !events) return;

  for (const [eventType, handler] of Object.entries(events)) {
    if (typeof handler === 'function') {
      element.addEventListener(eventType, handler);
    } else {
      console.warn(`Invalid event handler for ${eventType}:`, handler);
    }
  }
}

/**
 * 批量移除事件监听器
 * 安全移除指定的事件处理器，确保内存不泄漏
 *
 * @param element - 目标元素
 * @param events - 要移除的事件类型到处理器的映射表
 *
 * @important 必须传入与绑定时完全相同的处理器函数引用
 *
 * @example
 * ```typescript
 * const clickHandler = () => console.log('Clicked');
 *
 * setEvents(button, { click: clickHandler });
 *
 * removeEvents(button, { click: clickHandler });
 * ```
 */
export function removeEvents(
  element: Element,
  events: Record<string, EventListener>,
): void {
  if (!element || !events) return;

  for (const [eventType, handler] of Object.entries(events)) {
    if (typeof handler === 'function') {
      element.removeEventListener(eventType, handler);
    }
  }
}

/**
 * 智能差异更新事件监听器
 * 高效的事件处理器更新，只操作发生变化的事件
 *
 * @param element - 目标元素
 * @param newEvents - 新的事件映射表
 * @param oldEvents - 旧的事件映射表
 *
 * @performance
 * - 引用相等检查：完全相同时跳过所有操作
 * - 差异算法：只更新变化的事件类型
 * - 智能替换：处理器变化时先移除再添加
 *
 * @algorithm
 * 1. 移除不再需要的事件类型
 * 2. 更新已存在但处理器变化的事件
 * 3. 添加新增的事件类型
 *
 * @example
 * ```typescript
 * const oldHandlers = {
 *   click: oldClickHandler,
 *   mouseover: sharedHandler
 * };
 *
 * const newHandlers = {
 *   click: newClickHandler,    // 会更新
 *   mouseover: sharedHandler,  // 不变，跳过
 *   keydown: newKeyHandler     // 新增
 * };
 *
 * updateEvents(element, newHandlers, oldHandlers);
 * ```
 */
export function updateEvents(
  element: Element,
  newEvents: Record<string, EventListener> | null,
  oldEvents: Record<string, EventListener> | null,
): void {
  if (!element) return;

  // 如果新旧事件完全相同，直接返回（性能优化）
  if (newEvents === oldEvents) return;

  const oldEventTypes = new Set(oldEvents ? Object.keys(oldEvents) : []);
  const newEventTypes = new Set(newEvents ? Object.keys(newEvents) : []);

  // 移除不再需要的事件监听器
  for (const eventType of oldEventTypes) {
    if (!newEventTypes.has(eventType) && oldEvents) {
      const handler = oldEvents[eventType];
      if (typeof handler === 'function') {
        element.removeEventListener(eventType, handler);
      }
    }
  }

  // 添加新的事件监听器或更新已存在的
  for (const eventType of newEventTypes) {
    if (newEvents) {
      const newHandler = newEvents[eventType];
      const oldHandler = oldEvents?.[eventType];

      // 如果处理器发生变化，需要先移除旧的再添加新的
      if (newHandler !== oldHandler) {
        if (typeof oldHandler === 'function') {
          element.removeEventListener(eventType, oldHandler);
        }
        if (typeof newHandler === 'function') {
          element.addEventListener(eventType, newHandler);
        } else {
          console.warn(`Invalid event handler for ${eventType}:`, newHandler);
        }
      }
    }
  }
}
