import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * 404 Not Found 页面
 */
export class NotFoundPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="flex min-h-[400px] flex-col items-center justify-center space-y-6">
        <div class="text-center">
          <h1 class="text-9xl font-bold text-gray-300">404</h1>
          <h2 class="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
          <p class="mt-2 text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div class="rounded-lg bg-gray-50 p-4">
          <p class="text-sm text-gray-700">
            <strong>Current path:</strong> {this.route.path}
          </p>
        </div>

        <button
          class="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
          on:click={() => this.push('/')}
        >
          Back to Home
        </button>
      </div>
    );
  }
}
