import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * Link 组件演示
 */
class LinkDemo extends Fukict {
  private currentTab = 'home';

  private setTab = (tab: string) => {
    this.currentTab = tab;
    this.update();
  };

  render() {
    return (
      <div class="space-y-4">
        <div class="flex gap-2">
          <button
            class={`px-4 py-2 rounded transition-colors ${
              this.currentTab === 'home'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => this.setTab('home')}
          >
            Home
          </button>
          <button
            class={`px-4 py-2 rounded transition-colors ${
              this.currentTab === 'about'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => this.setTab('about')}
          >
            About
          </button>
          <button
            class={`px-4 py-2 rounded transition-colors ${
              this.currentTab === 'contact'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            on:click={() => this.setTab('contact')}
          >
            Contact
          </button>
        </div>
        <div class="bg-gray-50 rounded p-3 text-sm text-gray-700">
          <p>
            <strong>当前标签:</strong> {this.currentTab}
          </p>
          <p class="text-xs text-gray-600 mt-2">
            点击按钮切换标签,激活的按钮会高亮显示
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 编程式导航演示
 */
class ProgrammaticNavDemo extends Fukict {
  private logs: string[] = [];

  private addLog = (message: string) => {
    this.logs.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
    if (this.logs.length > 5) {
      this.logs.pop();
    }
    this.update();
  };

  private simulateNavigation = (action: string, path: string) => {
    this.addLog(`${action}: ${path}`);
  };

  render() {
    return (
      <div class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <button
            class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            on:click={() => this.simulateNavigation('push', '/home')}
          >
            Go Home
          </button>
          <button
            class="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            on:click={() =>
              this.simulateNavigation('push', '/user/123?tab=profile')
            }
          >
            Go User
          </button>
          <button
            class="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            on:click={() => this.simulateNavigation('replace', '/new-page')}
          >
            Replace
          </button>
          <button
            class="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            on:click={() => this.simulateNavigation('back', 'previous')}
          >
            Back
          </button>
        </div>
        <div class="bg-gray-50 rounded p-3">
          <p class="text-sm font-medium text-gray-900 mb-2">导航日志:</p>
          <div class="space-y-1 text-xs text-gray-600 font-mono">
            {this.logs.length === 0 ? (
              <p class="text-gray-400">点击按钮查看导航日志...</p>
            ) : (
              this.logs.map(log => <p>{log}</p>)
            )}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * RouterView 说明演示
 */
class RouterViewDemo extends Fukict {
  render() {
    return (
      <div class="text-sm text-gray-700 space-y-3">
        <div class="bg-blue-50 border border-blue-200 rounded p-3">
          <p class="font-medium text-blue-900 mb-2">RouterView 作用:</p>
          <ul class="list-disc list-inside space-y-1 text-blue-800">
            <li>渲染匹配的路由组件</li>
            <li>嵌套路由必须传递 router</li>
            <li>自动订阅路由变化</li>
          </ul>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p class="font-medium text-yellow-900 mb-1">注意:</p>
          <p class="text-xs text-yellow-700">
            在嵌套路由的父组件中,必须包含 RouterView 并传递 router 实例
          </p>
        </div>
      </div>
    );
  }
}

/**
 * 导航组件页面
 */
export class NavigationPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* Link 组件 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">Link 组件</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              声明式导航,支持激活状态样式
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Link } from '@fukict/router';

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
            />
            <DemoBox fukict:slot="demo">
              <LinkDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* RouterView 组件 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              RouterView 组件
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              路由出口,渲染匹配的路由组件
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="使用说明">
            <CodeBlock
              fukict:slot="code"
              code={`import { RouterView, RouteComponent } from '@fukict/router';

// 嵌套路由时必须传递 router
export class ParentPage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Parent</h1>
        <RouterView router={this.router} />
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <RouterViewDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 编程式导航 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">编程式导航</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 router 实例进行编程式导航
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { RouteComponent } from '@fukict/router';

export class MyPage extends RouteComponent {
  private goToHome = () => {
    // 导航到首页
    this.push('/home');
  };

  private goToUser = () => {
    // 带参数导航
    this.push({
      path: '/user/123',
      query: { tab: 'profile' },
      hash: '#section1'
    });
  };

  private goBack = () => {
    // 返回上一页
    this.back();
  };

  private replaceRoute = () => {
    // 替换当前路由(不产生历史记录)
    this.replace('/new-page');
  };

  render() {
    return (
      <div>
        <button on:click={this.goToHome}>Go Home</button>
        <button on:click={this.goToUser}>Go User</button>
        <button on:click={this.goBack}>Back</button>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <ProgrammaticNavDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
