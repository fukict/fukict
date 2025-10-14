/**
 * @fukict/flux - Minimal state management library for Fukict framework
 *
 * Core philosophy: Flux itself has no update permission, only provides subscription mechanism.
 */

// 导出核心类
export { Flux } from './Flux';

// 导出工厂函数
export { createFlux } from './createFlux';

// 导出类型
export type {
  FluxListener,
  FluxSelector,
  Unsubscribe,
  CreateFluxConfig,
  FluxInstance,
  FluxStore,
} from './types';
