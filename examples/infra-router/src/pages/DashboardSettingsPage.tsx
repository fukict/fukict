import { RouteComponent } from '@fukict/router';
import type { VNode } from '@fukict/basic';

/**
 * Dashboard Settings 子页面
 */
export class DashboardSettingsPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Settings</h2>
        <p class="text-gray-600">Configure your dashboard preferences.</p>

        <div class="space-y-4 mt-6">
          <div class="p-4 border rounded-lg">
            <label class="flex items-center space-x-3">
              <input type="checkbox" class="form-checkbox" checked />
              <span class="font-medium">Enable notifications</span>
            </label>
            <p class="text-sm text-gray-500 ml-6 mt-1">
              Receive real-time updates about your dashboard
            </p>
          </div>

          <div class="p-4 border rounded-lg">
            <label class="flex items-center space-x-3">
              <input type="checkbox" class="form-checkbox" />
              <span class="font-medium">Auto-refresh data</span>
            </label>
            <p class="text-sm text-gray-500 ml-6 mt-1">
              Automatically refresh dashboard every 5 minutes
            </p>
          </div>

          <div class="p-4 border rounded-lg">
            <label class="flex items-center space-x-3">
              <input type="checkbox" class="form-checkbox" checked />
              <span class="font-medium">Show advanced metrics</span>
            </label>
            <p class="text-sm text-gray-500 ml-6 mt-1">
              Display additional analytics and insights
            </p>
          </div>

          <div class="p-4 border rounded-lg">
            <label class="block font-medium mb-2">Dashboard Theme</label>
            <select class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button class="px-4 py-2 border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }
}
