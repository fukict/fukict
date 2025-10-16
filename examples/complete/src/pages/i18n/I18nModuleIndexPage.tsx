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
        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
