/**
 * RouterLink 组件
 * 导航链接组件，提供类型安全的路由导航
 *
 * @fileoverview RouterLink 核心组件实现
 * @module @fukict/router/components/router-link
 */
/* global URLSearchParams */
import { jsx } from '@fukict/runtime/jsx-runtime';
import { defineWidget } from '@fukict/widget';

import type { Router } from '../router';
import type { RouteLocationRaw } from '../types';

/**
 * RouterLink Props
 */
export interface RouterLinkProps {
  /** Router 实例 (必需) */
  router: Router;
  /** 目标路由 */
  to: RouteLocationRaw;
  /** 激活时的 class */
  activeClass?: string;
  /** 精确匹配激活时的 class */
  exactActiveClass?: string;
  /** 是否替换当前历史记录 */
  replace?: boolean;
  /** 子元素 */
  children?: any;
}

/**
 * RouterLink 组件
 * 提供声明式的路由导航
 *
 * @example
 * ```tsx
 * <RouterLink router={router} to="/about">About</RouterLink>
 * <RouterLink router={router} to={{ name: 'user', params: { id: '123' } }}>
 *   User 123
 * </RouterLink>
 * ```
 */
export const RouterLink = defineWidget<RouterLinkProps>(props => {
  const {
    router,
    to,
    activeClass = 'router-link-active',
    exactActiveClass = 'router-link-exact-active',
    replace = false,
    children,
  } = props;

  if (!router) {
    console.warn('[@fukict/router] RouterLink requires router prop');
    return jsx('a', {}, null, children);
  }

  // 计算 href
  let href = '#';
  try {
    if (typeof to === 'string') {
      href = to;
    } else if ('name' in to) {
      const resolved = router.resolve(to.name as any, to.params);
      if (resolved) {
        href = resolved.fullPath;
      }
    } else if ('path' in to) {
      href = to.path;
      if (to.query) {
        const query = new URLSearchParams(to.query as any).toString();
        href += query ? `?${query}` : '';
      }
      if (to.hash) {
        href += to.hash;
      }
    }
  } catch (error) {
    console.error('[@fukict/router] Error resolving route:', error);
  }

  // 计算是否激活
  const currentRoute = router.getCurrentRoute();
  const isActive = currentRoute.path.startsWith(
    typeof to === 'string' ? to : 'path' in to ? to.path : '',
  );
  const isExactActive =
    currentRoute.path ===
    (typeof to === 'string' ? to : 'path' in to ? to.path : '');

  // 构建 class
  const classList: string[] = [];
  if (isActive && activeClass) {
    classList.push(activeClass);
  }
  if (isExactActive && exactActiveClass) {
    classList.push(exactActiveClass);
  }

  // 点击处理
  const handleClick = (e: Event) => {
    e.preventDefault();

    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };

  return jsx(
    'a',
    {
      href,
      class: classList.join(' ') || undefined,
    },
    {
      click: handleClick,
    },
    children,
  );
});
