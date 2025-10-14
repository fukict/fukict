import type { VNode } from '@fukict/basic';
import { RouteComponent, RouterView } from '@fukict/router';

/**
 * I18n 模块首页
 * 包含嵌套路由
 */
export class I18nModuleIndexPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            国际化 (@fukict/i18n)
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            类型安全的国际化库,支持多语言、参数插值、语言切换等功能
          </p>
        </div>

        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
