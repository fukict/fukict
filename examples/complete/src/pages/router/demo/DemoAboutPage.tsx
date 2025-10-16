import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 关于页面
 */
export class DemoAboutPage extends RouteComponent {
  render() {
    return (
      <div class="p-4 bg-blue-50 border border-blue-300 rounded-lg">
        <h4 class="text-sm font-medium text-blue-900 mb-2">关于页面</h4>
        <p class="text-xs text-blue-700 mb-2">
          这是一个嵌套路由演示，展示了路由系统的基本功能。
        </p>
        <div class="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
          <p>当前路径: {this.route.path}</p>
        </div>
      </div>
    );
  }
}
