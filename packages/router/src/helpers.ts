import type { Fukict } from '@fukict/basic';

import { RouteComponent } from './RouteComponent';
import { Router } from './Router';
import type { Route } from './types';

/**
 * 从组件的 _parent 链中查找最近的 RouteComponent 祖先
 */
function findRouteComponent(component: Fukict): RouteComponent | null {
  let current = component._parent;
  while (current) {
    if (current instanceof RouteComponent) {
      return current;
    }
    current = current._parent;
  }
  return null;
}

/**
 * 获取最近的 Router 实例
 *
 * 查找顺序:
 * 1. 遍历 _parent 链查找最近的 RouteComponent，返回其 router
 * 2. 回退到 Router.getInstance()（全局单例）
 * 3. 都找不到则抛出错误
 *
 * @example
 * ```tsx
 * class ChildComponent extends Fukict {
 *   goTo(path: string) {
 *     useRouter(this).push(path);
 *   }
 * }
 * ```
 */
export function useRouter(component: Fukict): Router {
  const routeComponent = findRouteComponent(component);
  if (routeComponent) {
    return routeComponent.router;
  }

  const instance = Router.getInstance();
  if (instance) {
    return instance;
  }

  throw new Error(
    '[fukict-router] No Router found. Ensure the component is rendered within a RouterView or a Router instance exists.',
  );
}

/**
 * 获取当前路由对象
 *
 * 查找顺序与 useRouter 相同，返回当前路由信息
 *
 * @example
 * ```tsx
 * class ChildComponent extends Fukict {
 *   render() {
 *     const route = useRoute(this);
 *     return <div>Current path: {route.path}</div>;
 *   }
 * }
 * ```
 */
export function useRoute(component: Fukict): Route {
  return useRouter(component).currentRoute;
}
