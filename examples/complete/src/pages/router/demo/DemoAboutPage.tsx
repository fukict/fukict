import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 关于页面
 */
export class DemoAboutPage extends RouteComponent {
  render() {
    return (
      <div class="rounded-lg border border-blue-300 bg-blue-50 p-4">
        <h4 class="mb-2 text-sm font-medium text-blue-900">关于页面</h4>
        <p class="mb-2 text-xs text-blue-700">
          这是一个嵌套路由演示，展示了路由系统的基本功能。
        </p>
        <div class="mt-3 rounded bg-blue-100 p-2 text-xs text-blue-800">
          <p>当前路径: {this.route.path}</p>
        </div>
      </div>
    );
  }
}
