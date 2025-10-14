import { RouteComponent } from '@fukict/router';

/**
 * Router 模块页面
 * 单页面,不需要嵌套路由
 */
export class RouterIndexPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            路由 (@fukict/router)
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            SPA 路由系统,支持嵌套路由、导航守卫、History/Hash 模式
          </p>
        </div>

        {/* 路由配置 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">路由配置</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            定义路由规则,支持嵌套路由、重定向、路由守卫等功能
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { type RouteConfig } from '@fukict/router';

export const routes: RouteConfig[] = [
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
        path: '/user/:id',
        component: UserPage,
        meta: { title: 'User' },
        beforeEnter: (to, from, next) => {
          // 路由守卫
          console.log('Entering user page');
          next();
        },
      },
      {
        path: '/dashboard',
        component: DashboardPage,
        redirect: '/dashboard/overview',
        children: [
          {
            path: '/overview',
            component: OverviewPage,
          },
        ],
      },
    ],
  },
];`}
            </pre>
          </div>
        </div>

        {/* 导航组件 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">导航组件</h2>

          {/* Link */}
          <div class="space-y-2">
            <h3 class="text-base font-medium text-gray-800">Link 组件</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              声明式导航,支持激活状态样式
            </p>
            <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
              <pre class="text-xs text-gray-700 leading-relaxed">
                {`import { Link } from '@fukict/router';

<Link
  to="/home"
  class="nav-link"
  activeClass="active"
  exactActiveClass="exact-active"
>
  Home
</Link>

// activeClass: 路径匹配时应用(前缀匹配)
// exactActiveClass: 路径完全匹配时应用`}
              </pre>
            </div>
          </div>

          {/* RouterView */}
          <div class="space-y-2">
            <h3 class="text-base font-medium text-gray-800">RouterView 组件</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              路由出口,渲染匹配的路由组件。嵌套路由时必须传递 router!
            </p>
            <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
              <pre class="text-xs text-gray-700 leading-relaxed">
                {`import { RouterView, RouteComponent } from '@fukict/router';

// ❌ 错误 - 嵌套路由时不传递 router
export class ParentPage extends RouteComponent {
  render() {
    return <RouterView />;  // 错误!
  }
}

// ✅ 正确 - 必须传递 this.router
export class ParentPage extends RouteComponent {
  render() {
    return <RouterView router={this.router} />;
  }
}`}
              </pre>
            </div>
          </div>

          {/* RouterProvider */}
          <div class="space-y-2">
            <h3 class="text-base font-medium text-gray-800">
              RouterProvider 组件
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              应用入口,初始化路由系统
            </p>
            <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
              <pre class="text-xs text-gray-700 leading-relaxed">
                {`import { RouterProvider } from '@fukict/router';

<RouterProvider
  mode="history"  // 或 "hash"
  routes={routes}
  beforeEach={(to, from, next) => {
    // 全局前置守卫
    console.log('Navigation:', from.path, '->', to.path);
    next();
  }}
  afterEach={(to, from) => {
    // 全局后置守卫
    document.title = to.meta?.title || 'App';
  }}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* RouteComponent */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">RouteComponent</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            路由组件基类,提供路由上下文和工具方法
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { RouteComponent } from '@fukict/router';

export class MyPage extends RouteComponent {
  render() {
    // 访问路由信息
    const path = this.route.path;
    const params = this.route.params;      // { id: '123' }
    const query = this.route.query;        // { page: '1' }
    const meta = this.route.meta;

    // 编程式导航
    const goToHome = () => this.push('/home');
    const goBack = () => this.back();

    return (
      <div>
        <p>Current Path: {path}</p>
        <p>User ID: {params.id}</p>
        <button on:click={goToHome}>Go Home</button>
        <button on:click={goBack}>Back</button>
      </div>
    );
  }
}`}
            </pre>
          </div>
        </div>

        {/* 当前路由信息 */}
        <div class="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
          <h3 class="text-base font-medium text-gray-800 mb-2">当前路由信息</h3>
          <div class="space-y-1 text-sm text-gray-600">
            <p>
              <strong class="text-gray-800">路径:</strong> {this.route.path}
            </p>
            <p>
              <strong class="text-gray-800">参数:</strong>{' '}
              {JSON.stringify(this.route.params)}
            </p>
            <p>
              <strong class="text-gray-800">查询:</strong>{' '}
              {JSON.stringify(this.route.query)}
            </p>
            <p>
              <strong class="text-gray-800">Hash:</strong>{' '}
              {this.route.hash || '(无)'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
