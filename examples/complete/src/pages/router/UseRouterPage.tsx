import { Fukict } from '@fukict/basic';
import { RouteComponent, useRoute, useRouter } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 普通子组件 - 使用 useRouter 获取路由上下文
 *
 * 这不是 RouteComponent，而是一个普通的 Fukict 组件，
 * 通过 useRouter/useRoute 访问最近的路由上下文。
 */
class RouteInfoWidget extends Fukict {
  render() {
    const route = useRoute(this);
    return (
      <div class="rounded border border-blue-200 bg-blue-50 p-3">
        <p class="mb-2 text-xs font-medium text-blue-900">
          RouteInfoWidget (普通 Fukict 组件)
        </p>
        <div class="space-y-1 text-xs text-blue-700">
          <p>
            <strong>路径:</strong> {route.path}
          </p>
          <p>
            <strong>参数:</strong> {JSON.stringify(route.params)}
          </p>
          <p>
            <strong>查询:</strong> {JSON.stringify(route.query)}
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 普通子组件 - 使用 useRouter 进行编程式导航
 */
class NavButton extends Fukict<{ to: string; label: string }> {
  private handleClick = () => {
    const router = useRouter(this);
    router.push(this.props.to);
  };

  render() {
    return (
      <button
        class="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
        on:click={this.handleClick}
      >
        {this.props.label}
      </button>
    );
  }
}

/**
 * useRouter / useRoute 示例页面
 */
export class UseRouterPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 问题说明 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              子组件路由访问
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              非 RouteComponent 的普通子组件如何访问路由上下文
            </p>
          </div>

          <SplitView leftTitle="问题" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`// RouteComponent 可以直接使用 this.router / this.route
class MyPage extends RouteComponent {
  render() {
    return <div>{this.route.path}</div>;
  }
}

// 但普通子组件无法访问路由:
class ChildWidget extends Fukict {
  render() {
    // this.router ❌ 不存在
    // this.route  ❌ 不存在
    return <div>如何获取路由信息？</div>;
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="rounded border border-yellow-200 bg-yellow-50 p-3">
                  <p class="mb-1 font-medium text-yellow-900">场景</p>
                  <p class="text-xs text-yellow-700">
                    普通子组件（如按钮、面包屑、信息面板）需要读取路由信息或执行导航，但不适合继承
                    RouteComponent
                  </p>
                </div>
                <div class="rounded border border-red-200 bg-red-50 p-3">
                  <p class="mb-1 font-medium text-red-900">不理想的方案</p>
                  <ul class="list-inside list-disc space-y-1 text-xs text-red-700">
                    <li>手动 props 传递（prop drilling）</li>
                    <li>Router.getInstance()（不支持嵌套路由）</li>
                  </ul>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* useRouter / useRoute */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              useRouter / useRoute
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              通过组件树向上查找最近的 RouteComponent，获取其路由上下文
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';
import { useRouter, useRoute } from '@fukict/router';

// 读取路由信息
class RouteInfoWidget extends Fukict {
  render() {
    const route = useRoute(this);
    return (
      <div>
        <p>路径: {route.path}</p>
        <p>参数: {JSON.stringify(route.params)}</p>
      </div>
    );
  }
}

// 编程式导航
class NavButton extends Fukict<{ to: string; label: string }> {
  private handleClick = () => {
    const router = useRouter(this);
    router.push(this.props.to);
  };

  render() {
    return (
      <button on:click={this.handleClick}>
        {this.props.label}
      </button>
    );
  }
}

// 在 RouteComponent 的 render 中使用
class MyPage extends RouteComponent {
  render() {
    return (
      <div>
        <RouteInfoWidget />
        <NavButton to="/home" label="回首页" />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3">
                <RouteInfoWidget />
                <div class="flex gap-2">
                  <NavButton to="/router/use-router" label="当前页" />
                  <NavButton to="/router/config" label="路由配置" />
                  <NavButton to="/router/navigation" label="导航组件" />
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 查找机制 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">查找机制</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              useRouter 的内部工作原理
            </p>
          </div>

          <SplitView leftTitle="查找顺序" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`// useRouter(component) 查找顺序:
//
// 1. 遍历 component._parent 链
//    查找最近的 RouteComponent 祖先
//    → 返回其 router 实例
//
// 2. 回退到 Router.getInstance()
//    → 返回全局单例
//
// 3. 都找不到 → 抛出错误
//
// 组件树示例:
// RouterView
//   └─ MyPage (RouteComponent) ← useRouter 找到这里
//       └─ Header (Fukict)
//           └─ NavButton (Fukict) ← useRouter(this)
//               _parent → Header
//               _parent → MyPage ✅ instanceof RouteComponent`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="rounded border border-blue-200 bg-blue-50 p-3">
                  <p class="mb-1 font-medium text-blue-900">
                    1. _parent 链查找
                  </p>
                  <p class="text-xs text-blue-700">
                    沿着 _parent 链向上遍历，找到最近的 RouteComponent
                    祖先，返回其 router
                  </p>
                </div>
                <div class="rounded border border-green-200 bg-green-50 p-3">
                  <p class="mb-1 font-medium text-green-900">2. 全局单例回退</p>
                  <p class="text-xs text-green-700">
                    如果 _parent 链中没有 RouteComponent，回退到
                    Router.getInstance() 全局单例
                  </p>
                </div>
                <div class="rounded border border-purple-200 bg-purple-50 p-3">
                  <p class="mb-1 font-medium text-purple-900">
                    3. 嵌套路由支持
                  </p>
                  <p class="text-xs text-purple-700">
                    在嵌套路由中，总是获取最近的 router，而非顶层单例
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* API 参考 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">API 参考</h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-blue-900">
                useRouter(component)
              </h4>
              <ul class="space-y-1 text-xs text-blue-700">
                <li>
                  <strong>参数:</strong> Fukict 组件实例 (this)
                </li>
                <li>
                  <strong>返回:</strong> Router 实例
                </li>
                <li>
                  <strong>用途:</strong> 编程式导航 (push / replace / back)
                </li>
                <li>
                  <strong>异常:</strong> 找不到 Router 时抛出错误
                </li>
              </ul>
            </div>
            <div class="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-green-900">
                useRoute(component)
              </h4>
              <ul class="space-y-1 text-xs text-green-700">
                <li>
                  <strong>参数:</strong> Fukict 组件实例 (this)
                </li>
                <li>
                  <strong>返回:</strong> Route 对象 (path, params, query, ...)
                </li>
                <li>
                  <strong>用途:</strong> 读取当前路由信息
                </li>
                <li>
                  <strong>等价于:</strong> useRouter(this).currentRoute
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
