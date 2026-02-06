/**
 * Router tracking functions for hook
 */
import { MESSAGE_TYPE } from '~/constants';
import type { MatchedRouteEntry, RouteTreeNode } from '~/types/router';
import { serialize } from '~/utils/serialize';

import type { HookContext } from './types.js';

/**
 * Extract component name from a class/function reference (NOT an instance).
 * Route configs store class constructors, not instances.
 */
function getRouteComponentName(component: any): string | undefined {
  if (!component) return undefined;
  // displayName injected by babel-preset
  if (component.displayName) return component.displayName;
  // Class/function name (filter out generic "Function")
  if (typeof component === 'function' && component.name) return component.name;
  return undefined;
}

/**
 * Recursively serialize route config into tree nodes
 */
function serializeRouteTree(routes: any[]): RouteTreeNode[] {
  return routes.map((route: any) => {
    const node: RouteTreeNode = {
      path: route.path,
      name: route.name,
      component: getRouteComponentName(route.component),
    };
    if (route.children?.length) {
      node.children = serializeRouteTree(route.children);
    }
    return node;
  });
}

/**
 * Serialize matched routes with depth info
 */
function serializeMatched(matched: any[]): MatchedRouteEntry[] {
  return matched.map((m: any, index: number) => ({
    path: typeof m === 'string' ? m : m.path || '',
    component:
      typeof m === 'string' ? undefined : getRouteComponentName(m.component),
    depth: index,
  }));
}

/**
 * Track router registration
 */
export function trackRouterRegistration(ctx: HookContext, router: any): void {
  ctx.state.routerInfo = {
    mode: router.mode || 'hash',
    currentRoute: {
      path: router.currentRoute?.path || '/',
      name: router.currentRoute?.name,
      params: serialize(router.currentRoute?.params || {}),
      query: serialize(router.currentRoute?.query || {}),
      hash: router.currentRoute?.hash || '',
      fullPath: router.currentRoute?.fullPath || '/',
      matched: serializeMatched(router.currentRoute?.matched || []),
    },
    routes: serializeRouteTree(router.routes || []),
    history: [],
  };

  ctx.logger.log('Router registered:', ctx.state.routerInfo.mode);
  ctx.sendToDevTools(MESSAGE_TYPE.ROUTER_REGISTERED, {
    router: ctx.state.routerInfo,
  });
}

/**
 * Track route changes
 */
export function trackRouteChange(
  ctx: HookContext,
  from: any,
  to: any,
  type: 'push' | 'replace' | 'pop' = 'push',
): void {
  if (!ctx.state.routerInfo) return;

  const fromRoute = {
    path: from.path || '/',
    name: from.name,
    params: serialize(from.params || {}),
    query: serialize(from.query || {}),
    hash: from.hash || '',
    fullPath: from.fullPath || '/',
    matched: serializeMatched(from.matched || []),
  };

  const toRoute = {
    path: to.path || '/',
    name: to.name,
    params: serialize(to.params || {}),
    query: serialize(to.query || {}),
    hash: to.hash || '',
    fullPath: to.fullPath || '/',
    matched: serializeMatched(to.matched || []),
  };

  ctx.state.routerInfo.currentRoute = toRoute;

  const navigation = {
    from: fromRoute,
    to: toRoute,
    timestamp: Date.now(),
    type,
  };

  ctx.state.routerInfo.history.push(navigation);

  ctx.logger.log('Route changed:', fromRoute.path, '→', toRoute.path);
  ctx.sendToDevTools(MESSAGE_TYPE.ROUTE_CHANGED, {
    from: fromRoute,
    to: toRoute,
  });
  ctx.sendToDevTools(MESSAGE_TYPE.NAVIGATION, { navigation });
}
