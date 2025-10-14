import type { VNode } from '@fukict/basic';
import { RouteComponent, RouterView } from '@fukict/router';

/**
 * Router 模块首页
 * 包含嵌套路由
 */
export class RouterModuleIndexPage extends RouteComponent {
  render(): VNode {
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

        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
