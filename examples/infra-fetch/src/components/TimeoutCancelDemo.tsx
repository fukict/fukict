import { Fukict, type VNode } from '@fukict/basic';
import { FetchError } from '@fukict/fetch';

import { http } from '../http';

export class TimeoutCancelDemo extends Fukict {
  private timeoutMs: number = 1000;
  private result: string = '';
  private loading: boolean = false;
  private abortController: AbortController | null = null;

  private testTimeout = async (): Promise<void> => {
    this.loading = true;
    this.result = '';
    this.update();

    try {
      await http.get('/slow', { timeout: this.timeoutMs });
      this.result = 'Request completed (no timeout)';
    } catch (err) {
      if (FetchError.isFetchError(err)) {
        this.result = `Error: ${err.code} — ${err.message}`;
      } else {
        this.result = `Error: ${String(err)}`;
      }
    }
    this.loading = false;
    this.update();
  };

  private startCancelRequest = async (): Promise<void> => {
    this.abortController = new AbortController();
    this.loading = true;
    this.result = '';
    this.update();

    try {
      await http.get('/slow', { signal: this.abortController.signal });
      this.result = 'Request completed (not cancelled)';
    } catch (err) {
      if (FetchError.isFetchError(err)) {
        this.result = `Error: ${err.code} — ${err.message}`;
      } else {
        this.result = `Error: ${String(err)}`;
      }
    }
    this.abortController = null;
    this.loading = false;
    this.update();
  };

  private cancelRequest = (): void => {
    if (this.abortController) {
      this.abortController.abort();
    }
  };

  render(): VNode {
    return (
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-2xl font-bold">Timeout & Cancel</h2>
        <p class="mb-4 text-sm text-gray-600">
          Timeout configuration and AbortController cancellation
        </p>

        {/* Timeout Section */}
        <div class="mb-4">
          <h3 class="mb-2 font-semibold text-gray-700">Timeout Test</h3>
          <p class="mb-2 text-xs text-gray-500">
            /api/slow responds after 3s. Set timeout below that to see
            ERR_TIMEOUT.
          </p>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Timeout (ms):</label>
            <input
              type="number"
              value={String(this.timeoutMs)}
              class="w-24 rounded border px-2 py-1"
              on:input={(e: Event) => {
                this.timeoutMs =
                  parseInt((e.target as HTMLInputElement).value) || 1000;
                this.update();
              }}
            />
            <button
              class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
              on:click={() => this.testTimeout()}
            >
              Send
            </button>
          </div>
        </div>

        {/* Cancel Section */}
        <div class="mb-4">
          <h3 class="mb-2 font-semibold text-gray-700">Cancel Test</h3>
          <p class="mb-2 text-xs text-gray-500">
            Start a slow request, then cancel it to see ERR_CANCELED.
          </p>
          <div class="flex gap-2">
            <button
              class="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
              on:click={() => this.startCancelRequest()}
            >
              Start Request
            </button>
            <button
              class={`rounded px-4 py-2 text-white ${
                this.abortController
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'cursor-not-allowed bg-gray-300'
              }`}
              on:click={() => this.cancelRequest()}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Result */}
        {this.loading && <p class="text-gray-400">Requesting...</p>}
        {this.result && (
          <div class="rounded bg-gray-100 px-3 py-2 font-mono text-sm text-gray-700">
            {this.result}
          </div>
        )}
      </div>
    );
  }
}
