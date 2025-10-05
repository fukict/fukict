/**
 * @fukict/state - 持久化工具
 */

import type { PersistOptions } from './types';
import { safeParse, safeStringify } from './helpers';

/**
 * 从存储中加载状态
 */
export function loadFromStorage<T extends object>(
  options: PersistOptions,
): Partial<T> | null {
  const { key, storage, include, exclude } = options;

  try {
    const json = storage.getItem(key);
    if (!json) {
      return null;
    }

    const data = safeParse<T>(json);
    if (!data) {
      return null;
    }

    // 过滤字段
    return filterFields(data, include, exclude);
  } catch (error) {
    console.error('[@fukict/state] Failed to load from storage:', error);
    return null;
  }
}

/**
 * 保存状态到存储
 */
export function saveToStorage<T extends object>(
  state: T,
  options: PersistOptions,
): void {
  const { key, storage, include, exclude } = options;

  try {
    // 过滤字段
    const filtered = filterFields(state, include, exclude);

    const json = safeStringify(filtered);
    if (json) {
      storage.setItem(key, json);
    }
  } catch (error) {
    console.error('[@fukict/state] Failed to save to storage:', error);
  }
}

/**
 * 过滤字段（根据 include/exclude 配置）
 */
function filterFields<T extends object>(
  data: T,
  include?: string[],
  exclude?: string[],
): Partial<T> {
  const result: Partial<T> = {};

  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue;
    }

    // 白名单过滤
    if (include && !include.includes(key)) {
      continue;
    }

    // 黑名单过滤
    if (exclude && exclude.includes(key)) {
      continue;
    }

    result[key] = data[key];
  }

  return result;
}
