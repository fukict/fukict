import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
        title="01. 基础路由"
        description="Router 基本配置和使用 - 本应用本身就是完整的路由示例"
      >
        <DemoCard title="💡 运行效果">
          <p class="text-gray-600 mb-4">
            <strong>你正在使用 @fukict/router！</strong>
          </p>
          <p class="text-gray-600 mb-2">
            本 Demo 应用就是一个完整的路由应用示例：
          </p>
          <ul class="list-disc list-inside text-gray-600 space-y-1 text-sm">
            <li>左侧边栏通过 RouterLink 组件切换路由</li>
            <li>主内容区使用 RouterView 渲染当前路由组件</li>
            <li>所有示例页面都是 RouteWidget 类组件</li>
            <li>使用 Hash 模式管理路由（查看浏览器地址栏）</li>
          </ul>
        </DemoCard>

        <CodeBlock
          title="📝 路由配置示例 (main.tsx)"
          code={`import { createRouter } from '@fukict/router';
import { Home } from './pages/Home';

// 定义路由配置
const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/runtime/hello-world',
    component: HelloWorldExample,
  },
  // ... 更多路由
];

// 创建路由实例
const router = createRouter({
  routes,
  mode: 'hash', // 或 'history'
});

// 启动路由
router.start();`}
        />

        <CodeBlock
          title="📝 应用布局 (App.tsx)"
          code={`import { Widget } from '@fukict/widget';
import { RouterView } from '@fukict/router';
import { Sidebar } from './layouts/Sidebar';

export class App extends Widget<{ router: Router }> {
  render() {
    return (
      <div class="flex">
        <Sidebar router={this.props.router} />
        <main class="flex-1">
          {/* RouterView 自动渲染当前路由组件 */}
          <RouterView router={this.props.router} />
        </main>
      </div>
    );
  }
}`}
        />

        <CodeBlock
          title="📝 路由组件 (RouteWidget)"
          code={`import { RouteWidget } from '@fukict/router';

// 所有路由页面都必须继承 RouteWidget
export default class MyPage extends RouteWidget {
  render() {
    // 可以通过 this.route 访问路由信息
    const { path, params, query } = this.route;

    return (
      <div>
        <h1>当前路径: {path}</h1>
      </div>
    );
  }
}`}
        />
      </ExampleLayout>
    );
  }
}
