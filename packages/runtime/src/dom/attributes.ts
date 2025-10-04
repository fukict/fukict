/**
 * DOM 属性管理工具
 * 提供智能的属性设置、更新和删除操作
 *
 * @fileoverview 核心 DOM 属性操作工具
 * @module @fukict/runtime/dom/attributes
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
