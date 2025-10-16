import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 主页
 */
export class DemoHomePage extends RouteComponent {
  render() {
    return (
      <div class="p-4 bg-green-50 border border-green-300 rounded-lg">
        <h4 class="text-sm font-medium text-green-900 mb-2">主页</h4>
        <p class="text-xs text-green-700">
          欢迎来到路由演示！点击上方链接切换页面。
        </p>
        <div class="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
          <p>当前路径: {this.route.path}</p>
        </div>
      </div>
    );
  }
}
