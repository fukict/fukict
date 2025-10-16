import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

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

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="mb-6 flex items-center space-x-4">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-2xl font-bold text-white">
              {id}
            </div>
            <div>
              <h2 class="text-xl font-semibold">User #{id}</h2>
              <p class="text-gray-500">user{id}@example.com</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="rounded bg-gray-50 p-3">
              <span class="font-semibold">Role:</span> Developer
            </div>
            <div class="rounded bg-gray-50 p-3">
              <span class="font-semibold">Joined:</span> January 2025
            </div>
            <div class="rounded bg-gray-50 p-3">
              <span class="font-semibold">Route Param:</span> {id}
            </div>
          </div>
        </div>

        <div class="border-t pt-4">
          <h3 class="mb-3 font-semibold">Navigate to other users:</h3>
          <div class="flex gap-2">
            {['100', '200', '300', '999'].map(userId => (
              <button
                class={`rounded px-4 py-2 ${
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
    );
  }
}
