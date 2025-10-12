# Router 使用示例

## 基础路由

```tsx
import { Fukict, attach } from '@fukict/basic';
import { Link, RouteComponent, RouterProvider } from '@fukict/router';

// 页面组件
class HomePage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <p>Welcome to Fukict Router</p>
      </div>
    );
  }

  mounted() {
    console.log('Home page mounted');
  }
}

class AboutPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>About</h1>
        <p>Learn more about this application</p>
      </div>
    );
  }
}

class UserPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>User Profile</h1>
        <p>User ID: {this.params.id}</p>
        <p>Page: {this.query.page || '1'}</p>

        <button on:click={() => this.push('/')}>Go Home</button>
        <button on:click={() => this.updateQuery({ page: '2' })}>
          Next Page
        </button>
      </div>
    );
  }

  mounted() {
    console.log('User page mounted, id:', this.params.id);
    this.loadUser(this.params.id);
  }

  routeParamsChanged(newParams, oldParams) {
    console.log('User ID changed:', oldParams.id, '->', newParams.id);
    this.loadUser(newParams.id);
  }

  routeQueryChanged(newQuery, oldQuery) {
    console.log('Query changed:', oldQuery, '->', newQuery);
  }

  private loadUser(id: string) {
    // 加载用户数据
    console.log('Loading user:', id);
  }
}

// 路由配置
const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/users/:id', component: UserPage },
];

// 应用组件
class App extends Fukict {
  render() {
    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/users/123">User 123</Link>
          <Link to={{ path: '/users/456', query: { page: '2' } }}>
            User 456
          </Link>
        </nav>
        <RouterProvider routes={routes} mode="history" />
      </div>
    );
  }
}

// 挂载应用
attach(<App />, document.getElementById('app')!);
```

## 嵌套路由

```tsx
import { Fukict, attach } from '@fukict/basic';
import {
  Link,
  RouteComponent,
  RouterProvider,
  RouterView,
} from '@fukict/router';

// 布局组件
class DashboardLayout extends RouteComponent {
  render() {
    return (
      <div class="dashboard-layout">
        <aside class="sidebar">
          <h2>Dashboard</h2>
          <nav>
            <Link to="/dashboard/stats">Statistics</Link>
            <Link to="/dashboard/reports">Reports</Link>
            <Link to="/dashboard/settings">Settings</Link>
          </nav>
        </aside>

        <main class="content">
          {/* 渲染子路由 */}
          <RouterView router={this.router} />
        </main>
      </div>
    );
  }

  mounted() {
    console.log('Dashboard layout mounted');
  }
}

// 子页面组件
class StatsPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Statistics</h1>
        <p>View your statistics here</p>
      </div>
    );
  }
}

class ReportsPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Reports</h1>
        <p>Year: {this.query.year || '2025'}</p>
        <button on:click={() => this.updateQuery({ year: '2024' })}>
          View 2024
        </button>
      </div>
    );
  }

  routeQueryChanged(newQuery, oldQuery) {
    console.log('Year changed:', oldQuery.year, '->', newQuery.year);
    this.loadReport(newQuery.year);
  }

  private loadReport(year: string) {
    console.log('Loading report for year:', year);
  }
}

class SettingsPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Settings</h1>
        <p>Configure your dashboard</p>
      </div>
    );
  }
}

// 路由配置
const routes = [
  { path: '/', component: HomePage },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: '/stats', component: StatsPage },
      { path: '/reports', component: ReportsPage },
      { path: '/settings', component: SettingsPage },
    ],
  },
];

// 应用组件
class App extends Fukict {
  render() {
    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/dashboard/stats">Dashboard</Link>
        </nav>
        <RouterProvider routes={routes} />
      </div>
    );
  }
}

attach(<App />, document.getElementById('app')!);
```

## 懒加载

```tsx
// 路由配置（懒加载）
const routes = [
  { path: '/', component: HomePage },
  {
    path: '/dashboard',
    loader: () => import('./pages/Dashboard'),
    children: [
      { path: '/stats', loader: () => import('./pages/Stats') },
      { path: '/reports', loader: () => import('./pages/Reports') },
    ],
  },
];

// pages/Dashboard.tsx
import { RouteComponent, RouterView } from '@fukict/router';

export default class Dashboard extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Dashboard</h1>
        <RouterView router={this.router} />
      </div>
    );
  }
}

// pages/Stats.tsx
import { RouteComponent } from '@fukict/router';

export default class Stats extends RouteComponent {
  render() {
    return <div>Statistics Page</div>;
  }
}
```

## 导航守卫

```tsx
import { Router } from '@fukict/router';

// 获取全局 Router 实例
const router = Router.getInstance();

if (router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    console.log('Navigating from', from.path, 'to', to.path);

    // 检查认证
    if (to.meta.requiresAuth && !isAuthenticated()) {
      next('/login');
      return;
    }

    // 检查权限
    if (to.meta.roles && !hasRole(to.meta.roles)) {
      next('/forbidden');
      return;
    }

    next();
  });

  // 全局后置钩子
  router.afterEach((to, from) => {
    // 更新页面标题
    document.title = to.meta.title || 'App';

    // 发送页面浏览统计
    analytics.track('pageview', { path: to.path });
  });
}

// 路由配置（带元信息）
const routes = [
  {
    path: '/',
    component: HomePage,
    meta: { title: 'Home' },
  },
  {
    path: '/admin',
    component: AdminPage,
    meta: {
      title: 'Admin',
      requiresAuth: true,
      roles: ['admin'],
    },
    beforeEnter: (to, from, next) => {
      // 路由级守卫
      console.log('Entering admin page');
      next();
    },
  },
];

// 辅助函数
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function hasRole(roles: string[]) {
  const userRole = localStorage.getItem('role');
  return userRole && roles.includes(userRole);
}
```

## 编程式导航

```tsx
class MyComponent extends RouteComponent {
  handleLogin() {
    // 登录成功后导航
    this.push('/dashboard');
  }

  handleLogout() {
    // 登出后替换当前路由
    this.replace('/login');
  }

  handleSearch(keyword: string) {
    // 更新查询参数
    this.updateQuery({ q: keyword, page: '1' });
  }

  handleNextPage() {
    // 更新查询参数（保留其他参数）
    const currentPage = Number(this.query.page || '1');
    this.updateQuery({ page: String(currentPage + 1) });
  }

  handleUserChange(userId: string) {
    // 更新路由参数
    this.updateParams({ id: userId });
  }

  handleBack() {
    // 返回上一页
    this.router.back();
  }

  render() {
    return (
      <div>
        <button on:click={() => this.handleLogin()}>Login</button>
        <button on:click={() => this.handleLogout()}>Logout</button>
        <button on:click={() => this.handleBack()}>Back</button>
      </div>
    );
  }
}
```

## 404 处理

```tsx
class NotFoundPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>404 Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button on:click={() => this.push('/')}>Go Home</button>
      </div>
    );
  }
}

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  // 404 路由（通配符）
  { path: '*', component: NotFoundPage },
];

// 或者使用 fallback
<RouterProvider
  routes={routes}
  fallback={
    <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  }
/>;
```

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
