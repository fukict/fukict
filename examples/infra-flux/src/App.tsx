import { Fukict, type VNode } from '@fukict/basic';

import { CounterComponent } from './components/CounterComponent';
import { SubscriptionMonitor } from './components/SubscriptionMonitor';
import { TodoComponent } from './components/TodoComponent';
import { UserComponent } from './components/UserComponent';

/**
 * App Component
 *
 * Main application component showcasing three flux examples
 */
export class App extends Fukict {
  render(): VNode {
    return (
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          {/* Header */}
          <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              Fukict Flux Examples
            </h1>
            <p class="text-gray-600">
              Minimal state management library demonstrations
            </p>
          </header>

          {/* Monitor Card (Full Width) */}
          <div class="mb-6">
            <SubscriptionMonitor />
          </div>

          {/* Examples Grid */}
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <CounterComponent />
            <TodoComponent />
            <UserComponent />
          </div>

          {/* Footer */}
          <footer class="mt-8 text-center text-sm text-gray-500">
            <p>
              Try interacting with each example and watch the Subscription
              Monitor update in real-time
            </p>
          </footer>
        </div>
      </div>
    );
  }
}
