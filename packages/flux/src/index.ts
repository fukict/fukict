/**
 * @fukict/flux - Minimal state management library for Fukict framework
 *
 * Core philosophy: Flux itself has no update permission, only provides subscription mechanism.
 */

// 导出核心类
export { Flux } from './Flux';

// 导出新的工厂函数（推荐）
export { defineStore } from './defineStore';

// 导出旧的工厂函数（向后兼容）
export { createFlux } from './createFlux';

// 导出类型
export type {
  // 通用类型
  FluxListener,
  FluxSelector,
  Unsubscribe,
  // 新 API 类型
  ActionContext,
  AsyncAction,
  AsyncActions,
  DefineStoreConfig,
  Store,
  SyncAction,
  SyncActions,
  WrappedAsyncAction,
  WrappedSyncAction,
  // 旧 API 类型（向后兼容）
  CreateFluxConfig,
  FluxInstance,
  FluxStore,
} from './types';
