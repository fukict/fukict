import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * About 页面
 */
export class AboutPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h1 class="text-3xl font-bold text-gray-900">About Fukict Router</h1>
        </div>

        <div class="prose max-w-none">
          <p class="text-gray-700">
            Fukict Router is a powerful, flexible routing solution for Fukict
            applications. It provides:
          </p>

          <ul class="list-disc pl-6 space-y-2 mt-4 text-gray-700">
            <li>Hash and Browser History modes</li>
            <li>Dynamic route parameters</li>
            <li>Nested routes and layouts</li>
            <li>Navigation guards (beforeEach, afterEach, beforeEnter)</li>
            <li>Query parameters and hash support</li>
            <li>Programmatic navigation (push, replace, back, forward)</li>
            <li>Active link detection</li>
          </ul>

          <div class="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-semibold text-blue-900 mb-2">Current Route Info</h3>
            <div class="space-y-1 text-sm">
              <p class="text-blue-800">
                <strong>Path:</strong> {this.route.path}
              </p>
              <p class="text-blue-800">
                <strong>Query:</strong> {JSON.stringify(this.route.query)}
              </p>
              <p class="text-blue-800">
                <strong>Hash:</strong> {this.route.hash || '(none)'}
              </p>
            </div>
          </div>

          <div class="mt-6 flex gap-4">
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
      </div>
    );
  }
}
