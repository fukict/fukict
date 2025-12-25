import { Fukict, type VNode } from '@fukict/basic';

import { counterStore } from '../stores/counterStore';
import { todoStore } from '../stores/todoStore';
import { userStore } from '../stores/userStore';

/**
 * Subscription Monitor Component
 *
 * Demonstrates:
 * - Cross-store subscriptions
 * - Multiple subscriptions in one component
 * - Real-time state change tracking
 */
export class SubscriptionMonitor extends Fukict {
  private counterUnsubscribe?: () => void;
  private todoUnsubscribe?: () => void;
  private userUnsubscribe?: () => void;

  private counterUpdateCount = 0;
  private todoUpdateCount = 0;
  private userUpdateCount = 0;

  private lastCounterState: string = '';
  private lastTodoState: string = '';
  private lastUserState: string = '';

  mounted(): void {
    // Subscribe to counter store
    this.counterUnsubscribe = counterStore.subscribe(state => {
      this.counterUpdateCount++;
      this.lastCounterState = `count: ${state.count}, step: ${state.step}`;
      this.update();
    });

    // Initialize counter display
    const counterState = counterStore.state;
    this.lastCounterState = `count: ${counterState.count}, step: ${counterState.step}`;

    // Subscribe to todo store
    this.todoUnsubscribe = todoStore.subscribe(state => {
      this.todoUpdateCount++;
      this.lastTodoState = `${state.todos.length} todos, filter: ${state.filter}`;
      this.update();
    });

    // Initialize todo display
    const todoState = todoStore.state;
    this.lastTodoState = `${todoState.todos.length} todos, filter: ${todoState.filter}`;

    // Subscribe to user store
    this.userUnsubscribe = userStore.subscribe(state => {
      this.userUpdateCount++;
      this.lastUserState = state.user
        ? `${state.user.name} (${state.settings.theme})`
        : 'Not logged in';
      this.update();
    });

    // Initialize user display
    const userState = userStore.state;
    this.lastUserState = userState.user
      ? `${userState.user.name} (${userState.settings.theme})`
      : 'Not logged in';
  }

  beforeUnmount(): void {
    this.counterUnsubscribe?.();
    this.todoUnsubscribe?.();
    this.userUnsubscribe?.();
  }

  render(): VNode {
    return (
      <div class="rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm">
        <h2 class="mb-4 text-2xl font-bold">Subscription Monitor</h2>
        <p class="mb-4 text-gray-600">
          Real-time tracking of all store updates (demonstrates cross-store
          subscriptions)
        </p>

        <div class="space-y-3">
          {/* Counter Store Monitor */}
          <div class="rounded border-l-4 border-green-500 bg-white p-3">
            <div class="mb-1 flex items-start justify-between">
              <span class="font-semibold text-green-700">Counter Store</span>
              <span class="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                {this.counterUpdateCount} updates
              </span>
            </div>
            <p class="text-sm text-gray-600">{this.lastCounterState}</p>
          </div>

          {/* Todo Store Monitor */}
          <div class="rounded border-l-4 border-blue-500 bg-white p-3">
            <div class="mb-1 flex items-start justify-between">
              <span class="font-semibold text-blue-700">Todo Store</span>
              <span class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                {this.todoUpdateCount} updates
              </span>
            </div>
            <p class="text-sm text-gray-600">{this.lastTodoState}</p>
          </div>

          {/* User Store Monitor */}
          <div class="rounded border-l-4 border-purple-500 bg-white p-3">
            <div class="mb-1 flex items-start justify-between">
              <span class="font-semibold text-purple-700">User Store</span>
              <span class="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                {this.userUpdateCount} updates
              </span>
            </div>
            <p class="text-sm text-gray-600">{this.lastUserState}</p>
          </div>
        </div>

        <div class="mt-4 border-t border-purple-200 pt-4">
          <p class="text-xs text-gray-500">
            💡 This component subscribes to all three stores simultaneously.
            Notice how each store update is independent and doesn't trigger
            updates in other stores.
          </p>
        </div>
      </div>
    );
  }
}
