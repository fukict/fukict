/**
 * DOM 事件管理工具
 * 提供单个事件监听器的原子操作
 *
 * @fileoverview 核心 DOM 事件操作工具
 * @module @fukict/runtime/dom/events
 */

/**
 * 设置单个事件监听器
 * 绑定事件处理器到指定元素
 *
 * @param element - 目标元素
 * @param eventType - 事件类型（如 'click', 'mouseover'）
 * @param handler - 事件处理器函数
 *
 * @example
 * ```typescript
 * const button = createElement('button');
 * setEvent(button, 'click', () => console.log('Clicked!'));
 * setEvent(button, 'mouseover', (e) => console.log('Mouse over:', e.target));
 * ```
 */
export function setEvent(
  element: Element,
  eventType: string,
  handler: EventListener,
): void {
  if (!element || !eventType) return;

  if (typeof handler === 'function') {
    element.addEventListener(eventType, handler);
  } else {
    console.warn(`Invalid event handler for ${eventType}:`, handler);
  }
}

/**
 * 移除单个事件监听器
 * 安全移除指定的事件处理器，确保内存不泄漏
 *
 * @param element - 目标元素
 * @param eventType - 事件类型
 * @param handler - 要移除的事件处理器（必须与绑定时相同）
 *
 * @important 必须传入与绑定时完全相同的处理器函数引用
 *
 * @example
 * ```typescript
 * const clickHandler = () => console.log('Clicked');
 * setEvent(button, 'click', clickHandler);
 * removeEvent(button, 'click', clickHandler);
 * ```
 */
export function removeEvent(
  element: Element,
  eventType: string,
  handler: EventListener,
): void {
  if (!element || !eventType) return;

  if (typeof handler === 'function') {
    element.removeEventListener(eventType, handler);
  }
}

/**
 * 更新单个事件监听器
 * 智能替换事件处理器，只在处理器真正变化时执行操作
 *
 * @param element - 目标元素
 * @param eventType - 事件类型
 * @param newHandler - 新的事件处理器
 * @param oldHandler - 旧的事件处理器
 *
 * @performance 使用严格相等比较，只在处理器引用改变时才更新
 *
 * @example
 * ```typescript
 * const oldHandler = () => console.log('Old');
 * const newHandler = () => console.log('New');
 * updateEvent(button, 'click', newHandler, oldHandler); // 会更新
 * updateEvent(button, 'click', newHandler, newHandler); // 不会操作
 * ```
 */
export function updateEvent(
  element: Element,
  eventType: string,
  newHandler: EventListener | null | undefined,
  oldHandler: EventListener | null | undefined,
): void {
  if (!element || !eventType) return;

  // 处理器相同，无需操作（性能优化）
  if (newHandler === oldHandler) return;

  // 移除旧处理器
  if (oldHandler && typeof oldHandler === 'function') {
    element.removeEventListener(eventType, oldHandler);
  }

  // 添加新处理器
  if (newHandler && typeof newHandler === 'function') {
    element.addEventListener(eventType, newHandler);
  } else if (newHandler != null) {
    console.warn(`Invalid event handler for ${eventType}:`, newHandler);
  }
}

/**
 * 批量设置事件监听器（便捷方法）
 * 用于编译时分离的事件处理器统一绑定
 *
 * @param element - 目标元素
 * @param events - 事件类型到处理器的映射表
 *
 * @example
 * ```typescript
 * const button = createElement('button');
 * setEvents(button, {
 *   click: () => console.log('Clicked!'),
 *   mouseover: (e) => console.log('Mouse over:', e.target),
 * });
 * ```
 */
export function setEvents(
  element: Element,
  events: Record<string, EventListener>,
): void {
  if (!element || !events) return;

  for (const [eventType, handler] of Object.entries(events)) {
    setEvent(element, eventType, handler);
  }
}

/**
 * 批量移除事件监听器（便捷方法）
 *
 * @param element - 目标元素
 * @param events - 要移除的事件映射表
 *
 * @example
 * ```typescript
 * const handlers = { click: clickHandler };
 * removeEvents(button, handlers);
 * ```
 */
export function removeEvents(
  element: Element,
  events: Record<string, EventListener>,
): void {
  if (!element || !events) return;

  for (const [eventType, handler] of Object.entries(events)) {
    removeEvent(element, eventType, handler);
  }
}
