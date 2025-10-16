import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 总览子页面
 */
export class DemoOverviewPage extends RouteComponent {
  render() {
    return (
      <div class="p-3 bg-orange-50 border border-orange-300 rounded-lg ml-4">
        <h5 class="text-sm font-medium text-orange-900 mb-1">总览子页面</h5>
        <p class="text-xs text-orange-700 mb-2">这是仪表板的子路由</p>
        <div class="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-800">
          <p>当前路径: {this.route.path}</p>
          <p class="mt-1">这是一个嵌套路由的演示，层级: 父组件 → 子组件</p>
        </div>
      </div>
    );
  }
}
