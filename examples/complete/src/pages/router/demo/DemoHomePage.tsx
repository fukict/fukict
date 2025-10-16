import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 主页
 */
export class DemoHomePage extends RouteComponent {
  render() {
    return (
      <div class="rounded-lg border border-green-300 bg-green-50 p-4">
        <h4 class="mb-2 text-sm font-medium text-green-900">主页</h4>
        <p class="text-xs text-green-700">
          欢迎来到路由演示！点击上方链接切换页面。
        </p>
        <div class="mt-3 rounded bg-green-100 p-2 text-xs text-green-800">
          <p>当前路径: {this.route.path}</p>
        </div>
      </div>
    );
  }
}
