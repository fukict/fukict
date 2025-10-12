# Fukict Router Example

这是一个完整的 Fukict Router 示例，展示了路由系统的所有核心功能。

## 功能展示

### 1. 基础路由导航
- **Home 页面** (`/`) - 首页，包含功能概览
- **About 页面** (`/about`) - 关于页面，展示路由信息

### 2. 动态路由参数
- **User 页面** (`/user/:id`) - 用户资料页
  - 支持动态路由参数（如 `/user/123`）
  - 实现了 `routeParamsChanged` 钩子监听参数变化
  - 可以在同一组件内切换不同用户 ID

### 3. 查询参数
- **Search 页面** (`/search`) - 搜索页面
  - 支持查询参数（如 `/search?q=fukict&page=1`）
  - 实现了 `routeQueryChanged` 钩子监听查询参数变化
  - 使用 `updateQuery()` 方法更新查询参数

### 4. 嵌套路由
- **Dashboard 页面** (`/dashboard`) - 仪表板主页
  - **Overview** (`/dashboard/overview`) - 概览子页面
  - **Analytics** (`/dashboard/analytics`) - 分析子页面
  - **Settings** (`/dashboard/settings`) - 设置子页面
  - 使用嵌套 `RouterView` 组件渲染子路由

### 5. 导航守卫
- **全局前置守卫** (`beforeEach`) - 记录导航日志，更新页面标题
- **全局后置钩子** (`afterEach`) - 导航完成后的回调
- **路由级守卫** (`beforeEnter`) - User 页面的路由守卫示例

### 6. 路由组件
- **Link 组件** - 声明式导航链接
  - 自动激活状态（`activeClass`、`exactActiveClass`）
  - 支持 `replace` 模式
- **RouteComponent 基类** - 路由组件的便捷基类
  - 提供 `router`、`route`、`params`、`query` 等便捷访问
  - 提供 `push()`、`replace()`、`back()`、`forward()` 等导航方法

### 7. 404 处理
- **NotFound 页面** - 处理未匹配的路由

## 技术栈

- **@fukict/basic** - 核心渲染引擎
- **@fukict/router** - 路由管理
- **Vite** - 开发服务器和构建工具
- **Tailwind CSS** - 样式框架

## 运行示例

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 项目结构

```
infra-router/
├── src/
│   ├── pages/              # 路由页面组件
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── UserPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DashboardOverviewPage.tsx
│   │   ├── DashboardAnalyticsPage.tsx
│   │   ├── DashboardSettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 路由配置示例

```typescript
const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    meta: { title: 'Home' },
  },
  {
    path: '/user/:id',
    component: UserPage,
    meta: { title: 'User Profile' },
    beforeEnter: (to, from, next) => {
      console.log('Entering user page:', to.params.id);
      next();
    },
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    meta: { title: 'Dashboard' },
    children: [
      {
        path: '/dashboard/overview',
        component: DashboardOverviewPage,
        meta: { title: 'Dashboard - Overview' },
      },
    ],
  },
  {
    path: '*',
    component: NotFoundPage,
    meta: { title: '404 Not Found' },
  },
];
```

## 核心 API 示例

### 创建 Router 实例

```typescript
const router = new Router({
  mode: 'hash',  // 或 'history'
  routes,
  beforeEach: (to, from, next) => {
    // 全局前置守卫
    console.log('Navigating:', from.path, '->', to.path);
    next();
  },
  afterEach: (to, from) => {
    // 全局后置钩子
    console.log('Navigation complete');
  },
});
```

### 使用 RouteComponent 基类

```typescript
export class UserPage extends RouteComponent {
  // 访问路由参数
  render() {
    const { id } = this.params;
    const { page } = this.query;

    return (
      <div>
        <h1>User {id}</h1>
        <button on:click={() => this.push('/home')}>
          Go Home
        </button>
      </div>
    );
  }

  // 监听参数变化
  routeParamsChanged(newParams, oldParams) {
    console.log('Params changed:', oldParams, '->', newParams);
  }

  // 监听查询参数变化
  routeQueryChanged(newQuery, oldQuery) {
    console.log('Query changed:', oldQuery, '->', newQuery);
  }
}
```

### 使用 Link 组件

```typescript
<Link to="/" activeClass="active" exactActiveClass="exact-active">
  <span>Home</span>
</Link>

<Link to={{ path: '/user/123', query: { page: '1' } }} replace>
  <span>User Profile</span>
</Link>
```

### 嵌套路由

```typescript
// 父组件
export class DashboardPage extends RouteComponent {
  render() {
    return (
      <div>
        <nav>...</nav>
        {/* 渲染子路由 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
```

## 学习要点

1. **声明式 vs 编程式导航**
   - 使用 `<Link>` 组件进行声明式导航
   - 使用 `push()`、`replace()` 等方法进行编程式导航

2. **路由参数 vs 查询参数**
   - 路由参数 (`/user/:id`) - 路径的一部分，通过 `this.params` 访问
   - 查询参数 (`/search?q=...`) - URL 查询字符串，通过 `this.query` 访问

3. **嵌套路由的层级关系**
   - 父路由组件中使用 `<RouterView>` 渲染子路由
   - 子路由继承父路由的 Router 实例

4. **导航守卫的执行顺序**
   - 全局 `beforeEach` → 路由级 `beforeEnter` → 组件挂载
   - 导航完成后执行 `afterEach`

5. **组件更新 vs 组件替换**
   - 同一组件类，不同参数 → 调用 `update()` 方法
   - 不同组件类 → 销毁旧组件，创建新组件

## 浏览器访问

启动开发服务器后，在浏览器中访问：
- http://localhost:5173/

由于使用 hash 模式，URL 格式为：
- http://localhost:5173/#/
- http://localhost:5173/#/about
- http://localhost:5173/#/user/123
- http://localhost:5173/#/search?q=fukict
- http://localhost:5173/#/dashboard/overview
