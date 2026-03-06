# 路由

## 基础配置

```tsx
// src/router/index.tsx
import { Router, RouterView } from '@fukict/router';

const routes = [
  { path: '/', component: () => import('../pages/Home') },
  { path: '/about', component: () => import('../pages/About') },
];

export const router = new Router({
  mode: 'history',
  routes,
});
```

## App 入口

```tsx
// src/App.tsx
class App extends Fukict {
  render() {
    return <RouterView router={router} />;
  }
}
```

## 路由跳转

### 编程式

```tsx
import { RouteComponent } from '@fukict/router';

class Home extends RouteComponent {
  goToAbout() {
    this.router.push('/about');
  }

  render() {
    return <button on:click={() => this.goToAbout()}>Go to About</button>;
  }
}
```

### Link 组件

```tsx
import { Link } from '@fukict/router';

class Nav extends Fukict {
  render() {
    return (
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </nav>
    );
  }
}
```

## 路由参数

```tsx
const routes = [{ path: '/user/:id', component: UserProfile }];

class UserProfile extends RouteComponent {
  render() {
    const userId = this.route.params.id;
    return <div>User: {userId}</div>;
  }
}
```

## 子组件路由访问 (useRouter / useRoute)

非 `RouteComponent` 的普通子组件通过 `useRouter` / `useRoute` 访问路由上下文。

沿 `_parent` 链向上查找最近的 `RouteComponent` 祖先，获取其 `router` 实例；找不到则回退到 `Router.getInstance()` 全局单例。

```tsx
import { Fukict } from '@fukict/basic';
import { useRouter, useRoute } from '@fukict/router';

// 读取路由信息
class RouteInfo extends Fukict {
  render() {
    const route = useRoute(this);
    return <div>当前路径: {route.path}</div>;
  }
}

// 编程式导航
class NavButton extends Fukict<{ to: string }> {
  private handleClick = () => {
    useRouter(this).push(this.props.to);
  };

  render() {
    return <button on:click={this.handleClick}>导航</button>;
  }
}
```

**何时使用**：

- 普通子组件需要读取路由信息或执行导航
- 避免 prop drilling 传递 router
- 嵌套路由中需要获取最近的 router（而非全局单例）

**与 RouteComponent 的区别**：

| 方式              | 适用场景               |
| ----------------- | ---------------------- |
| `RouteComponent`  | 路由直接匹配的页面组件 |
| `useRouter(this)` | 页面内的普通子组件     |

## 导航守卫

```tsx
router.beforeEach((to, from, next) => {
  if (to.path !== '/login' && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  document.title = to.meta.title || 'App';
});
```

## 404

```tsx
const routes = [
  { path: '/', component: Home },
  { path: '/:pathMatch(.*)*', component: NotFound },
];
```
