/**
 * Stores Panel View
 * Store 面板视图 - 拆分为 Sidebar（Store 列表）和 Detail（Store 详情）
 */
import type { StoreId } from '~/types/index.js';
import { cn } from '~/utils/cn.js';

import { Fukict } from '@fukict/basic';

import { cva } from 'class-variance-authority';

import Inspector from '../components/Inspector.js';
import { devtoolsStore } from '../stores/devtoolsStore.js';

const storeItemVariants = cva('px-3 py-2 cursor-pointer transition-colors', {
  variants: {
    selected: {
      true: 'bg-blue-100 dark:bg-blue-900/30',
      false: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

/**
 * Store 列表侧栏
 */
export class StoresSidebar extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = devtoolsStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  private handleSelectStore = (id: StoreId): void => {
    devtoolsStore.setState({ selectedStoreId: id });
  };

  render() {
    const { stores, selectedStoreId } = devtoolsStore.getState();
    const storeList = Object.entries(stores);

    if (storeList.length === 0) {
      return (
        <div class="flex h-full flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <p class="text-xs">No stores detected</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">
            Make sure your app is using @fukict/flux with store scope
          </p>
        </div>
      );
    }

    return (
      <div class="flex h-full flex-col">
        <div class="border-b border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          Stores ({storeList.length})
        </div>
        <div class="flex-1 overflow-y-auto">
          {storeList.map(([id, store]) => (
            <div
              class={cn(
                storeItemVariants({
                  selected: selectedStoreId === id,
                }),
              )}
              key={id}
              on:click={() => this.handleSelectStore(id)}
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs text-gray-900 dark:text-gray-100">
                  {store.name}
                </span>
                {store.history.length > 0 && (
                  <span class="text-[10px] text-blue-600 dark:text-blue-400">
                    {store.history.length}
                  </span>
                )}
              </div>
              <div class="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                {store.actions.sync.length + store.actions.async.length} actions
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

/**
 * Store 详情面板
 */
export class StoresDetail extends Fukict {
  private unsubscribe?: () => void;
  private readonly EXPAND_ALL_STORAGE_KEY = 'fukict-devtools-stores-expand-all';
  private expandAllState: Record<string, boolean> = {
    state: false,
  };

  mounted() {
    this.unsubscribe = devtoolsStore.subscribe(() => {
      this.update();
    });

    try {
      const saved = sessionStorage.getItem(this.EXPAND_ALL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.expandAllState = { ...this.expandAllState, ...parsed };
      }
    } catch {
      // Ignore parse errors
    }
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  private handleExpandAllChange = (
    section: string,
    expanded: boolean,
  ): void => {
    this.expandAllState[section] = expanded;
    try {
      sessionStorage.setItem(
        this.EXPAND_ALL_STORAGE_KEY,
        JSON.stringify(this.expandAllState),
      );
    } catch {
      // Ignore storage errors
    }
  };

  render() {
    const { stores, selectedStoreId } = devtoolsStore.getState();
    const selectedStore = selectedStoreId ? stores[selectedStoreId] : null;

    return (
      <div class="h-full overflow-y-auto">
        {selectedStore ? (
          <div>
            {/* Store 基本信息 */}
            <div class="border-b border-gray-200 p-3 dark:border-gray-700">
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {selectedStore.name}
              </div>
              <div class="mt-1 flex gap-3 text-[11px] text-gray-600 dark:text-gray-400">
                <span>Scope: {selectedStore.scope}</span>
                <span>
                  Created:{' '}
                  {new Date(selectedStore.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* 当前状态 */}
            <Inspector
              title="State"
              data={selectedStore.state}
              expandAllState={this.expandAllState.state}
              onExpandAllChange={(expanded: boolean) =>
                this.handleExpandAllChange('state', expanded)
              }
            />

            {/* Actions */}
            <div class="border-b border-gray-200 dark:border-gray-700">
              <div class="bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Actions
              </div>
              <div class="p-3">
                {/* 同步 Actions */}
                {selectedStore.actions.sync.length > 0 && (
                  <div class="mb-3">
                    <div class="mb-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                      Sync ({selectedStore.actions.sync.length})
                    </div>
                    <div class="flex flex-wrap gap-1">
                      {selectedStore.actions.sync.map(action => (
                        <span
                          key={action}
                          class="rounded bg-blue-100 px-2 py-0.5 font-mono text-[10px] text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 异步 Actions */}
                {selectedStore.actions.async.length > 0 && (
                  <div>
                    <div class="mb-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                      Async ({selectedStore.actions.async.length})
                    </div>
                    <div class="flex flex-wrap gap-1">
                      {selectedStore.actions.async.map(action => (
                        <span
                          key={action}
                          class="rounded bg-purple-100 px-2 py-0.5 font-mono text-[10px] text-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStore.actions.sync.length === 0 &&
                  selectedStore.actions.async.length === 0 && (
                    <div class="text-xs text-gray-500 italic dark:text-gray-400">
                      No actions defined
                    </div>
                  )}
              </div>
            </div>

            {/* Action 历史记录 */}
            <div class="border-b border-gray-200 dark:border-gray-700">
              <div class="bg-gray-50 px-3 py-2 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                History ({selectedStore.history.length})
              </div>
              <div class="p-3">
                {selectedStore.history.length > 0 ? (
                  <div class="space-y-2">
                    {selectedStore.history
                      .slice()
                      .reverse()
                      .map((action, index) => (
                        <div
                          key={index}
                          class="rounded border border-gray-200 p-2 text-[11px] dark:border-gray-700"
                        >
                          <div class="mb-1 flex items-center justify-between">
                            <span class="font-mono font-semibold text-gray-900 dark:text-gray-100">
                              {action.name}
                            </span>
                            <span
                              class={cn(
                                'rounded px-1.5 py-0.5 text-[9px] font-medium',
                                action.type === 'async'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                              )}
                            >
                              {action.type}
                            </span>
                          </div>
                          <div class="text-[10px] text-gray-500 dark:text-gray-400">
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </div>
                          {action.args && action.args.length > 0 && (
                            <div class="mt-1 font-mono text-[10px] text-gray-700 dark:text-gray-300">
                              Args: {JSON.stringify(action.args)}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div class="text-xs text-gray-500 italic dark:text-gray-400">
                    No action history
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div class="flex h-full items-center justify-center">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Select a store to inspect
            </p>
          </div>
        )}
      </div>
    );
  }
}
