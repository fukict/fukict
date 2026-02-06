/**
 * Router Panel View
 * 路由面板视图 - 拆分为 Sidebar（路由树）和 Detail（路由详情和历史）
 */
import type { MatchedRouteEntry, RouteTreeNode } from '~/types/router.js';
import { cn } from '~/utils/cn.js';

import type { VNodeChild } from '@fukict/basic';
import { Fukict } from '@fukict/basic';

import { cva } from 'class-variance-authority';

import Inspector from '../components/Inspector.js';
import { devtoolsStore } from '../stores/devtoolsStore.js';

const navItemVariants = cva(
  'border border-gray-200 dark:border-gray-700 rounded p-2 text-[11px]',
);

/**
 * Recursively count all route nodes in a tree
 */
function countRoutes(routes: RouteTreeNode[]): number {
  let count = 0;
  for (const route of routes) {
    count++;
    if (route.children?.length) {
      count += countRoutes(route.children);
    }
  }
  return count;
}

/**
 * Find a route node by path in the route tree
 */
function findRouteByPath(
  routes: RouteTreeNode[],
  path: string,
): RouteTreeNode | null {
  for (const route of routes) {
    if (route.path === path) return route;
    if (route.children?.length) {
      const found = findRouteByPath(route.children, path);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 路由树侧栏
 */
export class RouterSidebar extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = devtoolsStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  private handleSelectRoute = (route: RouteTreeNode): void => {
    devtoolsStore.setState({ selectedRoutePath: route.path });
  };

  /**
   * Render a route tree node with indentation (single-line compact)
   */
  private renderRouteNode(
    route: RouteTreeNode,
    currentPath: string,
    selectedPath: string | null,
    depth: number,
    index: number,
  ): VNodeChild[] {
    const isActive = route.path === currentPath;
    const isSelected = route.path === selectedPath;
    const paddingLeft = 8 + depth * 12;

    return [
      <div
        key={`${depth}-${index}`}
        class={cn(
          'flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 text-[11px]',
          isActive
            ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100'
            : isSelected
              ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50',
        )}
        style={`padding-left: ${paddingLeft}px;`}
        on:click={() => this.handleSelectRoute(route)}
      >
        {depth > 0 && (
          <span class="text-[10px] text-gray-400 dark:text-gray-500">└</span>
        )}
        <span class="font-mono font-medium">{route.path}</span>
        {route.component && (
          <span class="text-[10px] text-gray-400 dark:text-gray-500">
            {route.component}
          </span>
        )}
        {route.name && (
          <span class="text-[10px] text-gray-400 italic dark:text-gray-500">
            ({route.name})
          </span>
        )}
      </div>,
      ...(route.children?.length
        ? route.children.map((child, i) =>
            this.renderRouteNode(
              child,
              currentPath,
              selectedPath,
              depth + 1,
              i,
            ),
          )
        : []),
    ];
  }

  render() {
    const { router, selectedRoutePath } = devtoolsStore.getState();

    if (!router) {
      return (
        <div class="flex h-full flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <p class="text-xs">No router detected</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">
            Make sure your app is using @fukict/router
          </p>
        </div>
      );
    }

    const totalRoutes = countRoutes(router.routes);

    return (
      <div class="flex h-full flex-col">
        <div class="border-b border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Routes ({totalRoutes})
        </div>
        <div class="flex-1 overflow-y-auto py-1">
          {router.routes.length > 0 ? (
            <div>
              {router.routes.map((route, index) =>
                this.renderRouteNode(
                  route,
                  router.currentRoute.path,
                  selectedRoutePath,
                  0,
                  index,
                ),
              )}
            </div>
          ) : (
            <div class="p-2 text-xs text-gray-500 italic dark:text-gray-400">
              No routes configured
            </div>
          )}
        </div>
      </div>
    );
  }
}

/**
 * 路由详情面板
 */
export class RouterDetail extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = devtoolsStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  /**
   * Render matched route entry with depth indicator
   */
  private renderMatchedRoute(match: MatchedRouteEntry, index: number) {
    return (
      <div
        key={index}
        class="flex items-center justify-between rounded bg-gray-100 px-2 py-1.5 text-xs dark:bg-gray-800"
      >
        <div class="flex items-center gap-2">
          <span class="rounded bg-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {match.depth}
          </span>
          <span class="font-mono text-gray-900 dark:text-gray-100">
            {match.path}
          </span>
          {match.component && (
            <span class="text-[10px] text-gray-500 dark:text-gray-400">
              {match.component}
            </span>
          )}
        </div>
        {match.component && (
          <button
            class="rounded px-1.5 py-0.5 text-[9px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            on:click={() => this.revealInComponents(match.component!)}
            title="Reveal in Components panel"
          >
            reveal
          </button>
        )}
      </div>
    );
  }

  /**
   * Find component by name in the component tree and select it
   */
  private revealInComponents(componentName: string): void {
    const { components } = devtoolsStore.getState();
    const match = Object.values(components).find(c => c.name === componentName);
    if (match) {
      devtoolsStore.setState({
        selectedComponentId: match.id,
        pendingSelectId: match.id,
        pendingTab: 'components',
      });
    }
  }

  render() {
    const { router, selectedRoutePath } = devtoolsStore.getState();

    if (!router) {
      return (
        <div class="flex h-full items-center justify-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            No router detected
          </p>
        </div>
      );
    }

    const selectedRoute = selectedRoutePath
      ? findRouteByPath(router.routes, selectedRoutePath)
      : null;

    return (
      <div class="h-full overflow-y-auto">
        {/* 选中路由信息 */}
        {selectedRoute && (
          <div class="border-b border-gray-200 dark:border-gray-700">
            <div class="bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Selected Route
            </div>
            <div class="p-3">
              <div class="space-y-2 text-xs">
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Path:</span>
                  <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                    {selectedRoute.path}
                  </span>
                </div>
                {selectedRoute.name && (
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Name:</span>
                    <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                      {selectedRoute.name}
                    </span>
                  </div>
                )}
                {selectedRoute.component && (
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">
                        Component:
                      </span>
                      <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                        {selectedRoute.component}
                      </span>
                    </div>
                    <button
                      class="rounded px-1.5 py-0.5 text-[9px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      on:click={() =>
                        this.revealInComponents(selectedRoute.component!)
                      }
                      title="Reveal in Components panel"
                    >
                      reveal
                    </button>
                  </div>
                )}
                {selectedRoute.children &&
                  selectedRoute.children.length > 0 && (
                    <div>
                      <span class="text-gray-600 dark:text-gray-400">
                        Children:
                      </span>
                      <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                        {selectedRoute.children.length}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* 当前路由信息 */}
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Current Route
          </div>
          <div class="p-3">
            <div class="space-y-2 text-xs">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Path:</span>
                <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                  {router.currentRoute.path}
                </span>
              </div>

              {router.currentRoute.name && (
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Name:</span>
                  <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                    {router.currentRoute.name}
                  </span>
                </div>
              )}

              {router.currentRoute.hash && (
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Hash:</span>
                  <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                    {router.currentRoute.hash}
                  </span>
                </div>
              )}

              {router.currentRoute.fullPath && (
                <div>
                  <span class="text-gray-600 dark:text-gray-400">
                    Full Path:
                  </span>
                  <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                    {router.currentRoute.fullPath}
                  </span>
                </div>
              )}

              <div>
                <span class="text-gray-600 dark:text-gray-400">Mode:</span>
                <span class="ml-2 font-mono text-gray-900 dark:text-gray-100">
                  {router.mode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 路由参数 */}
        <Inspector
          title="Params"
          data={router.currentRoute.params}
          emptyText="No params"
        />

        {/* 查询参数 */}
        <Inspector
          title="Query"
          data={router.currentRoute.query}
          emptyText="No query params"
        />

        {/* 匹配的路由 */}
        {router.currentRoute.matched &&
          router.currentRoute.matched.length > 0 && (
            <div class="border-b border-gray-200 dark:border-gray-700">
              <div class="bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Matched Routes ({router.currentRoute.matched.length})
              </div>
              <div class="p-3">
                <div class="space-y-1">
                  {router.currentRoute.matched.map(
                    (match: MatchedRouteEntry, index) =>
                      this.renderMatchedRoute(match, index),
                  )}
                </div>
              </div>
            </div>
          )}

        {/* 导航历史 */}
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Navigation History ({router.history.length})
          </div>
          <div class="p-3">
            {router.history.length > 0 ? (
              <div class="space-y-2">
                {router.history
                  .slice()
                  .reverse()
                  .map((nav, index) => (
                    <div key={index} class={cn(navItemVariants())}>
                      <div class="mb-1 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-semibold text-gray-900 dark:text-gray-100">
                            {nav.to.path}
                          </span>
                          <span
                            class={cn(
                              'rounded px-1.5 py-0.5 text-[9px] font-medium',
                              nav.type === 'push'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : nav.type === 'replace'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
                            )}
                          >
                            {nav.type}
                          </span>
                        </div>
                        <span class="text-[10px] text-gray-500 dark:text-gray-400">
                          {new Date(nav.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {nav.from && (
                        <div class="text-[10px] text-gray-600 dark:text-gray-400">
                          From: <span class="font-mono">{nav.from.path}</span>
                        </div>
                      )}

                      {nav.to.params &&
                        Object.keys(nav.to.params).length > 0 && (
                          <div class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                            Params:{' '}
                            <span class="font-mono">
                              {JSON.stringify(nav.to.params)}
                            </span>
                          </div>
                        )}

                      {nav.to.query && Object.keys(nav.to.query).length > 0 && (
                        <div class="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                          Query:{' '}
                          <span class="font-mono">
                            {JSON.stringify(nav.to.query)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div class="text-xs text-gray-500 italic dark:text-gray-400">
                No navigation history
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
