import type { VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

/**
 * Search 页面 - 展示查询参数
 */
export class SearchPage extends RouteComponent {
  routeQueryChanged(
    newQuery: Record<string, string>,
    oldQuery: Record<string, string>,
  ): void {
    console.log('Query changed:', oldQuery, '->', newQuery);
  }

  render(): VNode {
    const { q = '', page = '1' } = this.query;
    const currentPage = parseInt(page, 10);

    return (
      <div class="space-y-6">
        <div class="border-b pb-4">
          <h1 class="text-3xl font-bold text-gray-900">Search Results</h1>
        </div>

        <div class="rounded-lg border bg-white p-6">
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Search Query
            </label>
            <input
              type="text"
              value={q}
              placeholder="Enter search term..."
              class="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              on:input={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateQuery({ q: target.value, page: '1' });
              }}
            />
          </div>

          <div class="mb-4 rounded bg-gray-50 p-4">
            <h3 class="mb-2 font-semibold">Current Query Parameters:</h3>
            <div class="space-y-1 text-sm">
              <p>
                <strong>q:</strong> {q || '(empty)'}
              </p>
              <p>
                <strong>page:</strong> {page}
              </p>
            </div>
          </div>

          {q ? (
            <div class="space-y-3">
              <h3 class="font-semibold">Results for "{q}":</h3>
              <div class="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div class="rounded border p-4 hover:bg-gray-50">
                    <h4 class="font-semibold text-blue-600">
                      Result {(currentPage - 1) * 5 + i + 1}: {q} example
                    </h4>
                    <p class="text-sm text-gray-600">
                      This is a search result for "{q}" on page {currentPage}
                    </p>
                  </div>
                ))}
              </div>

              <div class="mt-6 flex items-center justify-center gap-2 border-t pt-6">
                <button
                  class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage <= 1}
                  on:click={() =>
                    this.updateQuery({ page: String(currentPage - 1) })
                  }
                >
                  Previous
                </button>
                <span class="px-4 py-2">Page {currentPage}</span>
                <button
                  class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                  on:click={() =>
                    this.updateQuery({ page: String(currentPage + 1) })
                  }
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div class="py-8 text-center text-gray-500">
              Enter a search term to see results
            </div>
          )}
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
