/**
 * @fukict/router
 *
 * Router for Fukict framework with nested routing and lazy loading
 */

// 导出类型
export type {
  RouteConfig,
  Route,
  RouteMatch,
  RouteMeta,
  Location,
  NavigationGuard,
  RouterMode,
  RouterOptions,
  RouteComponentClass,
  RouteProps,
  RouterProviderProps,
  RouterViewProps,
  LinkProps,
} from './types';

// 导出核心类
export { Router } from './Router';
export { RouteComponent } from './RouteComponent';

// 导出组件
export { RouterProvider } from './RouterProvider';
export { RouterView } from './RouterView';
export { Link } from './Link';

// 导出工具类（可选）
export { RouteMatcher } from './matcher';
export { createHistory, HashHistory, BrowserHistory } from './history';
export type { IHistory, HistoryListener } from './history';
