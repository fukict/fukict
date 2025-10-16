import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 统计子页面
 */
export class DemoStatsPage extends RouteComponent {
  render() {
    return (
      <div class="p-3 bg-orange-50 border border-orange-300 rounded-lg ml-4">
        <h5 class="text-sm font-medium text-orange-900 mb-1">统计子页面</h5>
        <p class="text-xs text-orange-700 mb-2">展示嵌套路由的另一个示例</p>
        <div class="mt-2 space-y-2">
          <div class="p-2 bg-orange-100 rounded text-xs text-orange-800">
            <p>当前路径: {this.route.path}</p>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="p-2 bg-white rounded text-center">
              <p class="text-lg font-bold text-orange-900">1,234</p>
              <p class="text-xs text-orange-700">访问量</p>
            </div>
            <div class="p-2 bg-white rounded text-center">
              <p class="text-lg font-bold text-orange-900">567</p>
              <p class="text-xs text-orange-700">用户数</p>
            </div>
            <div class="p-2 bg-white rounded text-center">
              <p class="text-lg font-bold text-orange-900">89%</p>
              <p class="text-xs text-orange-700">活跃率</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
