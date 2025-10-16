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
    // ✅ meta 自动有类型，无需导入或类型断言
    // global.d.ts 中的类型扩展会自动生效
    const { title, description } = this.route.meta;

    return (
      <div class="flex h-screen bg-gray-200">
        {/* 侧边栏 */}
        <Sidebar router={this.router} />

        {/* 主内容区域 */}
        <main class="flex-1 overflow-y-auto">
          <div class="mx-auto max-w-[1800px] px-12 py-10">
            {/* 页面头部 */}
            {title ? (
              <PageHeader title={title} description={description} />
            ) : null}

            {/* 嵌套路由出口 */}
            <RouterView router={this.router} />
          </div>
        </main>
      </div>
    );
  }
}
