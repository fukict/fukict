import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 用户页面（动态参数）
 */
export class DemoUserPage extends RouteComponent {
  render() {
    const userId = this.route.params.id || 'unknown';

    return (
      <div class="rounded-lg border border-purple-300 bg-purple-50 p-4">
        <h4 class="mb-2 text-sm font-medium text-purple-900">用户页面</h4>
        <p class="mb-2 text-xs text-purple-700">这演示了动态路由参数的使用</p>
        <div class="mt-3 space-y-2">
          <div class="rounded bg-purple-100 p-2 text-xs text-purple-800">
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
              class="rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700"
            >
              切换到用户 123
            </button>
            <button
              on:click={() => this.push('/router/demo/user/456')}
              class="rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700"
            >
              切换到用户 456
            </button>
          </div>
        </div>
      </div>
    );
  }
}
