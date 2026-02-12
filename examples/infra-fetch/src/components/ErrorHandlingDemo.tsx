import { Fukict, type VNode } from '@fukict/basic';
import { FetchError } from '@fukict/fetch';

import { http } from '../http';

export class ErrorHandlingDemo extends Fukict {
  private errorInfo: { code: string; message: string; status?: number } | null =
    null;
  private loading: boolean = false;

  private triggerError = async (statusCode: number): Promise<void> => {
    this.loading = true;
    this.errorInfo = null;
    this.update();

    try {
      await http.get(`/error/${statusCode}`);
    } catch (err) {
      if (FetchError.isFetchError(err)) {
        this.errorInfo = {
          code: err.code,
          message: err.message,
          status: err.response?.status,
        };
      } else {
        this.errorInfo = {
          code: 'UNKNOWN',
          message: String(err),
        };
      }
    }
    this.loading = false;
    this.update();
  };

  render(): VNode {
    return (
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-2xl font-bold">Error Handling</h2>
        <p class="mb-4 text-sm text-gray-600">
          FetchError type guard with error code inspection
        </p>

        <div class="mb-4 flex gap-2">
          <button
            class="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            on:click={() => this.triggerError(400)}
          >
            Trigger 400
          </button>
          <button
            class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            on:click={() => this.triggerError(500)}
          >
            Trigger 500
          </button>
        </div>

        {this.loading && <p class="text-gray-400">Requesting...</p>}

        {this.errorInfo && (
          <div class="rounded border border-red-200 bg-red-50 p-4">
            <div class="mb-2 flex items-center gap-2">
              <span class="rounded bg-red-100 px-2 py-0.5 font-mono text-sm text-red-700">
                {this.errorInfo.code}
              </span>
              {this.errorInfo.status && (
                <span class="rounded bg-red-100 px-2 py-0.5 font-mono text-sm text-red-700">
                  HTTP {this.errorInfo.status}
                </span>
              )}
            </div>
            <p class="text-sm text-red-800">{this.errorInfo.message}</p>
          </div>
        )}
      </div>
    );
  }
}
