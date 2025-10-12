import { RouteComponent } from '@fukict/router';
import type { VNode } from '@fukict/basic';

/**
 * 404 Not Found 页面
 */
export class NotFoundPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div class="text-center">
          <h1 class="text-9xl font-bold text-gray-300">404</h1>
          <h2 class="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p class="text-gray-600 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div class="p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-700">
            <strong>Current path:</strong> {this.route.path}
          </p>
        </div>

        <button
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          on:click={() => this.push('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }
}
