import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 路由配置演示
 */
class RouteConfigDemo extends Fukict<{ currentPath: string }> {
  render() {
    return (
      <div class="space-y-3 text-sm text-gray-700">
        <div class="rounded border border-blue-200 bg-blue-50 p-3">
          <p class="mb-2 font-medium text-blue-900">当前路由信息:</p>
          <p>
            <strong>Path:</strong> {this.props.currentPath || '/router/config'}
          </p>
          <p>
            <strong>Type:</strong> 嵌套路由配置示例
          </p>
        </div>
        <p class="text-gray-600">
          本应用使用嵌套路由,主布局包含 Header 和 Footer, 中间通过 RouterView
          渲染子路由内容。
        </p>
      </div>
    );
  }
}

/**
 * 动态路由参数演示
 */
class DynamicRouteDemo extends Fukict {
  private userId = '123';
  private category = 'tech';
  private postId = '456';

  render() {
    return (
      <div class="space-y-3 text-sm text-gray-700">
        <div class="space-y-2">
          <p class="font-medium text-gray-900">示例路由参数:</p>
          <div class="space-y-1 rounded bg-gray-50 p-3">
            <p>
              <strong>User ID:</strong> {this.userId}
            </p>
            <p>
              <strong>Category:</strong> {this.category}
            </p>
            <p>
              <strong>Post ID:</strong> {this.postId}
            </p>
          </div>
        </div>
        <div class="rounded border border-yellow-200 bg-yellow-50 p-3 text-xs">
          <p class="mb-1 font-medium text-yellow-900">提示:</p>
          <p class="text-yellow-700">
            在组件中通过 this.route.params 访问动态参数
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 路由元信息演示
 */
class MetaDemo extends Fukict {
  render() {
    return (
      <div class="space-y-3 text-sm text-gray-700">
        <p class="font-medium text-gray-900">常见 meta 用途:</p>
        <div class="space-y-2">
          <div class="rounded bg-gray-50 p-3">
            <p class="mb-1 font-medium text-gray-900">页面标题</p>
            <code class="text-xs">meta: {'{ title: "管理后台" }'}</code>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <p class="mb-1 font-medium text-gray-900">权限控制</p>
            <code class="text-xs">meta: {'{ requiresAuth: true }'}</code>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <p class="mb-1 font-medium text-gray-900">角色限制</p>
            <code class="text-xs">meta: {'{ roles: ["admin"] }'}</code>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-600">
          可以在导航守卫中检查 meta 信息来实现权限控制
        </p>
      </div>
    );
  }
}

/**
 * 路由配置页面
 */
export class RouterConfigPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 基础配置 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">基础配置</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              定义路由规则,支持嵌套路由、重定向、路由守卫等功能
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { type RouteConfig } from '@fukict/router';

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
      },
    ],
  },
];`}
            />
            <DemoBox fukict:slot="demo">
              <RouteConfigDemo currentPath={this.route.path} />
            </DemoBox>
          </SplitView>
        </div>

        {/* 嵌套路由 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">嵌套路由</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              通过 children 配置嵌套路由
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="配置说明">
            <CodeBlock
              fukict:slot="code"
              code={`const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: DashboardPage,
    redirect: '/dashboard/overview',
    children: [
      {
        path: '/overview',
        component: OverviewPage,
      },
      {
        path: '/stats',
        component: StatsPage,
      },
    ],
  },
];

// DashboardPage 必须包含 <RouterView />
export class DashboardPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Dashboard</h1>
        <RouterView router={this.router} />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p class="font-medium text-gray-900">关键点:</p>
                <ul class="ml-2 list-inside list-disc space-y-1">
                  <li>父路由组件需要包含 RouterView</li>
                  <li>子路由路径会拼接到父路径后</li>
                  <li>redirect 可以设置默认子路由</li>
                  <li>支持多层嵌套</li>
                </ul>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 动态路由 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">动态路由</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 :param 语法定义动态参数
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const routes: RouteConfig[] = [
  {
    path: '/user/:id',
    component: UserPage,
  },
  {
    path: '/post/:category/:id',
    component: PostPage,
  },
];

// 在组件中访问参数
export class UserPage extends RouteComponent {
  render() {
    const userId = this.route.params.id;
    return <div>User ID: {userId}</div>;
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <DynamicRouteDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 路由元信息 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">路由元信息</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 meta 字段存储路由相关的额外信息
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="应用场景">
            <CodeBlock
              fukict:slot="code"
              code={`const routes: RouteConfig[] = [
  {
    path: '/admin',
    component: AdminPage,
    meta: {
      title: '管理后台',
      requiresAuth: true,
      roles: ['admin'],
    },
  },
];

// 在组件中访问 meta
export class AdminPage extends RouteComponent {
  render() {
    const title = this.route.meta?.title;
    return <h1>{title}</h1>;
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <MetaDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
