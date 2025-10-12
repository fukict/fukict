import { RouteComponent } from '@fukict/router';
import type { VNode } from '@fukict/basic';

/**
 * User 页面 - 展示动态路由参数
 */
export class UserPage extends RouteComponent {
  routeParamsChanged(
    newParams: Record<string, string>,
    oldParams: Record<string, string>,
  ): void {
    console.log('User ID changed:', oldParams.id, '->', newParams.id);
  }

  render(): VNode {
    const { id } = this.params;

    return (
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h1 class="text-3xl font-bold text-gray-900">User Profile</h1>
          <p class="mt-2 text-gray-600">Dynamic route parameter: {id}</p>
        </div>

        <div class="bg-white border rounded-lg p-6 shadow-sm">
          <div class="flex items-center space-x-4 mb-6">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {id}
            </div>
            <div>
              <h2 class="text-xl font-semibold">User #{id}</h2>
              <p class="text-gray-500">user{id}@example.com</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="p-3 bg-gray-50 rounded">
              <span class="font-semibold">Role:</span> Developer
            </div>
            <div class="p-3 bg-gray-50 rounded">
              <span class="font-semibold">Joined:</span> January 2025
            </div>
            <div class="p-3 bg-gray-50 rounded">
              <span class="font-semibold">Route Param:</span> {id}
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <h3 class="font-semibold mb-3">Navigate to other users:</h3>
          <div class="flex gap-2">
            {['100', '200', '300', '999'].map(userId => (
              <button
                class={`px-4 py-2 rounded ${
                  userId === id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                on:click={() => this.push(`/user/${userId}`)}
              >
                User {userId}
              </button>
            ))}
          </div>
        </div>

        <div class="flex gap-4">
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
    );
  }
}
