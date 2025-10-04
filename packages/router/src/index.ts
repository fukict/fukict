/**
 * @fukict/router
 *
 * 轻量级路由库，专为 fukict 框架设计
 * 提供类型安全的路由管理和导航能力
 *
 * @fileoverview 主入口文件
 * @module @fukict/router
 */

// 导出核心类型
export type * from './types';

// 导出 Router 核心
export { Router, createRouter, defineRoutes } from './router';

// 导出 RouteWidget 基类
export { RouteWidget } from './route-widget';

// 导出路由组件
export { RouterView, RouterLink } from './components';

// 导出 History 管理（高级用途）
export { HashHistory, HTML5History } from './history';

// 导出匹配器（高级用途）
export { RouteMatcher, PathParser } from './matcher';
