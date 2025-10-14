import type { VNode } from '@fukict/basic';
import { RouteComponent, RouterView } from '@fukict/router';

/**
 * 开始模块首页
 * 包含嵌套路由
 */
export class GettingStartedIndexPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">开始</h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            快速了解 Fukict 框架的安装、配置和基础使用
          </p>
        </div>

        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
