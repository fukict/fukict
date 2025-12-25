import { Fukict, type VNode } from '@fukict/basic';

import { userStore } from '../stores/userStore';

/**
 * User Component
 *
 * Demonstrates:
 * - Selector subscription (only updates when specific state changes)
 * - Async actions
 * - Nested object state
 * - fukict:detach usage for independent updates
 */
export class UserComponent extends Fukict {
  private unsubscribeUser?: () => void;
  private unsubscribeSettings?: () => void;
  private email: string = '';

  mounted(): void {
    // Example 1: Subscribe to entire state
    this.unsubscribeUser = userStore.subscribe(() => {
      this.update();
    });

    // Example 2: Selector subscription (commented out, but shows the pattern)
    // Only updates when user changes, not when settings change
    /*
    this.unsubscribeUser = userStore.subscribe(
      (state) => state.user,
      (user) => {
        console.log('User changed:', user);
        this.update();
      }
    );
    */
  }

  beforeUnmount(): void {
    this.unsubscribeUser?.();
    this.unsubscribeSettings?.();
  }

  private handleLogin = (e: Event): void => {
    e.preventDefault();
    if (this.email.trim()) {
      void userStore.asyncActions.login(this.email);
    }
  };

  render(): VNode {
    const state = userStore.state;
    const { logout, updateSettings } = userStore.actions;

    return (
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-2xl font-bold">User Example</h2>
        <p class="mb-4 text-gray-600">
          Nested objects, async actions, and selector subscriptions
        </p>

        {state.isLoading ? (
          <div class="py-8 text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : state.user ? (
          <div>
            {/* User Profile */}
            <div class="mb-4 flex items-center gap-4 rounded bg-gray-50 p-4">
              <img
                src={state.user.avatar}
                alt="Avatar"
                class="h-16 w-16 rounded-full"
              />
              <div>
                <h3 class="font-bold">{state.user.name}</h3>
                <p class="text-sm text-gray-600">{state.user.email}</p>
              </div>
            </div>

            {/* Settings */}
            <div class="mb-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Theme:</span>
                <div class="flex gap-2">
                  {(['light', 'dark'] as const).map(theme => (
                    <button
                      class={`rounded px-3 py-1 text-sm ${
                        state.settings.theme === theme
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      on:click={() => updateSettings({ theme })}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Language:</span>
                <div class="flex gap-2">
                  {(['en', 'zh'] as const).map(lang => (
                    <button
                      class={`rounded px-3 py-1 text-sm ${
                        state.settings.language === lang
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      on:click={() => updateSettings({ language: lang })}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Notifications:</span>
                <button
                  class={`rounded px-3 py-1 text-sm ${
                    state.settings.notifications
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  on:click={() =>
                    updateSettings({
                      notifications: !state.settings.notifications,
                    })
                  }
                >
                  {state.settings.notifications ? 'On' : 'Off'}
                </button>
              </div>
            </div>

            <button
              class="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              on:click={() => logout()}
            >
              Logout
            </button>
          </div>
        ) : (
          <form on:submit={this.handleLogin} class="space-y-4">
            <div>
              <label class="mb-1 block text-sm text-gray-600">Email:</label>
              <input
                type="email"
                value={this.email}
                placeholder="your@email.com"
                class="w-full rounded border px-3 py-2"
                on:input={(e: Event) => {
                  this.email = (e.target as HTMLInputElement).value;
                  this.update();
                }}
              />
            </div>
            <button
              type="submit"
              class="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        )}
      </div>
    );
  }
}
