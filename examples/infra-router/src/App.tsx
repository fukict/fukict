import { Fukict } from '@fukict/basic';
import { type RouteConfig, Router, RouterProvider } from '@fukict/router';

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
 * 使用 Layout 模式 + default：
 * - 顶层路由是 LayoutPage，包含全局 Header 和 Footer
 * - 使用 default 指定访问 "/" 时的默认子组件
 * - 所有页面作为 LayoutPage 的子路由
 * - 这样 Header 中的 Link 组件能正确响应路由变化
 */
const routes: RouteConfig[] = [
  {
    path: '/',
    component: LayoutPage,
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: HomePage,
        meta: { title: 'Home' },
      },
      {
        path: '/about',
        component: AboutPage,
        meta: { title: 'About' },
      },
      {
        path: '/user/:id',
        component: UserPage,
        meta: { title: 'User Profile' },
        beforeEnter: (to, _from, next) => {
          console.log('Entering user page:', to.params.id);
          next();
        },
      },
      {
        path: '/search',
        component: SearchPage,
        meta: { title: 'Search' },
      },
      {
        path: '/dashboard',
        component: DashboardPage,
        meta: { title: 'Dashboard' },
        redirect: '/dashboard/overview',
        children: [
          {
            path: '/overview',
            component: DashboardOverviewPage,
            meta: { title: 'Dashboard - Overview' },
          },
          {
            path: '/analytics',
            component: DashboardAnalyticsPage,
            meta: { title: 'Dashboard - Analytics' },
          },
          {
            path: '/settings',
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

/**
 * App 组件
 *
 * 简化为只包含 Router 创建和 RouterView
 * 所有 UI（Header、Footer）都移到 LayoutPage 中
 */
export class App extends Fukict {
  router: Router;

  constructor(props: any) {
    super(props);

    // 创建 Router 实例
    this.router = new Router({
      mode: 'hash',
      routes,
    });
  }

  render() {
    return (
      <RouterProvider
        mode="hash"
        routes={routes}
        beforeEach={(to, from, next) => {
          console.log('Global beforeEach:', from.path, '->', to.path);
          // 更新页面标题
          if (to.meta.title) {
            document.title = `${to.meta.title} | Fukict Router`;
          }
          next();
        }}
        afterEach={(to, from) => {
          console.log('Global afterEach:', from.path, '->', to.path);
        }}
      />
    );
  }
}
