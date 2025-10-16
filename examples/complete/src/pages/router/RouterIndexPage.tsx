import { Link, RouteComponent, RouterView } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * Router 完整示例页面
 * 这是一个布局组件，包含导航和子路由出口
 */
export class RouterIndexPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 路由配置 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">路由配置</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              在 routes.ts 中配置嵌套路由和动态参数
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`// routes.ts
export const routes = [
  {
    path: '/router/demo',
    component: RouterIndexPage,
    redirect: '/router/demo/home',
    children: [
      {
        path: '/home',
        component: DemoHomePage,
      },
      {
        path: '/about',
        component: DemoAboutPage,
      },
      {
        path: '/user/:id',  // 动态参数
        component: DemoUserPage,
      },
      {
        path: '/dashboard',
        component: DemoDashboardLayout,
        redirect: '/router/demo/dashboard/overview',
        children: [  // 嵌套子路由
          {
            path: '/overview',
            component: DemoOverviewPage,
          },
          {
            path: '/stats',
            component: DemoStatsPage,
          },
          {
            path: '/settings',
            component: DemoSettingsPage,
          },
        ],
      },
    ],
  },
];`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p class="font-medium text-blue-900 mb-1">嵌套路由</p>
                  <p class="text-xs text-blue-700">
                    使用 children 定义子路由，实现多层页面结构
                  </p>
                </div>
                <div class="p-3 bg-green-50 border border-green-200 rounded">
                  <p class="font-medium text-green-900 mb-1">动态参数</p>
                  <p class="text-xs text-green-700">
                    使用 :id 定义动态路由参数，在组件中通过 this.route.params
                    访问
                  </p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p class="font-medium text-purple-900 mb-1">重定向</p>
                  <p class="text-xs text-purple-700">
                    使用 redirect 自动重定向到默认子路由
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 布局组件 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              布局组件 (Layout Component)
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 RouterView 创建包含导航的布局组件
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Link, RouteComponent, RouterView } from '@fukict/router';

export class RouterIndexPage extends RouteComponent {
  render() {
    return (
      <div>
        {/* 导航栏 */}
        <div>
          <Link
            to="/router/demo/home"
            activeClass="ring-2 ring-blue-800"
          >
            主页
          </Link>
          <Link
            to="/router/demo/about"
            activeClass="ring-2 ring-blue-800"
          >
            关于
          </Link>
          <Link
            to="/router/demo/user/123"
            activeClass="ring-2 ring-blue-800"
          >
            用户(123)
          </Link>
          <Link
            to="/router/demo/dashboard"
            activeClass="ring-2 ring-blue-800"
          >
            仪表板
          </Link>
        </div>

        {/* 当前路由信息 */}
        <div>
          <p>路径: {this.route.path}</p>
          <p>参数: {JSON.stringify(this.route.params)}</p>
          <p>查询: {JSON.stringify(this.route.query)}</p>
        </div>

        {/* 子路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-4">
                {/* 导航栏 */}
                <div class="space-y-2">
                  <h4 class="text-xs font-medium text-gray-700">导航:</h4>
                  <div class="flex gap-2 flex-wrap">
                    <Link
                      to="/router/demo/home"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      activeClass="ring-2 ring-blue-800"
                    >
                      主页
                    </Link>
                    <Link
                      to="/router/demo/about"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      activeClass="ring-2 ring-blue-800"
                    >
                      关于
                    </Link>
                    <Link
                      to="/router/demo/user/123"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      activeClass="ring-2 ring-blue-800"
                    >
                      用户(123)
                    </Link>
                    <Link
                      to="/router/demo/user/456"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      activeClass="ring-2 ring-blue-800"
                    >
                      用户(456)
                    </Link>
                    <Link
                      to="/router/demo/dashboard"
                      class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      activeClass="ring-2 ring-blue-800"
                    >
                      仪表板
                    </Link>
                  </div>
                </div>

                {/* 当前路由信息 */}
                <div class="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                  <h4 class="text-xs font-medium text-gray-700 mb-2">
                    路由信息:
                  </h4>
                  <div class="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>路径:</strong> {this.route.path}
                    </p>
                    <p>
                      <strong>参数:</strong> {JSON.stringify(this.route.params)}
                    </p>
                    <p>
                      <strong>查询:</strong> {JSON.stringify(this.route.query)}
                    </p>
                    {this.route.hash && (
                      <p>
                        <strong>Hash:</strong> {this.route.hash}
                      </p>
                    )}
                  </div>
                </div>

                {/* 子路由出口 */}
                <div class="min-h-[150px] p-3 bg-white border border-gray-200 rounded-lg">
                  <RouterView router={this.router} />
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 动态参数路由 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              动态参数路由
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              访问路由参数和查询字符串
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`import { RouteComponent } from '@fukict/router';

export class DemoUserPage extends RouteComponent {
  render() {
    // 获取路由参数
    const userId = this.route.params.id;

    // 获取查询参数
    const tab = this.route.query.tab;

    // 获取 hash
    const hash = this.route.hash;

    return (
      <div>
        <h4>用户页面</h4>
        <p>用户 ID: {userId}</p>
        <p>Tab: {tab}</p>
        <p>Hash: {hash}</p>

        {/* 编程式导航 */}
        <button on:click={() =>
          this.push('/router/demo/user/789?tab=profile#section-1')
        }>
          跳转到用户 789
        </button>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p class="font-medium text-blue-900 mb-1">
                    this.route.params
                  </p>
                  <p class="text-xs text-blue-700">
                    获取 URL 路径参数，如 /user/:id 中的 id
                  </p>
                </div>
                <div class="p-3 bg-green-50 border border-green-200 rounded">
                  <p class="font-medium text-green-900 mb-1">
                    this.route.query
                  </p>
                  <p class="text-xs text-green-700">
                    获取 URL 查询参数，如 ?tab=profile 中的 tab
                  </p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p class="font-medium text-purple-900 mb-1">
                    this.route.hash
                  </p>
                  <p class="text-xs text-purple-700">
                    获取 URL hash，如 #section-1
                  </p>
                </div>
                <div class="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p class="font-medium text-orange-900 mb-1">this.push()</p>
                  <p class="text-xs text-orange-700">
                    编程式导航，跳转到指定路由
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 嵌套路由 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">嵌套路由</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              在子路由中再次使用 RouterView 实现多层嵌套
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`import { Link, RouteComponent, RouterView } from '@fukict/router';

export class DemoDashboardLayout extends RouteComponent {
  render() {
    return (
      <div>
        {/* 仪表板导航 */}
        <div>
          <Link to="/router/demo/dashboard/overview">
            总览
          </Link>
          <Link to="/router/demo/dashboard/stats">
            统计
          </Link>
          <Link to="/router/demo/dashboard/settings">
            设置
          </Link>
        </div>

        {/* 嵌套的子路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p class="font-medium text-blue-900 mb-1">多层 RouterView</p>
                  <p class="text-xs text-blue-700">
                    父路由和子路由都可以使用 RouterView 创建嵌套结构
                  </p>
                </div>
                <div class="p-3 bg-green-50 border border-green-200 rounded">
                  <p class="font-medium text-green-900 mb-1">路由匹配</p>
                  <p class="text-xs text-green-700">
                    路由器自动匹配最深层的路由并渲染对应组件
                  </p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p class="font-medium text-purple-900 mb-1">共享布局</p>
                  <p class="text-xs text-purple-700">
                    父组件提供共享的导航、侧边栏等布局元素
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 关键概念 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">关键概念</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              理解 @fukict/router 的核心概念和使用模式
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-2">
                RouteComponent
              </h4>
              <ul class="text-xs text-blue-700 space-y-1">
                <li>• 继承 RouteComponent 访问路由信息</li>
                <li>• this.router 访问路由器实例</li>
                <li>• this.route 访问当前路由信息</li>
                <li>• this.push() 编程式导航</li>
              </ul>
            </div>

            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 class="text-sm font-medium text-green-900 mb-2">Link 组件</h4>
              <ul class="text-xs text-green-700 space-y-1">
                <li>• to 属性指定目标路由</li>
                <li>• activeClass 激活时的样式</li>
                <li>• 自动处理点击事件</li>
                <li>• 阻止页面刷新</li>
              </ul>
            </div>

            <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 class="text-sm font-medium text-purple-900 mb-2">
                RouterView
              </h4>
              <ul class="text-xs text-purple-700 space-y-1">
                <li>• 渲染匹配的路由组件</li>
                <li>• 必须传入 router 属性</li>
                <li>• 支持多层嵌套</li>
                <li>• 自动响应路由变化</li>
              </ul>
            </div>

            <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 class="text-sm font-medium text-orange-900 mb-2">最佳实践</h4>
              <ul class="text-xs text-orange-700 space-y-1">
                <li>• 使用 RouteComponent 作为页面基类</li>
                <li>• 布局组件包含 RouterView</li>
                <li>• Link 组件用于声明式导航</li>
                <li>• push() 用于编程式导航</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
