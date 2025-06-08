/**
 * DOM 操作工具集
 * 提供高效的 DOM 创建、更新、插入等操作
 */

export function createElement(tag: string): Element {
  return document.createElement(tag);
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function createFragment(): DocumentFragment {
  return document.createDocumentFragment();
}

export function insertBefore(
  parent: Element,
  newNode: Node,
  referenceNode: Node | null,
): void {
  parent.insertBefore(newNode, referenceNode);
}

export function appendChild(parent: Element, node: Node): void {
  parent.appendChild(node);
}

export function removeNode(node: Node): void {
  const parent = node.parentNode;
  if (parent) {
    parent.removeChild(node);
  }
}

export function replaceNode(oldNode: Node, newNode: Node): void {
  const parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
}

export function clearChildren(element: Element): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function setProperty(element: Element, key: string, value: any): void {
  if (key === 'children') return;

  // 处理普通属性（事件已在编译时分离）
  if (key in element) {
    (element as any)[key] = value;
  } else {
    element.setAttribute(key, String(value));
  }
}

export function removeProperty(element: Element, key: string): void {
  if (key === 'children') return;

  // 移除普通属性（事件已在编译时分离）
  if (key in element) {
    (element as any)[key] = null;
  } else {
    element.removeAttribute(key);
  }
}

export function updateProperty(
  element: Element,
  key: string,
  newValue: any,
  oldValue: any,
): void {
  if (newValue === oldValue) return;

  if (newValue == null) {
    removeProperty(element, key);
  } else {
    setProperty(element, key, newValue);
  }
}

// 设置事件监听器（编译时分离）
export function setEvents(
  element: Element,
  events: Record<string, EventListener>,
): void {
  for (const [eventType, handler] of Object.entries(events)) {
    (element as any).addEventListener(eventType, handler);
  }
}

// 移除事件监听器
export function removeEvents(
  element: Element,
  events: Record<string, EventListener>,
): void {
  for (const [eventType, handler] of Object.entries(events)) {
    (element as any).removeEventListener(eventType, handler);
  }
}

// 更新事件监听器
export function updateEvents(
  element: Element,
  newEvents: Record<string, EventListener> | null,
  oldEvents: Record<string, EventListener> | null,
): void {
  // 移除旧事件
  if (oldEvents) {
    removeEvents(element, oldEvents);
  }

  // 添加新事件
  if (newEvents) {
    setEvents(element, newEvents);
  }
}
