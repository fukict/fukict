import { Widget } from '@fukict/widget';
import type { Router } from '@fukict/router';
import { RouterView } from '@fukict/router';
import { Sidebar } from './layouts/Sidebar';

interface AppProps {
  router: Router;
}

/**
 * App 根组件
 * 提供应用整体布局结构，由 Router 驱动内容切换
 */
export class App extends Widget<AppProps> {
  render() {
    const { router } = this.props;

    return (
      <div class="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Sidebar */}
        <Sidebar router={router} />

        {/* Main Content - Router 管理的内容区域 */}
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-6xl mx-auto px-8 py-6">
            <RouterView router={router} />
          </div>
        </main>
      </div>
    );
  }
}
