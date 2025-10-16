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

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h2 class="mb-2 text-xl font-semibold">Basic Navigation</h2>
            <p class="mb-4 text-gray-600">
              Navigate between pages using Link components or programmatic
              navigation.
            </p>
            <button
              class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              on:click={() => this.push('/about')}
            >
              Go to About
            </button>
          </div>

          <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h2 class="mb-2 text-xl font-semibold">Dynamic Routes</h2>
            <p class="mb-4 text-gray-600">
              Routes with parameters like /user/:id support dynamic content.
            </p>
            <button
              class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              on:click={() => this.push('/user/123')}
            >
              View User Profile
            </button>
          </div>

          <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h2 class="mb-2 text-xl font-semibold">Nested Routes</h2>
            <p class="mb-4 text-gray-600">
              Build complex layouts with nested router views.
            </p>
            <button
              class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
              on:click={() => this.push('/dashboard')}
            >
              Open Dashboard
            </button>
          </div>

          <div class="rounded-lg border p-6 transition-shadow hover:shadow-md">
            <h2 class="mb-2 text-xl font-semibold">Query Parameters</h2>
            <p class="mb-4 text-gray-600">
              Access and update query parameters in your routes.
            </p>
            <button
              class="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
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
