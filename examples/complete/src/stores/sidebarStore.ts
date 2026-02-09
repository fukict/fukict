import { defineStore } from '@fukict/flux';
import type { RouteConfig } from '@fukict/router';

/**
 * 侧边栏数据项
 */
export interface SidebarItem {
  path: string;
  title: string;
  children?: SidebarItem[];
}

export interface SidebarState {
  items: SidebarItem[];
}

/**
 * 从路由配置提取侧边栏数据
 */
function extractSidebarItems(routes: RouteConfig[]): SidebarItem[] {
  const items: SidebarItem[] = [];

  for (const route of routes) {
    if (route.meta?.showInSidebar) {
      const item: SidebarItem = {
        path: route.path,
        title: route.meta.title || '',
      };

      if (route.children && route.children.length > 0) {
        const childItems = extractSidebarItems(route.children);
        if (childItems.length > 0) {
          item.children = childItems;
        }
      }

      items.push(item);
    }
  }

  return items;
}

export const sidebarStore = defineStore({
  scope: 'sidebar',

  state: {
    items: [] as SidebarItem[],
  } as SidebarState,

  actions: {
    init(_state: SidebarState, routes: RouteConfig[]) {
      const layoutRoute = routes[0];
      const items = layoutRoute.children
        ? extractSidebarItems(layoutRoute.children)
        : [];
      return { items };
    },
  },
});
