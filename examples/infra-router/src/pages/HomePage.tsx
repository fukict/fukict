import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * Home 页面
 */
export class HomePage extends RouteComponent {
  render(): VNode {
    return (
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h1 class="text-3xl font-bold text-gray-900">
            Welcome to Fukict Router
          </h1>
          <p class="mt-2 text-gray-600">
            This is a comprehensive router example showcasing all router
            features.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 class="text-xl font-semibold mb-2">Basic Navigation</h2>
            <p class="text-gray-600 mb-4">
              Navigate between pages using Link components or programmatic
              navigation.
            </p>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              on:click={() => this.push('/about')}
            >
              Go to About
            </button>
          </div>

          <div class="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 class="text-xl font-semibold mb-2">Dynamic Routes</h2>
            <p class="text-gray-600 mb-4">
              Routes with parameters like /user/:id support dynamic content.
            </p>
            <button
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              on:click={() => this.push('/user/123')}
            >
              View User Profile
            </button>
          </div>

          <div class="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 class="text-xl font-semibold mb-2">Nested Routes</h2>
            <p class="text-gray-600 mb-4">
              Build complex layouts with nested router views.
            </p>
            <button
              class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              on:click={() => this.push('/dashboard')}
            >
              Open Dashboard
            </button>
          </div>

          <div class="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 class="text-xl font-semibold mb-2">Query Parameters</h2>
            <p class="text-gray-600 mb-4">
              Access and update query parameters in your routes.
            </p>
            <button
              class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              on:click={() => this.push('/search?q=fukict&page=1')}
            >
              Search Example
            </button>
          </div>
        </div>
      </div>
    );
  }
}
