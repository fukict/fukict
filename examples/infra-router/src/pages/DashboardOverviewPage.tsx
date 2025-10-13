import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * Dashboard Overview 子页面
 */
export class DashboardOverviewPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Overview</h2>
        <p class="text-gray-600">
          Dashboard overview with key metrics and statistics.
        </p>

        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-blue-900">Total Users</h3>
            <p class="text-3xl font-bold text-blue-600 mt-2">1,234</p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <h3 class="font-semibold text-green-900">Active Sessions</h3>
            <p class="text-3xl font-bold text-green-600 mt-2">567</p>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <h3 class="font-semibold text-purple-900">Total Revenue</h3>
            <p class="text-3xl font-bold text-purple-600 mt-2">$89,012</p>
          </div>
          <div class="p-4 bg-orange-50 rounded-lg">
            <h3 class="font-semibold text-orange-900">Conversion Rate</h3>
            <p class="text-3xl font-bold text-orange-600 mt-2">3.4%</p>
          </div>
        </div>
      </div>
    );
  }
}
