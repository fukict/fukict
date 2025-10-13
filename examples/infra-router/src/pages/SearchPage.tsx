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

        <div class="bg-white border rounded-lg p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={q}
              placeholder="Enter search term..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              on:input={(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.updateQuery({ q: target.value, page: '1' });
              }}
            />
          </div>

          <div class="p-4 bg-gray-50 rounded mb-4">
            <h3 class="font-semibold mb-2">Current Query Parameters:</h3>
            <div class="text-sm space-y-1">
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
                  <div class="p-4 border rounded hover:bg-gray-50">
                    <h4 class="font-semibold text-blue-600">
                      Result {(currentPage - 1) * 5 + i + 1}: {q} example
                    </h4>
                    <p class="text-sm text-gray-600">
                      This is a search result for "{q}" on page {currentPage}
                    </p>
                  </div>
                ))}
              </div>

              <div class="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                <button
                  class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  disabled={currentPage <= 1}
                  on:click={() =>
                    this.updateQuery({ page: String(currentPage - 1) })
                  }
                >
                  Previous
                </button>
                <span class="px-4 py-2">Page {currentPage}</span>
                <button
                  class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  on:click={() =>
                    this.updateQuery({ page: String(currentPage + 1) })
                  }
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div class="text-center py-8 text-gray-500">
              Enter a search term to see results
            </div>
          )}
        </div>

        <div class="flex gap-4">
          <button
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            on:click={() => this.back()}
          >
            Go Back
          </button>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            on:click={() => this.push('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
}
