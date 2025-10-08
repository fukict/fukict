# @fukict/router 设计文档

## 包职责

router 是 Fukict 的路由管理器，职责：

1. **路由匹配**：URL 到组件的映射
2. **导航管理**：编程式导航和声明式导航
3. **历史管理**：浏览器 history 操作
4. **嵌套路由**：支持多级路由嵌套
5. **路由守卫**：导航前后的钩子
6. **懒加载**：按需加载路由组件
7. **组件生命周期**：路由切换时正确处理组件装卸

## 依赖关系

```
@fukict/widget (peer dependency)
    ↑
@fukict/router
```

**依赖说明**：
- router 依赖 widget 的 Widget 类和生命周期机制
- RouterView 本身是一个 Widget 组件
- 用户需要同时安装 widget 和 router

## 核心设计理念

### "声明式路由，命令式导航，自动装卸"

router 提供声明式路由配置和命令式导航 API，自动管理路由组件生命周期：

```
路由配置（声明式）
  ↓
Router 实例创建
  ↓
导航操作（命令式）
  ↓
匹配路由 → 卸载旧组件 → 渲染新组件
```

## 路由配置设计

### 路由定义

```typescript
interface RouteConfig {
  path: string                    // 路径模式
  component?: Component           // 组件（同步）
  loader?: () => Promise<any>     // 懒加载（异步）
  children?: RouteConfig[]        // 嵌套路由
  redirect?: string               // 重定向
  name?: string                   // 路由名称（可选）
  meta?: Record<string, any>      // 元信息（可选）
  beforeEnter?: NavigationGuard   // 路由级守卫
}
```

### 路径模式

**支持的模式**：
- 静态路径：`/home`、`/about`
- 动态参数：`/users/:id`、`/posts/:postId/comments`
- 可选参数：`/docs/:lang?`
- 通配符：`/files/*`
- 正则约束：`/users/:id(\\d+)`

**匹配优先级**：
1. 静态路径 > 动态路径 > 通配符
2. 先定义 > 后定义

## Router 类设计

### 实例化

```typescript
class Router {
  constructor(options: RouterOptions)
}

interface RouterOptions {
  routes: RouteConfig[]           // 路由配置
  mode?: 'history' | 'hash'       // 模式（默认 history）
  base?: string                   // 基础路径
  fallback?: Component            // 404 组件
  scrollBehavior?: ScrollBehavior // 滚动行为
}
```

### 核心 API

```typescript
class Router {
  // 当前路由（响应式）
  get route(): Route

  // 导航
  push(location: Location): Promise<void>
  replace(location: Location): Promise<void>
  go(n: number): void
  back(): void
  forward(): void

  // 守卫
  beforeEach(guard: NavigationGuard): UnregisterFn
  afterEach(hook: AfterNavigationHook): UnregisterFn

  // 工具
  resolve(location: Location): Route
  subscribe(listener: () => void): UnregisterFn

  // 生命周期
  start(): void
  stop(): void

  // 状态
  isLoading: boolean
}
```

**API 改进说明**：
- `route` 替代 `getCurrentRoute()` - 更简洁
- `subscribe()` 用于组件订阅路由变化

## Route 对象设计

```typescript
interface Route {
  path: string                    // 完整路径
  params: Record<string, string>  // 动态参数
  query: Record<string, string>   // 查询参数
  hash: string                    // hash
  matched: RouteConfig[]          // 匹配的路由链（嵌套）
  meta: Record<string, any>       // 合并的元信息
  name?: string                   // 路由名称
}
```

## 导航守卫设计

### 守卫类型

**全局守卫**：
```typescript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  console.log(`Navigated to ${to.path}`)
})
```

**路由级守卫**：
```typescript
{
  path: '/admin',
  component: AdminPanel,
  beforeEnter: (to, from, next) => {
    isAdmin() ? next() : next('/403')
  }
}
```

### 守卫执行顺序

```
1. 全局 beforeEach 守卫
   ↓
2. 路由配置 beforeEnter 守卫
   ↓
3. 执行导航（卸载旧组件，渲染新组件）
   ↓
4. 全局 afterEach 钩子
```

### next() 语义

```typescript
next()              // 继续导航
next(false)         // 取消导航
next('/login')      // 重定向
next({ name: 'home' })  // 命名路由重定向
```

## 组件生命周期管理

### 核心问题

**路由切换时需要**：
1. 卸载旧路由组件（调用 onBeforeUnmount）
2. 渲染新路由组件（触发 onMounted）
3. 嵌套路由只更新变化的层级

### RouterView 组件

```typescript
class RouterView extends Widget {
  private currentComponent?: Widget
  private unsubscribe?: UnregisterFn

  onMounted() {
    // 订阅路由变化
    this.unsubscribe = this.props.router.subscribe(() => {
      this.updateView()
    })

    // 初始渲染
    this.updateView()
  }

  onBeforeUnmount() {
    // 卸载当前组件（会自动递归卸载子组件）
    this.unmountCurrentComponent()

    // 取消订阅
    this.unsubscribe?.()
  }

  private updateView() {
    const route = this.props.router.route
    const depth = this.props.depth || 0
    const matched = route.matched[depth]

    // 路由变化，卸载旧组件
    this.unmountCurrentComponent()

    // 渲染新组件
    if (matched?.component) {
      this.forceUpdate()
    }
  }

  private unmountCurrentComponent() {
    if (this.currentComponent) {
      // Widget.unmount() 会：
      // 1. 调用 onBeforeUnmount
      // 2. 递归卸载所有子组件（通过 refs 获取子 RouterView）
      // 3. 移除 DOM
      this.currentComponent.unmount()
      this.currentComponent = undefined
    }
  }

  render() {
    const route = this.props.router.route
    const depth = this.props.depth || 0
    const matched = route.matched[depth]

    if (!matched) {
      return this.props.fallback || null
    }

    if (matched.loader && !matched.component) {
      return this.props.loading || null
    }

    const Component = matched.component

    // 创建组件实例（Widget 会在 onMounted 中处理初始化）
    const instance = new Component({ ...route })
    this.currentComponent = instance

    return instance.render()
  }
}
```

### 嵌套路由的装卸

**场景**：`/dashboard/stats` → `/dashboard/settings`

**matched 变化**：
```typescript
旧路由: [
  { path: '/dashboard', component: DashboardLayout },
  { path: 'stats', component: Stats }
]

新路由: [
  { path: '/dashboard', component: DashboardLayout },
  { path: 'settings', component: Settings }
]
```

**装卸逻辑**：
- **深度 0（DashboardLayout）**：未变化，不重新渲染
- **深度 1（Stats → Settings）**：变化，卸载 Stats，渲染 Settings

**实现方式**：
- 每个 RouterView 独立管理自己深度的组件
- 深度 0 的 RouterView 检测到 `matched[0]` 未变化，不卸载
- 深度 1 的 RouterView 检测到 `matched[1]` 变化，卸载旧组件，渲染新组件

### 完整生命周期流程

**导航：`/home` → `/about`**

```
1. 触发 router.push('/about')
   ↓
2. 执行 beforeEach 守卫
   ↓
3. 匹配新路由
   ↓
4. 更新 router.route（响应式）
   ↓
5. 通知所有订阅者（RouterView）
   ↓
6. RouterView 调用 unmountCurrentComponent()
   - 调用旧组件的 onBeforeUnmount()
   - 移除 DOM
   ↓
7. RouterView 重新 render()
   - 创建新组件实例
   - 调用新组件的 onMounted()
   ↓
8. 执行 afterEach 钩子
```

## 懒加载设计

### loader 函数

```typescript
const routes = [
  {
    path: '/heavy',
    loader: () => import('./HeavyComponent')
  }
]
```

### 加载流程

```
1. 匹配到懒加载路由
   ↓
2. 执行 loader() 获取 Promise
   ↓
3. RouterView 显示 loading 状态
   ↓
4. Promise resolve 后设置 component
   ↓
5. RouterView 渲染组件
```

## History 模式设计

### history 模式

```typescript
const router = new Router({
  mode: 'history',
  routes
})
// URL: /users/123
```

**优势**：干净的 URL、SEO 友好
**要求**：服务器配置支持

### hash 模式

```typescript
const router = new Router({
  mode: 'hash',
  routes
})
// URL: /#/users/123
```

**优势**：无需服务器配置
**劣势**：URL 不美观

## 与 Widget 集成

### Router 作为 Widget 属性

```typescript
class App extends Widget {
  router: Router

  constructor(props) {
    super(props)
    this.router = new Router({
      routes: [...]
    })
  }

  onMounted() {
    this.router.start()
  }

  onBeforeUnmount() {
    this.router.stop()
  }

  render() {
    return <RouterView router={this.router} />
  }
}
```

## 类型定义

```typescript
interface RouteConfig {
  path: string
  component?: Component
  loader?: () => Promise<any>
  children?: RouteConfig[]
  redirect?: string
  name?: string
  meta?: Record<string, any>
  beforeEnter?: NavigationGuard
}

interface Route {
  path: string
  params: Record<string, string>
  query: Record<string, string>
  hash: string
  matched: RouteConfig[]
  meta: Record<string, any>
  name?: string
}

type Location = string | {
  path?: string
  name?: string
  params?: Record<string, any>
  query?: Record<string, any>
  hash?: string
}

type NavigationGuard = (
  to: Route,
  from: Route,
  next: NextFunction
) => void | Promise<void>

type NextFunction = (location?: false | Location) => void

type AfterNavigationHook = (to: Route, from: Route) => void
```

## 性能优化

### 路径匹配缓存

```typescript
class Router {
  private matchCache = new Map<string, Route>()

  private match(path: string): Route {
    if (this.matchCache.has(path)) {
      return this.matchCache.get(path)!
    }

    const route = this.doMatch(path)
    this.matchCache.set(path, route)
    return route
  }
}
```

### 正则表达式缓存

```typescript
const regexCache = new Map<string, RegExp>()

function pathToRegex(path: string): RegExp {
  if (regexCache.has(path)) {
    return regexCache.get(path)!
  }

  const regex = compilePathToRegex(path)
  regexCache.set(path, regex)
  return regex
}
```

## 设计权衡记录

### 1. 为什么用 route 而非 getCurrentRoute()？

**决策**：使用 getter `route` 替代方法 `getCurrentRoute()`

**理由**：
- 更简洁（`router.route` vs `router.getCurrentRoute()`）
- 语义更好（属性而非动作）
- 类似 Vue Router 3.x 的 `$route`

### 2. RouterView 如何正确卸载组件？

**决策**：RouterView 持有组件实例引用，路由变化时主动调用 unmount()

**理由**：
- 确保 onBeforeUnmount 被调用
- 清理事件监听器、定时器等
- 避免内存泄漏

### 3. 嵌套路由如何避免重复渲染？

**决策**：每个 RouterView 只管理自己深度的组件

**理由**：
- 只更新变化的层级
- 避免父组件重新渲染导致子组件也重新渲染
- 性能更好

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
