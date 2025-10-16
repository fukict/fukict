import { RouteComponent } from '@fukict/router';

/**
 * 路由演示 - 设置子页面
 */
export class DemoSettingsPage extends RouteComponent {
  render() {
    return (
      <div class="ml-4 rounded-lg border border-orange-300 bg-orange-50 p-3">
        <h5 class="mb-1 text-sm font-medium text-orange-900">设置子页面</h5>
        <p class="mb-2 text-xs text-orange-700">展示路由参数和查询字符串</p>
        <div class="mt-2 space-y-2">
          <div class="rounded bg-orange-100 p-2 text-xs text-orange-800">
            <p>
              <strong>当前路径:</strong> {this.route.path}
            </p>
            <p>
              <strong>查询参数:</strong> {JSON.stringify(this.route.query)}
            </p>
            <p>
              <strong>Hash:</strong> {this.route.hash || '(无)'}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              on:click={() =>
                this.push('/router/demo/dashboard/settings?tab=profile')
              }
              class="rounded bg-orange-600 px-2 py-1 text-xs text-white hover:bg-orange-700"
            >
              添加查询参数
            </button>
            <button
              on:click={() =>
                this.push('/router/demo/dashboard/settings#section-1')
              }
              class="rounded bg-orange-600 px-2 py-1 text-xs text-white hover:bg-orange-700"
            >
              添加 Hash
            </button>
          </div>
        </div>
      </div>
    );
  }
}
