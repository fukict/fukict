import { Fukict, type VNode } from '@fukict/basic';

import { counterStore } from '../stores/counterStore';

/**
 * Counter Component
 *
 * Demonstrates:
 * - Basic flux subscription
 * - Action dispatching
 * - Component lifecycle integration
 */
export class CounterComponent extends Fukict {
  private unsubscribe?: () => void;

  mounted(): void {
    // Subscribe to store changes
    this.unsubscribe = counterStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount(): void {
    // Clean up subscription
    this.unsubscribe?.();
  }

  render(): VNode {
    const state = counterStore.getState();
    const { increment, decrement, reset, setStep, incrementAsync } =
      counterStore.actions;

    return (
      <div class="border rounded-lg p-6 bg-white shadow-sm">
        <h2 class="text-2xl font-bold mb-4">Counter Example</h2>
        <p class="text-gray-600 mb-4">
          Basic flux usage with simple state management
        </p>

        <div class="flex items-center gap-4 mb-4">
          <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            on:click={() => decrement()}
          >
            -
          </button>

          <div class="text-4xl font-bold w-24 text-center">{state.count}</div>

          <button
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            on:click={() => increment()}
          >
            +
          </button>
        </div>

        <div class="flex gap-2 mb-4">
          <button
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            on:click={() => reset()}
          >
            Reset
          </button>

          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            on:click={() => incrementAsync()}
          >
            Async +1 (1s)
          </button>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">Step:</label>
          <input
            type="number"
            value={state.step}
            class="px-2 py-1 border rounded w-20"
            on:input={(e: Event) => {
              const value = parseInt((e.target as HTMLInputElement).value) || 1;
              setStep(value);
            }}
          />
        </div>
      </div>
    );
  }
}
