/**
 * Components Panel View
 * 组件面板视图 - 拆分为 Sidebar（组件树）和 Detail（组件详情）
 */
import type { ComponentId } from '~/types/index.js';

import { Fukict } from '@fukict/basic';

import Inspector from '../components/Inspector.js';
import TreeView from '../components/TreeView.js';
import { devtoolsStore } from '../stores/devtoolsStore.js';

/**
 * 组件树侧栏
 */
export class ComponentsSidebar extends Fukict {
  private unsubscribe?: () => void;
  private isInspecting = false;

  mounted() {
    this.unsubscribe = devtoolsStore.subscribe(() => {
      const { pendingSelectId } = devtoolsStore.getState();
      if (pendingSelectId) {
        if (this.isInspecting) {
          this.isInspecting = false;
        }
        devtoolsStore.setState({
          selectedComponentId: pendingSelectId,
          pendingSelectId: null,
        });
      }
      this.update();
    });

    // Handle pending selection on initial mount
    const { pendingSelectId } = devtoolsStore.getState();
    if (pendingSelectId) {
      devtoolsStore.setState({
        selectedComponentId: pendingSelectId,
        pendingSelectId: null,
      });
    }
  }

  beforeUnmount() {
    this.unsubscribe?.();
    if (this.isInspecting) {
      void chrome.runtime.sendMessage({
        type: 'STOP_INSPECT',
        source: 'fukict-devtools-panel',
      });
    }
  }

  private handleSelectComponent = (id: ComponentId): void => {
    devtoolsStore.setState({ selectedComponentId: id });
  };

  private handleTreeMouseLeave = (): void => {
    void chrome.runtime.sendMessage({
      type: 'UNHIGHLIGHT_COMPONENT',
      source: 'fukict-devtools-panel',
    });
  };

  private handleToggleInspect = (): void => {
    this.isInspecting = !this.isInspecting;
    void chrome.runtime.sendMessage({
      type: this.isInspecting ? 'START_INSPECT' : 'STOP_INSPECT',
      source: 'fukict-devtools-panel',
    });
    this.update();
  };

  render() {
    const { components, selectedComponentId } = devtoolsStore.getState();
    const componentList = Object.values(components);

    if (componentList.length === 0) {
      return (
        <div class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
          <p class="text-xs">No components detected</p>
        </div>
      );
    }

    const rootIds = componentList
      .filter(comp => !comp.parentId)
      .map(comp => comp.id);

    return (
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <span>Components ({componentList.length})</span>
          <button
            class={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
              this.isInspecting
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            }`}
            on:click={this.handleToggleInspect}
            title="Select component from page"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              <path d="M13 13l6 6" />
            </svg>
          </button>
        </div>
        <div
          class="flex-1 overflow-y-auto"
          on:mouseleave={this.handleTreeMouseLeave}
        >
          <TreeView
            components={components}
            rootIds={rootIds}
            selectedId={selectedComponentId}
            onSelect={this.handleSelectComponent}
          />
        </div>
      </div>
    );
  }
}

/**
 * 组件详情面板
 */
export class ComponentsDetail extends Fukict {
  private unsubscribe?: () => void;
  private readonly EXPAND_ALL_STORAGE_KEY = 'fukict-devtools-expand-all';
  private expandAllState: Record<string, boolean> = {
    instance: false,
    context: false,
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

  private handleInspectDOM = (componentId: ComponentId): void => {
    console.log('[ComponentsView] Inspecting DOM for component:', componentId);

    (chrome as any).runtime.sendMessage(
      {
        type: 'INSPECT_DOM',
        componentId: componentId,
        source: 'fukict-devtools-panel',
      },
      (response: any) => {
        if (response?.ok) {
          console.log('[ComponentsView] DOM element ready, calling inspect()');
          chrome.devtools.inspectedWindow.eval(
            `(function() {
              var element = window.__FUKICT_DEVTOOLS_INSPECT_TARGET__;
              if (element) {
                inspect(element);
                return true;
              }
              return false;
            })()`,
            (result, exceptionInfo) => {
              if (exceptionInfo) {
                console.error(
                  '[ComponentsView] inspect() failed:',
                  exceptionInfo,
                );
              } else if (result) {
                console.log('[ComponentsView] inspect() successful');
              } else {
                console.warn(
                  '[ComponentsView] Element not found for inspect()',
                );
              }
            },
          );
        } else {
          console.warn('[ComponentsView] DOM inspection failed:', response);
        }
      },
    );
  };

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
    const { components, selectedComponentId } = devtoolsStore.getState();
    const selectedComponent = selectedComponentId
      ? components[selectedComponentId]
      : null;

    return (
      <div class="h-full overflow-y-auto bg-white dark:bg-gray-900">
        {selectedComponent ? (
          <div>
            {/* 组件信息 */}
            <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="text-base font-semibold text-gray-900 dark:text-gray-100">
                  &lt;{selectedComponent.name}&gt;
                </div>
                <button
                  class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  on:click={() => this.handleInspectDOM(selectedComponent.id)}
                >
                  Reveal in Elements
                </button>
              </div>
              <div class="mt-2 flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span>
                  Type:{' '}
                  <span class="font-medium">{selectedComponent.type}</span>
                </span>
                <span>
                  Updates:{' '}
                  <span class="font-medium">
                    {selectedComponent.updateCount}
                  </span>
                </span>
                <span>
                  Status:{' '}
                  {selectedComponent.isMounted ? (
                    <span class="font-medium text-green-600 dark:text-green-400">
                      Mounted
                    </span>
                  ) : (
                    <span class="font-medium text-red-600 dark:text-red-400">
                      Unmounted
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Instance */}
            <Inspector
              title="Instance"
              data={selectedComponent.instanceData}
              emptyText="No instance data"
              expandAllState={this.expandAllState.instance}
              onExpandAllChange={(expanded: boolean) =>
                this.handleExpandAllChange('instance', expanded)
              }
            />

            {/* Context */}
            <Inspector
              title="Context"
              data={selectedComponent.contextData}
              emptyText="No context"
              expandAllState={this.expandAllState.context}
              onExpandAllChange={(expanded: boolean) =>
                this.handleExpandAllChange('context', expanded)
              }
            />

            {/* VNode Info */}
            {selectedComponent.vnodeInfo && (
              <div class="border-b border-gray-200 last:border-b-0 dark:border-gray-700">
                <div class="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  VNode
                </div>
                <div class="px-4 py-3">
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div class="text-gray-500 dark:text-gray-400">Type</div>
                    <div class="font-mono text-gray-900 dark:text-gray-100">
                      {selectedComponent.vnodeInfo.type}
                    </div>

                    <div class="text-gray-500 dark:text-gray-400">
                      Has Render
                    </div>
                    <div class="font-mono text-gray-900 dark:text-gray-100">
                      {selectedComponent.vnodeInfo.hasRender ? (
                        <span class="text-green-600 dark:text-green-400">
                          true
                        </span>
                      ) : (
                        <span class="text-red-600 dark:text-red-400">
                          false
                        </span>
                      )}
                    </div>

                    <div class="text-gray-500 dark:text-gray-400">DOM Node</div>
                    <div class="font-mono text-gray-900 dark:text-gray-100">
                      {selectedComponent.vnodeInfo.nodeType ?? (
                        <span class="text-gray-400 italic">none</span>
                      )}
                    </div>

                    <div class="text-gray-500 dark:text-gray-400">Children</div>
                    <div class="font-mono text-gray-900 dark:text-gray-100">
                      {selectedComponent.vnodeInfo.childrenCount}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div class="flex h-full items-center justify-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Select a component to inspect
            </p>
          </div>
        )}
      </div>
    );
  }
}
