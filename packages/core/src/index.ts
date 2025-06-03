/**
 * @vanilla-dom/core
 *
 * 高性能客户端渲染库核心包
 * 提供 VNode 到 DOM 的转换、渲染引擎和 TypeScript 支持
 */
// 导入 JSX 类型定义，确保全局 JSX 命名空间可用
import './jsx-types.js';

// 导出类型定义
export type {
  VNode,
  VNodeChild,
  ComponentFunction,
  DOMProps,
  RenderOptions,
  UpdateContext,
} from './types.js';

// 导出渲染引擎
export { render, createDOMFromTree, updateDOM, hydrate } from './renderer.js';

// 导出 DOM 工具集
export {
  createElement,
  createTextNode,
  createFragment,
  insertBefore,
  appendChild,
  removeNode,
  replaceNode,
  clearChildren,
  setProperty,
  removeProperty,
  updateProperty,
  batchUpdate,
} from './dom-utils.js';

// 导出 JSX 辅助函数
export {
  hyperscript, // 主要API - VNode创建函数
  h, // Hyperscript别名
  Fragment, // Fragment组件
  jsx, // 兼容性别名（babel-plugin使用）
  jsxs, // 兼容性别名
  jsxDEV, // 兼容性别名
} from './jsx-runtime.js';

// 版本信息
export const version = '0.1.0';
