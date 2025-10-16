import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 用户页面（动态参数）
 */
export class DemoUserPage extends RouteComponent {
  render() {
    const userId = this.route.params.id || 'unknown';

    return (
      <div class="p-4 bg-purple-50 border border-purple-300 rounded-lg">
        <h4 class="text-sm font-medium text-purple-900 mb-2">用户页面</h4>
        <p class="text-xs text-purple-700 mb-2">这演示了动态路由参数的使用</p>
        <div class="mt-3 space-y-2">
          <div class="p-2 bg-purple-100 rounded text-xs text-purple-800">
            <p>
              <strong>用户 ID:</strong> {userId}
            </p>
            <p>
              <strong>当前路径:</strong> {this.route.path}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              on:click={() => this.push('/router/demo/user/123')}
              class="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              切换到用户 123
            </button>
            <button
              on:click={() => this.push('/router/demo/user/456')}
              class="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              切换到用户 456
            </button>
          </div>
        </div>
      </div>
    );
  }
}
