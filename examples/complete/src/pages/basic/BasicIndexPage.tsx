import type { VNode } from '@fukict/basic';
import { Link, RouteComponent, RouterView } from '@fukict/router';

/**
 * Basic 模块首页
 * 包含嵌套路由,需要传递 router 给 RouterView
 */
export class BasicIndexPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            基础 (@fukict/basic)
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            Fukict 核心渲染引擎,提供组件、JSX、事件处理等基础功能
          </p>
        </div>

        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
