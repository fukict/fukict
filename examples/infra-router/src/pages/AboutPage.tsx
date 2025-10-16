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

          <ul class="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>Hash and Browser History modes</li>
            <li>Dynamic route parameters</li>
            <li>Nested routes and layouts</li>
            <li>Navigation guards (beforeEach, afterEach, beforeEnter)</li>
            <li>Query parameters and hash support</li>
            <li>Programmatic navigation (push, replace, back, forward)</li>
            <li>Active link detection</li>
          </ul>

          <div class="mt-8 rounded-lg bg-blue-50 p-4">
            <h3 class="mb-2 font-semibold text-blue-900">Current Route Info</h3>
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
              class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              on:click={() => this.back()}
            >
              Go Back
            </button>
            <button
              class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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
