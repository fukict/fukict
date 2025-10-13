import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * Dashboard Analytics 子页面
 */
export class DashboardAnalyticsPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Analytics</h2>
        <p class="text-gray-600">Detailed analytics and performance metrics.</p>

        <div class="space-y-4 mt-6">
          <div class="border-l-4 border-blue-500 pl-4">
            <h3 class="font-semibold">Page Views</h3>
            <p class="text-2xl font-bold text-gray-800">45,678</p>
            <p class="text-sm text-gray-500">+12.5% from last month</p>
          </div>

          <div class="border-l-4 border-green-500 pl-4">
            <h3 class="font-semibold">Unique Visitors</h3>
            <p class="text-2xl font-bold text-gray-800">23,456</p>
            <p class="text-sm text-gray-500">+8.3% from last month</p>
          </div>

          <div class="border-l-4 border-purple-500 pl-4">
            <h3 class="font-semibold">Bounce Rate</h3>
            <p class="text-2xl font-bold text-gray-800">38.2%</p>
            <p class="text-sm text-gray-500">-2.1% from last month</p>
          </div>

          <div class="border-l-4 border-orange-500 pl-4">
            <h3 class="font-semibold">Avg. Session Duration</h3>
            <p class="text-2xl font-bold text-gray-800">4m 32s</p>
            <p class="text-sm text-gray-500">+15% from last month</p>
          </div>
        </div>
      </div>
    );
  }
}
