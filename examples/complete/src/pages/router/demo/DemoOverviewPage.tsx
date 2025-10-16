import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 总览子页面
 */
export class DemoOverviewPage extends RouteComponent {
  render() {
    return (
      <div class="ml-4 rounded-lg border border-orange-300 bg-orange-50 p-3">
        <h5 class="mb-1 text-sm font-medium text-orange-900">总览子页面</h5>
        <p class="mb-2 text-xs text-orange-700">这是仪表板的子路由</p>
        <div class="mt-2 rounded bg-orange-100 p-2 text-xs text-orange-800">
          <p>当前路径: {this.route.path}</p>
          <p class="mt-1">这是一个嵌套路由的演示，层级: 父组件 → 子组件</p>
        </div>
      </div>
    );
  }
}
