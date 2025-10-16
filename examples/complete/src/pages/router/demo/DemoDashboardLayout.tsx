import { Link, RouteComponent, RouterView } from '@fukict/router';

/**
 * 路由演示 - 仪表板布局（嵌套路由父组件）
 */
export class DemoDashboardLayout extends RouteComponent {
  render() {
    return (
      <div class="space-y-3">
        <div class="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <h4 class="text-sm font-medium text-yellow-900 mb-2">仪表板布局</h4>
          <p class="text-xs text-yellow-700 mb-2">
            这是一个嵌套路由父组件，下方是子路由出口
          </p>
          <div class="flex gap-2 mt-2">
            <Link
              to="/router/demo/dashboard/overview"
              class="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
              activeClass="ring-2 ring-yellow-800"
            >
              总览
            </Link>
            <Link
              to="/router/demo/dashboard/stats"
              class="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
              activeClass="ring-2 ring-yellow-800"
            >
              统计
            </Link>
            <Link
              to="/router/demo/dashboard/settings"
              class="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
              activeClass="ring-2 ring-yellow-800"
            >
              设置
            </Link>
          </div>
        </div>

        {/* 子路由出口 - 必须传递 router */}
        <RouterView router={this.router} />
      </div>
    );
  }
}
