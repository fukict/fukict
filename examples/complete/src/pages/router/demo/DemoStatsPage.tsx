import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 统计子页面
 */
export class DemoStatsPage extends RouteComponent {
  render() {
    return (
      <div class="ml-4 rounded-lg border border-orange-300 bg-orange-50 p-3">
        <h5 class="mb-1 text-sm font-medium text-orange-900">统计子页面</h5>
        <p class="mb-2 text-xs text-orange-700">展示嵌套路由的另一个示例</p>
        <div class="mt-2 space-y-2">
          <div class="rounded bg-orange-100 p-2 text-xs text-orange-800">
            <p>当前路径: {this.route.path}</p>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded bg-white p-2 text-center">
              <p class="text-lg font-bold text-orange-900">1,234</p>
              <p class="text-xs text-orange-700">访问量</p>
            </div>
            <div class="rounded bg-white p-2 text-center">
              <p class="text-lg font-bold text-orange-900">567</p>
              <p class="text-xs text-orange-700">用户数</p>
            </div>
            <div class="rounded bg-white p-2 text-center">
              <p class="text-lg font-bold text-orange-900">89%</p>
              <p class="text-xs text-orange-700">活跃率</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
