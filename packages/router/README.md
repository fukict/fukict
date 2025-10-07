# @fukict/router

轻量级路由库，专为 Fukict 框架设计。

## 安装

```bash
pnpm add @fukict/router
```

## 简单使用

### 1. 定义路由

```typescript
import { defineRoutes } from '@fukict/router';
import { Home } from './pages/Home';
import { About } from './pages/About';

export const routes = defineRoutes({
  home: {
    path: '/',
    component: Home,
  },
  about: {
    path: '/about',
    component: About,
  },
});
```

### 2. 创建路由组件

```typescript
import { RouteWidget } from '@fukict/router';

export class Home extends RouteWidget {
  render() {
    return <div>Home Page</div>;
  }
}
```

### 3. 创建 Router 实例

```typescript
import { createRouter } from '@fukict/router';
import { routes } from './routes';

const router = createRouter({
  routes,
  mode: 'history', // 'history' | 'hash'
});

// 启动路由
router.start();
```

### 4. 使用 RouterView

```typescript
import { Widget } from '@fukict/widget';
import { RouterView } from '@fukict/router';

class App extends Widget {
  render() {
    return (
      <div>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
        <RouterView router={router} />
      </div>
    );
  }
}
```

## 动态路由参数

```typescript
const routes = defineRoutes({
  user: {
    path: '/user/:id',
    component: User,
  },
});

class User extends RouteWidget {
  render() {
    return <div>User ID: {this.params.id}</div>;
  }
}
```

## 子路由嵌套

```typescript
const routes = defineRoutes({
  dashboard: {
    path: '/dashboard',
    component: Dashboard,
    children: {
      profile: {
        path: '/dashboard/profile',
        component: Profile,
      },
      settings: {
        path: '/dashboard/settings',
        component: Settings,
      },
    },
  },
});

class Dashboard extends RouteWidget {
  render() {
    return (
      <div>
        <h1>Dashboard</h1>
        <nav>
          <a href="/dashboard/profile">Profile</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
```

## 编程式导航

```typescript
class MyComponent extends RouteWidget {
  handleClick() {
    // 命名路由导航
    this.router.push('user', { id: '123' });

    // 路径导航
    this.router.push({ path: '/user/123' });

    // 带查询参数
    this.router.push('user', { id: '123' }, { tab: 'posts' });

    // 替换当前路由
    this.router.replace('home');

    // 前进/后退
    this.router.back();
    this.router.forward();
    this.router.go(-2);
  }
}
```

## 路由守卫

```typescript
// 全局前置守卫
const router = createRouter({
  routes,
  beforeEach: (to, from) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
      return { name: 'login' }; // 重定向
    }
  },
  afterEach: (to, from) => {
    console.log('Navigated to:', to.path);
  },
});

// 路由独享守卫
const routes = defineRoutes({
  admin: {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin()) {
        return false; // 阻止导航
      }
    },
    meta: { requiresAuth: true },
  },
});
```

## RouteWidget API

路由组件必须继承 `RouteWidget`：

```typescript
class MyRoute extends RouteWidget {
  // 访问路由上下文
  get router() // Router 实例
  get params() // 路径参数 { id: '123' }
  get query()  // 查询参数 { tab: 'posts' }
  get meta()   // 路由元信息

  render() {
    return <div>{this.params.id}</div>;
  }
}
```

## License

MIT
