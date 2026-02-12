import { Fukict, type VNode } from '@fukict/basic';

import { http } from '../http';

export class InterceptorDemo extends Fukict {
  private interceptorId: number | null = null;
  private requestHeaders: Record<string, unknown> = {};
  private interceptorActive: boolean = false;
  private lastStatus: string = '';

  private toggleInterceptor = (): void => {
    if (this.interceptorId !== null) {
      http.interceptors.request.eject(this.interceptorId);
      this.interceptorId = null;
      this.interceptorActive = false;
    } else {
      this.interceptorId = http.interceptors.request.use(config => {
        config.headers = {
          ...config.headers,
          Authorization: 'Bearer mock-jwt-token-12345',
        };
        return config;
      });
      this.interceptorActive = true;
    }
    this.update();
  };

  private sendTestRequest = async (): Promise<void> => {
    try {
      const res = await http.get('/todos');
      this.lastStatus = `${res.status} ${res.statusText}`;
      this.requestHeaders = { ...res.config.headers };
    } catch {
      this.lastStatus = 'Request failed';
      this.requestHeaders = {};
    }
    this.update();
  };

  beforeUnmount(): void {
    if (this.interceptorId !== null) {
      http.interceptors.request.eject(this.interceptorId);
    }
  }

  render(): VNode {
    const headerEntries = Object.entries(this.requestHeaders);

    return (
      <div class="rounded-lg border bg-white p-6 shadow-sm">
        <h2 class="mb-1 text-2xl font-bold">Interceptors</h2>
        <p class="mb-4 text-sm text-gray-600">
          Add/remove request interceptors and inspect headers
        </p>

        <div class="mb-4 flex gap-2">
          <button
            class={`rounded px-4 py-2 text-white ${
              this.interceptorActive
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            on:click={() => this.toggleInterceptor()}
          >
            {this.interceptorActive
              ? 'Remove Interceptor'
              : 'Add Auth Interceptor'}
          </button>
          <button
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            on:click={() => this.sendTestRequest()}
          >
            Send Request
          </button>
        </div>

        {/* Interceptor Status */}
        <div class="mb-4">
          <span
            class={`inline-block rounded px-2 py-0.5 text-sm font-medium ${
              this.interceptorActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {this.interceptorActive
              ? 'Interceptor Active'
              : 'Interceptor Inactive'}
          </span>
        </div>

        {/* Response Info */}
        {this.lastStatus && (
          <div class="mb-2 rounded bg-gray-100 px-3 py-2 font-mono text-sm text-gray-700">
            Status: {this.lastStatus}
          </div>
        )}

        {/* Headers */}
        {headerEntries.length > 0 && (
          <div class="rounded border bg-gray-50 p-3">
            <h3 class="mb-2 text-sm font-semibold text-gray-700">
              Request Headers (from config)
            </h3>
            <div class="space-y-1">
              {headerEntries.map(([key, value]) => (
                <div class="font-mono text-xs">
                  <span class="text-blue-600">{key}</span>
                  <span class="text-gray-400">: </span>
                  <span class="text-gray-700">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
