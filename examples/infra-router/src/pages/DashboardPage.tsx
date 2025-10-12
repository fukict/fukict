import type { VNode } from '@fukict/basic';
import { Link, RouteComponent, RouterView } from '@fukict/router';

/**
 * Dashboard 页面 - 展示嵌套路由
 */
export class DashboardPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-2 text-gray-600">
            Nested routing example with sub-pages
          </p>
        </div>

        <div class="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div class="col-span-1">
            <nav class="space-y-2">
              <Link
                to="/dashboard/overview"
                class="block px-4 py-2 rounded hover:bg-gray-100"
                exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
              >
                Overview
              </Link>
              <Link
                to="/dashboard/analytics"
                class="block px-4 py-2 rounded hover:bg-gray-100"
                exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
              >
                Analytics
              </Link>
              <Link
                to="/dashboard/settings"
                class="block px-4 py-2 rounded hover:bg-gray-100"
                exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* Content Area - Nested RouterView */}
          <div class="col-span-3 border rounded-lg p-6 bg-white">
            <RouterView router={this.router} />
          </div>
        </div>

        <div class="flex gap-4 pt-4 border-t">
          <button
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            on:click={() => this.back()}
          >
            Go Back
          </button>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            on:click={() => this.push('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
}
