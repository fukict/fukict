import type { VNode } from '@fukict/basic';
import { RouteComponent, RouterView } from '@fukict/router';

/**
 * Basic 模块首页
 * 包含嵌套路由,需要传递 router 给 RouterView
 */
export class BasicIndexPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-8">
        {/* 嵌套路由出口 */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
