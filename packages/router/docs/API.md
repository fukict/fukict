# Router 核心 API

## RouterProvider

**顶层路由管理器组件**，自动创建和管理 Router 实例。

```typescript
class RouterProvider extends Fukict<RouterProviderProps> {
  private router: Router;

  constructor(props: RouterProviderProps) {
    super(props);
    this.router = new Router({
      routes: props.routes,
      mode: props.mode,
      base: props.base,
      scrollBehavior: props.scrollBehavior,
    });
    Router.setInstance(this.router);
  }

  beforeUnmount(): void {
    this.router.destroy();
    Router.clearInstance();
  }

  render(): VNode {
    return <RouterView router={this.router} fallback={this.props.fallback} />;
  }
}

interface RouterProviderProps {
  routes: RouteConfig[];
  mode?: 'history' | 'hash';
  base?: string;
  fallback?: VNode;
  scrollBehavior?: ScrollBehavior;
}
```

**使用**：

```tsx
<RouterProvider routes={routes} mode="history" />
```

---

## Router

**路由管理器**，管理路由状态、history 监听、导航操作、组件实例生命周期。

```typescript
class Router {
  private static instance: Router | null = null;
  private depth: number;
  private currentRoute: Route;
  private refsManager: Map<string, { current: any }> | null = null;
  private currentInstance: RouteComponent | null = null;
  private currentComponentClass: RouteComponentClass | null = null;

  constructor(options: RouterOptions, depth: number = 0) {
    this.depth = depth;
    if (depth === 0) {
      this.listen(); // 只有顶层监听 history
    }
  }

  // 全局单例管理
  static setInstance(router: Router): void;
  static getInstance(): Router | null;
  static clearInstance(): void;

  // 子路由创建
  createChild(): Router;

  // refs 管理器注册（由 RouterView 调用）
  registerRefsManager(refs: Map<string, { current: any }>): void;
  unregisterRefsManager(): void;

  // 当前深度匹配的路由
  get matched(): RouteConfig | null;
  get route(): Route;

  // 导航方法
  push(location: Location): Promise<void>;
  replace(location: Location): Promise<void>;
  go(n: number): void;
  back(): void;
  forward(): void;

  // 全局守卫
  beforeEach(guard: NavigationGuard): UnregisterFn;
  afterEach(hook: AfterNavigationHook): UnregisterFn;

  // 工具方法
  resolve(location: Location): Route;

  // 销毁
  destroy(): void;
}
```

**关键方法**：

- `createChild()`：创建 depth+1 的子路由，用于嵌套路由
- `registerRefsManager()`：注册 refs 管理器，用于获取组件实例
- `matched`：返回当前深度对应的路由配置

---

## RouteComponent

**路由页面组件基类**，提供当前层级的完整路由上下文和工具方法。

```typescript
abstract class RouteComponent<P = {}> extends Fukict<P & RouteProps> {
  // 当前层级路由上下文
  protected get matched(): RouteConfig | null;
  protected get route(): Route;
  protected get params(): Record<string, string>;
  protected get query(): Record<string, string>;
  protected get meta(): Record<string, any>;
  protected get router(): Router;

  // 导航方法
  protected push(location: Location): Promise<void>;
  protected replace(location: Location): Promise<void>;

  // 参数更新工具
  protected updateParams(params: Record<string, any>): Promise<void>;
  protected updateQuery(query: Record<string, any>): Promise<void>;

  // 路由特定钩子
  routeParamsChanged?(
    newParams: Record<string, string>,
    oldParams: Record<string, string>,
  ): void;
  routeQueryChanged?(
    newQuery: Record<string, string>,
    oldQuery: Record<string, string>,
  ): void;
}

interface RouteProps {
  router: Router;
}
```

**使用示例**：

```tsx
class UserPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>User: {this.params.id}</h1>
        <p>Query page: {this.query.page || '1'}</p>
        <button on:click={() => this.push('/')}>Home</button>
        <button on:click={() => this.updateQuery({ page: '2' })}>
          Next Page
        </button>
      </div>
    );
  }

  mounted() {
    console.log('User page mounted, id:', this.params.id);
  }

  routeParamsChanged(newParams, oldParams) {
    console.log('User ID changed:', oldParams.id, '->', newParams.id);
    this.loadUser(newParams.id);
  }

  private loadUser(id: string) {
    // 加载用户数据
  }
}
```

---

## RouterView

**路由视图组件**，渲染匹配的路由组件，管理 refs 和子路由创建。

```typescript
class RouterView extends Fukict<RouterViewProps> {
  private childRouter: Router | null = null;

  mounted(): void {
    // 注册 refs 管理器到 Router
    this.props.router.registerRefsManager(this.refs);
  }

  beforeUnmount(): void {
    this.props.router.unregisterRefsManager();
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
          router={childRouter}
        />
      </div>
    );
  }

  private getRouterForChild(matched: RouteConfig): Router {
    if (matched.children && matched.children.length > 0) {
      if (!this.childRouter) {
        this.childRouter = this.props.router.createChild();
      }
      return this.childRouter;
    }
    return this.props.router;
  }
}

interface RouterViewProps {
  router: Router;
  fallback?: VNode;
}
```

**关键设计**：

- `fukict:ref={matched.path}`：使用 path 作为 ref 名称
- `registerRefsManager()`：将 refs 传递给 Router
- `getRouterForChild()`：为嵌套路由创建子路由

---

## Link

**声明式导航组件**，自动访问全局 Router 实例进行导航。

```typescript
class Link extends Fukict<LinkProps> {
  private handleClick = (e: Event) => {
    e.preventDefault();
    const router = Router.getInstance();
    if (!router) {
      console.warn('Router instance not found.');
      return;
    }

    const { to, replace } = this.props;
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };

  render(): VNode {
    const { to, children, ...rest } = this.props;
    const href = typeof to === 'string' ? to : to.path || '/';

    return (
      <a href={href} on:click={this.handleClick} {...rest}>
        {children}
      </a>
    );
  }
}

interface LinkProps {
  to: string | Location;
  replace?: boolean;
  children?: VNode[];
  [key: string]: any;
}
```

**使用**：

```tsx
<Link to="/">Home</Link>
<Link to="/users/123">User 123</Link>
<Link to={{ path: '/search', query: { q: 'hello' } }}>Search</Link>
<Link to="/about" replace>About (replace)</Link>
```

---

## 类型定义

### RouteConfig

```typescript
interface RouteConfig {
  path: string; // 路径模式
  component?: RouteComponentClass; // 页面组件类
  loader?: () => Promise<RouteModule>; // 懒加载
  children?: RouteConfig[]; // 嵌套路由
  redirect?: string; // 重定向
  name?: string; // 路由名称
  meta?: Record<string, any>; // 元信息
  beforeEnter?: NavigationGuard; // 路由级守卫
}

interface RouteModule {
  default: RouteComponentClass;
}

type RouteComponentClass = typeof RouteComponent;
```

### Route

```typescript
interface Route {
  path: string; // 完整路径
  params: Record<string, string>; // 动态参数
  query: Record<string, string>; // 查询参数
  hash: string; // hash
  matched: RouteConfig[]; // 匹配的路由链
  meta: Record<string, any>; // 合并的元信息
  name?: string; // 路由名称
}
```

### Location

```typescript
type Location =
  | string
  | {
      path?: string;
      name?: string;
      params?: Record<string, any>;
      query?: Record<string, any>;
      hash?: string;
    };
```

### NavigationGuard

```typescript
type NavigationGuard = (
  to: Route,
  from: Route,
  next: NextFunction,
) => void | Promise<void>;

type NextFunction = (location?: false | Location) => void;

type AfterNavigationHook = (to: Route, from: Route) => void;
```

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
