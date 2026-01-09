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
