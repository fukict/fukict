import type { VNode } from '@fukict/basic';
import { RouteComponent, RouterView } from '@fukict/router';

import { PageHeader } from '../components/PageHeader';
import { Sidebar } from '../components/Sidebar';

/**
 * Layout 页面
 * 包含侧边栏和主内容区域
 */
export class LayoutPage extends RouteComponent {
  render(): VNode {
    // 从当前路由的 meta 获取标题和描述
    const { title, description } = this.route.meta || {};

    return (
      <div class="flex h-screen bg-gray-200">
        {/* 侧边栏 */}
        <Sidebar router={this.router} />

        {/* 主内容区域 */}
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-[1800px] mx-auto px-12 py-10">
            {/* 页面头部 */}
            {title && <PageHeader title={title} description={description} />}

            {/* 嵌套路由出口 */}
            <RouterView router={this.router} />
          </div>
        </main>
      </div>
    );
  }
}
