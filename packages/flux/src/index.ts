/**
 * @fukict/flux - Minimal state management library for Fukict framework
 *
 * Core philosophy: Flux itself has no update permission, only provides subscription mechanism.
 */

// 导出核心类
export { Flux } from './Flux';

// 导出工厂函数
export { defineStore } from './defineStore';

// 导出类型
export type {
  // 通用类型
  FluxListener,
  FluxSelector,
  Unsubscribe,
  // API 类型
  ActionContext,
  AsyncAction,
  AsyncActions,
  DefineStoreConfig,
  Store,
  SyncAction,
  SyncActions,
  WrappedAsyncAction,
  WrappedSyncAction,
} from './types';
