/**
 * @fukict/state - 工具函数
 */

/**
 * 浅比较两个值是否相等
 */
export function shallowEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!Object.is(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

/**
 * 安全的 JSON 序列化
 */
export function safeStringify(value: any): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('[@fukict/state] Failed to stringify value:', error);
    return null;
  }
}

/**
 * 安全的 JSON 解析
 */
export function safeParse<T>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('[@fukict/state] Failed to parse JSON:', error);
    return null;
  }
}
