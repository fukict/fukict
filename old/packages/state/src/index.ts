/**
 * @fukict/state - 轻量级观察者状态管理
 *
 * 纯粹的观察者模式 + 不可变状态容器
 * - 显式读写状态（get/set）
 * - 手动订阅变更（subscribe）
 * - 用户自己决定如何响应
 * - 可选的批量更新优化
 */

export { createState } from './core';
export { createSelector } from './selector';
export { loadFromStorage, saveToStorage } from './persist';
export {
  runMiddleware,
  createLoggerMiddleware,
  createFreezeMiddleware,
} from './middleware';

export type {
  State,
  StateOptions,
  Listener,
  Selector,
  SelectorFn,
  PersistOptions,
  Middleware,
  MiddlewareContext,
} from './types';
