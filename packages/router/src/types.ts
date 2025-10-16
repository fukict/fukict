import type { VNode } from '@fukict/basic';

import type { Router } from './Router';

/**
 * 路由配置
 */
export interface RouteConfig {
  /**
   * 路由路径（支持动态参数，如 /users/:id）
   */
  path: string;

  /**
   * 路由组件（可选，与 loader 二选一）
   */
  component?: RouteComponentClass;

  /**
   * 懒加载函数（可选，与 component 二选一）
   * 返回 Promise<{ default: RouteComponentClass }>
   */
  loader?: () => Promise<{ default: RouteComponentClass }>;

  /**
   * 子路由配置
   */
  children?: RouteConfig[];

  /**
   * 路由元信息
   */
  meta?: RouteMeta;

  /**
   * 路由级别的导航守卫
   */
  beforeEnter?: NavigationGuard;

  /**
   * 路由名称（可选）
   */
  name?: string;

  /**
   * 重定向路径（可选）
   */
  redirect?: string;
}

/**
 * 匹配的路由信息
 */
export interface RouteMatch {
  /**
   * 匹配的路由配置
   */
  config: RouteConfig;

  /**
   * 路由参数（如 { id: '123' }）
   */
  params: Record<string, string>;

  /**
   * 完整路径
   */
  path: string;
}

/**
 * 路由元信息基础接口
 *
 * 这是一个空接口，允许用户通过模块扩展来定义项目特定的 meta 类型。
 *
 * @example 在项目的全局类型文件中扩展（例如 src/types/global.d.ts）：
 * ```typescript
 * declare module '@fukict/router' {
 *   interface RouteMeta {
 *     title?: string;
 *     description?: string;
 *     requiresAuth?: boolean;
 *   }
 * }
 * ```
 *
 * 扩展后，所有路由的 meta 都会自动获得这些类型，无需手动导入。
 */
export interface RouteMeta {
  /**
   * 内部重定向标记（不应该由用户直接使用）
   * @internal
   */
  __redirect__?: string;
}

/**
 * 当前路由对象
 */
export interface Route {
  /**
   * 当前完整路径
   */
  path: string;

  /**
   * 查询参数
   */
  query: Record<string, string>;

  /**
   * 路由参数
   */
  params: Record<string, string>;

  /**
   * 路由元信息
   */
  meta: RouteMeta;

  /**
   * 匹配的路由配置列表（从顶层到当前层级）
   */
  matched: RouteConfig[];

  /**
   * hash 值（如 #section1）
   */
  hash: string;
}

/**
 * Location 对象（用于导航）
 */
export interface Location {
  /**
   * 目标路径
   */
  path?: string;

  /**
   * 查询参数
   */
  query?: Record<string, string>;

  /**
   * hash 值
   */
  hash?: string;

  /**
   * 路由名称
   */
  name?: string;

  /**
   * 路由参数
   */
  params?: Record<string, string>;
}

/**
 * 导航守卫函数类型
 */
export type NavigationGuard = (
  to: Route,
  from: Route,
  next: (path?: string | false) => void,
) => void;

/**
 * 路由模式
 */
export type RouterMode = 'hash' | 'history';

/**
 * Router 配置选项
 */
export interface RouterOptions {
  /**
   * 路由配置列表
   */
  routes: RouteConfig[];

  /**
   * 路由模式（默认 'hash'）
   */
  mode?: RouterMode;

  /**
   * 基础路径（默认 '/'）
   */
  base?: string;

  /**
   * 全局前置守卫
   */
  beforeEach?: NavigationGuard;

  /**
   * 全局后置钩子
   */
  afterEach?: (to: Route, from: Route) => void;

  /**
   * History 实例（可选，如果提供则使用传入的实例）
   */
  history?: import('./history').IHistory;
}

/**
 * 路由组件类的构造函数类型
 */
export interface RouteComponentClass {
  new (props: RouteProps): RouteComponent;
}

/**
 * 路由组件的 props 类型
 */
export interface RouteProps {
  /**
   * Router 实例（可能是子路由）
   */
  router: Router;
}

/**
 * 路由组件基类的抽象接口
 */
export interface RouteComponent {
  /**
   * Router 实例
   */
  router: Router;

  /**
   * 当前匹配的路由配置
   */
  matched: RouteConfig | null;

  /**
   * 当前路由对象
   */
  route: Route;

  /**
   * 路由参数
   */
  params: Record<string, string>;

  /**
   * 查询参数
   */
  query: Record<string, string>;

  /**
   * 路由元信息
   */
  meta: RouteMeta;

  /**
   * 导航到指定路径（添加历史记录）
   */
  push(location: string | Location): void;

  /**
   * 替换当前路由（不添加历史记录）
   */
  replace(location: string | Location): void;

  /**
   * 返回上一页
   */
  back(): void;

  /**
   * 前进到下一页
   */
  forward(): void;

  /**
   * 更新查询参数（保留其他参数）
   */
  updateQuery(query: Record<string, string>): void;

  /**
   * 更新路由参数
   */
  updateParams(params: Record<string, string>): void;

  /**
   * 路由参数变化时的钩子
   */
  routeParamsChanged?(
    newParams: Record<string, string>,
    oldParams: Record<string, string>,
  ): void;

  /**
   * 查询参数变化时的钩子
   */
  routeQueryChanged?(
    newQuery: Record<string, string>,
    oldQuery: Record<string, string>,
  ): void;

  /**
   * 组件更新方法（由 Router 调用）
   */
  update(props: Partial<RouteProps>): void;

  /**
   * 渲染方法
   */
  render(): VNode;
}

/**
 * RouterProvider 组件的 props
 */
export interface RouterProviderProps {
  /**
   * 路由配置列表
   */
  routes: RouteConfig[];

  /**
   * 路由模式
   */
  mode?: RouterMode;

  /**
   * 基础路径
   */
  base?: string;

  /**
   * 全局前置守卫
   */
  beforeEach?: NavigationGuard;

  /**
   * 全局后置钩子
   */
  afterEach?: (to: Route, from: Route) => void;

  /**
   * 未匹配路由时的后备内容
   */
  fallback?: VNode;
}

/**
 * RouterView 组件的 props
 */
export interface RouterViewProps {
  /**
   * Router 实例
   */
  router: Router;

  /**
   * 未匹配路由时的后备内容
   */
  fallback?: VNode;
}

/**
 * Link 组件的 props
 */
export interface LinkProps {
  /**
   * 目标路径或 Location 对象
   */
  to: string | Location;

  /**
   * 是否使用 replace 模式（默认 false）
   */
  replace?: boolean;

  /**
   * CSS 类名
   */
  class?: string;

  /**
   * 激活时的 CSS 类名
   */
  activeClass?: string;

  /**
   * 精确匹配时的 CSS 类名
   */
  exactActiveClass?: string;

  /**
   * 其他 HTML 属性（如 class, style 等）
   */
  [key: string]: any;
}
