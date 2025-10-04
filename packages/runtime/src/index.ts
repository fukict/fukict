/**
 * @fukict/runtime
 *
 * 高性能客户端渲染库核心包
 * 提供 VNode 到 DOM 的转换、渲染引擎和 TypeScript 支持
 */

// 导出类型定义
export type {
  VNode,
  VNodeChild,
  ComponentFunction,
  DOMProps,
  DOMEventProps,
  RenderOptions,
  UpdateContext,
  RefCallback,
} from '../types/index';

// 导出组件编码范式注册机制
export {
  registerComponentPattern,
  getAllPatterns,
  isRegisteredComponent,
  getComponentPattern,
  renderRegisteredComponent,
} from './pattern-registry';

export type { ComponentPatternHandler } from './pattern-registry';

// 导出渲染引擎
export { render, createDOMFromTree, updateDOM, hydrate } from './renderer';

// 导出 DOM 工具集
export * from './dom';

// 导出 VNode 缓存管理（高级 API）
export * from './vnode-cache';

// 导出 JSX 辅助函数
export * from './jsx-runtime';

// 导出包元数据
export { METADATA } from './metadata';
