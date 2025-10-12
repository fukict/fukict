# 嵌套路由机制

## 核心概念

嵌套路由通过 **Router 深度管理** 和 **子路由自动创建** 实现：

1. Router 内部知道自己在第几层（`depth`）
2. 嵌套路由通过 `router.createChild()` 创建 depth+1 的子路由
3. 子路由订阅父路由变化，共享 `currentRoute`
4. 用户无需关心 depth，只需传递 `router` prop

## 深度管理

```typescript
class Router {
  private depth: number;
  private currentRoute: Route;

  constructor(options: RouterOptions, depth: number = 0) {
    this.depth = depth;

    // 只有顶层（depth=0）监听 history
    if (depth === 0) {
      this.listen();
    }
  }

  /**
   * 获取当前深度匹配的路由
   */
  get matched(): RouteConfig | null {
    return this.currentRoute.matched[this.depth] || null;
  }

  /**
   * 创建子路由（depth + 1）
   */
  createChild(): Router {
    const childRouter = new Router(this.options, this.depth + 1);

    // 子路由共享父路由的 currentRoute
    childRouter.currentRoute = this.currentRoute;

    // 子路由订阅父路由变化
    this.subscribe(() => {
      childRouter.currentRoute = this.currentRoute;
      childRouter.notify();
    });

    return childRouter;
  }
}
```

**关键点**：

- `depth` 表示当前 Router 在嵌套层级中的位置
- `matched` 根据 `depth` 返回当前层级匹配的路由配置
- `createChild()` 创建 `depth + 1` 的子路由
- 子路由不监听 history，只订阅父路由变化

## RouterView 创建子路由

```typescript
class RouterView extends Fukict<RouterViewProps> {
  private childRouter: Router | null = null;

  private getRouterForChild(matched: RouteConfig): Router {
    if (matched.children && matched.children.length > 0) {
      // 有嵌套路由，创建子路由
      if (!this.childRouter) {
        this.childRouter = this.props.router.createChild();
      }
      return this.childRouter;
    }

    // 无嵌套路由，返回当前 router
    return this.props.router;
  }

  render(): VNode {
    const matched = this.props.router.matched;

    if (!matched || !matched.component) {
      return this.props.fallback || <div class="router-view"></div>;
    }

    const RouteComp = matched.component;
    const childRouter = this.getRouterForChild(matched);

    return (
      <div class="router-view">
        <RouteComp
          fukict:detach={true}
          fukict:ref={matched.path}
          router={childRouter}  {/* 传递子路由或当前路由 */}
        />
      </div>
    );
  }
}
```

**关键点**：

- `getRouterForChild()` 判断是否有嵌套路由
- 有嵌套 → 创建子路由（`router.createChild()`）
- 无嵌套 → 返回当前 router
- 子组件收到的 `router` 已经是 `depth + 1` 的子路由

## 嵌套路由示例

### 路由配置

```typescript
const routes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: '/stats', component: StatsPage },
      { path: '/settings', component: SettingsPage },
      { path: '/profile', component: ProfilePage },
    ],
  },
];
```

### 布局组件

```tsx
class DashboardLayout extends RouteComponent {
  render() {
    return (
      <div class="dashboard">
        <aside class="sidebar">
          <h2>Dashboard</h2>
          <nav>
            <button on:click={() => this.push('/dashboard/stats')}>
              Stats
            </button>
            <button on:click={() => this.push('/dashboard/settings')}>
              Settings
            </button>
            <button on:click={() => this.push('/dashboard/profile')}>
              Profile
            </button>
          </nav>
        </aside>

        <main class="content">
          {/* 渲染子路由：this.router 已经是子路由实例 */}
          <RouterView router={this.router} />
        </main>
      </div>
    );
  }
}
```

### 子页面组件

```tsx
class StatsPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Stats</h1>
        <p>Dashboard statistics</p>
      </div>
    );
  }

  mounted() {
    console.log('StatsPage mounted');
  }
}

class SettingsPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Settings</h1>
        <p>Dashboard settings</p>
      </div>
    );
  }
}
```

## 渲染流程

### URL: `/dashboard/stats`

```
1. 顶层 Router (depth=0)
   ↓
   matched = { path: '/dashboard', component: DashboardLayout, children: [...] }
   ↓
2. 顶层 RouterView 渲染 DashboardLayout
   ↓
   检测到有 children，创建子路由 (depth=1)
   ↓
   传递给 DashboardLayout: router={childRouter}
   ↓
3. DashboardLayout 渲染
   ↓
   内部使用 <RouterView router={this.router} />
   ↓
4. 子 RouterView (使用 depth=1 的 Router)
   ↓
   matched = { path: 'stats', component: StatsPage }
   ↓
5. 渲染 StatsPage
```

### URL 变化: `/dashboard/stats` → `/dashboard/settings`

```
1. 顶层 Router 检测 URL 变化
   ↓
   currentRoute.matched = [DashboardLayout, SettingsPage]
   ↓
2. 顶层 Router 通知监听器
   ↓
3. 子 Router (depth=1) 收到父路由变化通知
   ↓
   更新 currentRoute
   ↓
   通知子 RouterView
   ↓
4. 子 RouterView 检测到 StatsPage → SettingsPage
   ↓
   触发重新渲染
   ↓
5. diff 自动处理：
   - StatsPage.beforeUnmount()
   - 卸载 StatsPage
   - 挂载 SettingsPage
   - SettingsPage.mounted()
```

## 多层嵌套

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '/users',
        component: UsersLayout,
        children: [
          { path: '/:id', component: UserDetail },
          { path: '/:id/edit', component: UserEdit },
        ],
      },
    ],
  },
];
```

### 渲染结构

```
AdminLayout (depth=0)
  ↓ <RouterView router={childRouter(depth=1)} />
UsersLayout (depth=1)
  ↓ <RouterView router={childRouter(depth=2)} />
UserDetail / UserEdit (depth=2)
```

### 深度对应关系

- `/admin` → depth=0 → AdminLayout
- `/admin/users/:id` → depth=1 → UsersLayout
- `/admin/users/:id` → depth=2 → UserDetail

## 关键设计点

1. **自动深度管理**：

   - Router 内部知道自己在第几层
   - `matched` getter 根据 depth 返回当前层级匹配的路由

2. **子路由自动创建**：

   - RouterView 检测到 `children` 时自动创建子路由
   - `router.createChild()` 返回 depth+1 的新 Router

3. **状态共享**：

   - 子路由订阅父路由变化
   - 共享 `currentRoute`
   - 只有顶层监听 history

4. **用户透明**：

   - 用户只需传递 `router` prop
   - 无需关心 depth
   - 无需手动创建子路由

5. **refs 层级隔离**：
   - 每个 Router 有独立的 refs 管理器
   - path 在当前层级唯一即可
   - 无需拼接上级 path

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
