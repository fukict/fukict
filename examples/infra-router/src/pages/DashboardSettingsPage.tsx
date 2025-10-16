import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * Dashboard Settings 子页面
 */
export class DashboardSettingsPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Settings</h2>
        <p class="text-gray-600">Configure your dashboard preferences.</p>

        <div class="mt-6 space-y-4">
          <div class="rounded-lg border p-4">
            <label class="flex items-center space-x-3">
              <input type="checkbox" class="form-checkbox" checked />
              <span class="font-medium">Enable notifications</span>
            </label>
            <p class="mt-1 ml-6 text-sm text-gray-500">
              Receive real-time updates about your dashboard
            </p>
          </div>

          <div class="rounded-lg border p-4">
            <label class="flex items-center space-x-3">
              <input type="checkbox" class="form-checkbox" />
              <span class="font-medium">Auto-refresh data</span>
            </label>
            <p class="mt-1 ml-6 text-sm text-gray-500">
              Automatically refresh dashboard every 5 minutes
            </p>
          </div>

          <div class="rounded-lg border p-4">
            <label class="flex items-center space-x-3">
              <input type="checkbox" class="form-checkbox" checked />
              <span class="font-medium">Show advanced metrics</span>
            </label>
            <p class="mt-1 ml-6 text-sm text-gray-500">
              Display additional analytics and insights
            </p>
          </div>

          <div class="rounded-lg border p-4">
            <label class="mb-2 block font-medium">Dashboard Theme</label>
            <select class="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button class="rounded border px-4 py-2 hover:bg-gray-50">
              Cancel
            </button>
            <button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }
}
