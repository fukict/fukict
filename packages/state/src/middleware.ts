/**
 * @fukict/state - 中间件支持
 */

import type { Middleware, MiddlewareContext } from './types';

/**
 * 执行中间件链
 */
export function runMiddleware<T extends object>(
  middleware: Middleware<T>[],
  context: MiddlewareContext<T>,
): void {
  for (const mw of middleware) {
    try {
      mw(context);
    } catch (error) {
      console.error('[@fukict/state] Middleware error:', error);
    }
  }
}

/**
 * 内置日志中间件
 */
export function createLoggerMiddleware<T extends object>(
  options: {
    collapsed?: boolean;
    timestamp?: boolean;
  } = {},
): Middleware<T> {
  return (context) => {
    const { key, value, prevValue } = context;
    const timestamp = options.timestamp ? new Date().toISOString() : '';

    if (options.collapsed && typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(`[@fukict/state] ${String(key)} ${timestamp}`);
    } else {
      console.group(`[@fukict/state] ${String(key)} ${timestamp}`);
    }

    console.log('prev:', prevValue);
    console.log('next:', value);

    if (typeof console.groupEnd === 'function') {
      console.groupEnd();
    }
  };
}

/**
 * 内置冻结中间件（防止外部修改状态）
 */
export function createFreezeMiddleware<T extends object>(): Middleware<T> {
  return (context) => {
    const { value } = context;

    // 冻结对象类型的值
    if (typeof value === 'object' && value !== null) {
      Object.freeze(value);
    }
  };
}
