import { type RouteConfig } from '@fukict/router';

import { AboutPage } from './pages/AboutPage';
import { DashboardAnalyticsPage } from './pages/DashboardAnalyticsPage';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardSettingsPage } from './pages/DashboardSettingsPage';
import { HomePage } from './pages/HomePage';
import { LayoutPage } from './pages/LayoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SearchPage } from './pages/SearchPage';
import { UserPage } from './pages/UserPage';

/**
 * 路由配置
 *
 * 支持两种路径配置方式：
 * 1. 绝对路径：以 "/" 开头，如 "/home", "/user/:id"
 * 2. 相对路径：不以 "/" 开头，会自动拼接父路径，如 "home", "user/:id"
 *
 * 特殊情况：
 * - 空字符串 "" 表示 index 路由，匹配父路径本身（如访问 "/" 时渲染 HomePage）
 *
 * Layout 模式：
 * - 顶层路由是 LayoutPage，包含全局 Header 和 Footer
 * - 所有页面作为 LayoutPage 的子路由
 * - Header 中的 Link 组件能正确响应路由变化
 */
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: LayoutPage,
    children: [
      {
        // 空字符串表示 index 路由，访问 "/" 时渲染 HomePage
        path: '',
        component: HomePage,
        meta: { title: 'Home' },
      },
      {
        // 相对路径，实际匹配 "/about"
        path: 'about',
        component: AboutPage,
        meta: { title: 'About' },
      },
      {
        // 相对路径 + 动态参数，实际匹配 "/user/:id"
        path: 'user/:id',
        component: UserPage,
        meta: { title: 'User Profile' },
        beforeEnter: (to, _from, next) => {
          console.log('Entering user page:', to.params.id);
          next();
        },
      },
      {
        path: 'search',
        component: SearchPage,
        meta: { title: 'Search' },
      },
      {
        path: 'dashboard',
        component: DashboardPage,
        meta: { title: 'Dashboard' },
        children: [
          {
            // 空字符串表示 index 路由，访问 "/dashboard" 时渲染 Overview
            path: '',
            component: DashboardOverviewPage,
            meta: { title: 'Dashboard - Overview' },
          },
          {
            // 相对路径，实际匹配 "/dashboard/analytics"
            path: 'analytics',
            component: DashboardAnalyticsPage,
            meta: { title: 'Dashboard - Analytics' },
          },
          {
            path: 'settings',
            component: DashboardSettingsPage,
            meta: { title: 'Dashboard - Settings' },
          },
        ],
      },
      {
        path: '*',
        component: NotFoundPage,
        meta: { title: '404 Not Found' },
      },
    ],
  },
];
