import { Fukict, type VNode } from '@fukict/basic';

import { CrudDemo } from './components/CrudDemo';
import { ErrorHandlingDemo } from './components/ErrorHandlingDemo';
import { InterceptorDemo } from './components/InterceptorDemo';
import { TimeoutCancelDemo } from './components/TimeoutCancelDemo';

export class App extends Fukict {
  render(): VNode {
    return (
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="mx-auto max-w-7xl px-4">
          <header class="mb-8">
            <h1 class="mb-2 text-4xl font-bold text-gray-900">
              Fukict Fetch Examples
            </h1>
            <p class="text-gray-600">
              Axios-style HTTP client built on native fetch
            </p>
          </header>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CrudDemo />
            <ErrorHandlingDemo />
            <TimeoutCancelDemo />
            <InterceptorDemo />
          </div>

          <footer class="mt-8 text-center text-sm text-gray-500">
            <p>
              All requests hit Vite mock middleware — no external server needed
            </p>
          </footer>
        </div>
      </div>
    );
  }
}
