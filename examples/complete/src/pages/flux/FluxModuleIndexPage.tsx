import type { VNode } from '@fukict/basic';
import { RouteComponent, RouterView } from '@fukict/router';

/**
 * Flux 模块首页
 * 包含嵌套路由
 */
export class FluxModuleIndexPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            状态管理 (@fukict/flux)
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            轻量级状态管理库,提供 Store、Actions、Getters 等功能
          </p>
        </div>

        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
