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
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-2xl font-bold">Counter Example</h2>
        <p class="mb-4 text-gray-600">
          Basic flux usage with simple state management
        </p>

        <div class="mb-4 flex items-center gap-4">
          <button
            class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            on:click={() => decrement()}
          >
            -
          </button>

          <div class="w-24 text-center text-4xl font-bold">{state.count}</div>

          <button
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            on:click={() => increment()}
          >
            +
          </button>
        </div>

        <div class="mb-4 flex gap-2">
          <button
            class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            on:click={() => reset()}
          >
            Reset
          </button>

          <button
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
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
            class="w-20 rounded border px-2 py-1"
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
