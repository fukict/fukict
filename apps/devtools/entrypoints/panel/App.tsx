/**
 * DevTools Panel Root Component
 */
import { cn } from '~/utils/cn.js';

import { Fukict } from '@fukict/basic';

import { cva } from 'class-variance-authority';

import SplitPane from './components/SplitPane.js';
import { devtoolsStore } from './stores/devtoolsStore.js';
import { ComponentsDetail, ComponentsSidebar } from './views/ComponentsView.js';
import { RouterDetail, RouterSidebar } from './views/RouterView.js';
import { StoresDetail, StoresSidebar } from './views/StoresView.js';

type Tab = 'components' | 'stores' | 'router';

const tabVariants = cva(
  'px-5 py-3 border-none bg-transparent cursor-pointer text-xs font-medium transition-all border-b-2 border-transparent',
  {
    variants: {
      active: {
        true: 'text-blue-600 dark:text-blue-400 border-b-blue-600 dark:border-b-blue-400 bg-white dark:bg-gray-900',
        false:
          'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export default class App extends Fukict {
  private currentTab: Tab = 'components';
  private connected = false;
  private fukictDetected = false;
  private port: chrome.runtime.Port | null = null;
  private unsubscribeStore?: () => void;

  mounted(): void {
    this.setupConnection();

    // Listen for cross-panel navigation (e.g. "reveal in components" from Router panel)
    this.unsubscribeStore = devtoolsStore.subscribe(() => {
      const { pendingTab } = devtoolsStore.getState();
      if (pendingTab && pendingTab !== this.currentTab) {
        this.switchTab(pendingTab as Tab);
        devtoolsStore.setState({ pendingTab: null });
      } else if (pendingTab) {
        devtoolsStore.setState({ pendingTab: null });
      }
    });
  }

  beforeUnmount(): void {
    this.unsubscribeStore?.();
    this.cleanupConnection();
  }

  private setupConnection(): void {
    try {
      console.log('[Fukict DevTools] Attempting to connect to background...');

      // Check if extension context is valid
      if (!chrome.runtime?.id) {
        console.error(
          '[Fukict DevTools] Extension context invalidated. Please close and reopen DevTools.',
        );
        this.connected = false;
        this.fukictDetected = false;
        this.update();
        return;
      }

      // Connect to background worker
      this.port = chrome.runtime.connect({ name: 'fukict-devtools-panel' });

      console.log('[Fukict DevTools] Port created:', this.port);

      // Set up disconnect handler first
      this.port.onDisconnect.addListener(() => {
        console.log('[Fukict DevTools] Port disconnected');
        this.connected = false;
        this.port = null;
        this.update();

        // Check for errors
        if (chrome.runtime.lastError) {
          console.error(
            '[Fukict DevTools] Disconnect error:',
            chrome.runtime.lastError,
          );
        }

        // Retry connection after 1 second
        setTimeout(() => {
          if (!this.port) {
            console.log('[Fukict DevTools] Retrying connection...');
            this.setupConnection();
          }
        }, 1000);
      });

      // Set up message listener
      this.port.onMessage.addListener(message => {
        console.log('[Fukict DevTools] Received message:', message.type);

        if (message.type === 'FUKICT_DETECTED') {
          this.fukictDetected = true;
          this.update();
        }

        if (
          message.type === 'COMPONENT_ADDED' ||
          message.type === 'COMPONENT_REMOVED' ||
          message.type === 'COMPONENT_UPDATED' ||
          message.type === 'COMPONENT_TREE_DATA'
        ) {
          devtoolsStore.asyncActions.refreshTrees().catch(error => {
            console.error('[Fukict DevTools] refreshTrees failed:', error);
          });
        }

        if (
          message.type === 'STORE_REGISTERED' ||
          message.type === 'STORE_STATE_CHANGED' ||
          message.type === 'STORE_ACTION_DISPATCHED'
        ) {
          devtoolsStore.asyncActions.refreshStores().catch(error => {
            console.error('[Fukict DevTools] refreshStores failed:', error);
          });
        }

        if (message.type === 'SELECT_COMPONENT' && message.componentId) {
          devtoolsStore.setState({ pendingSelectId: message.componentId });
        }

        if (
          message.type === 'ROUTER_REGISTERED' ||
          message.type === 'ROUTE_CHANGED' ||
          message.type === 'NAVIGATION'
        ) {
          devtoolsStore.asyncActions.refreshRouter().catch(error => {
            console.error('[Fukict DevTools] refreshRouter failed:', error);
          });
        }
      });

      // Send PANEL_INIT message
      this.port.postMessage({
        type: 'PANEL_INIT',
        tabId: chrome.devtools.inspectedWindow.tabId,
      });

      console.log(
        '[Fukict DevTools] PANEL_INIT sent for tab',
        chrome.devtools.inspectedWindow.tabId,
      );

      this.connected = true;
      this.update();

      // Initial data fetch
      console.log('[Fukict DevTools] Calling refreshAll...');
      devtoolsStore.asyncActions
        .refreshAll()
        .then(() => {
          console.log('[Fukict DevTools] refreshAll completed');
        })
        .catch(error => {
          console.error('[Fukict DevTools] refreshAll failed:', error);
        });
    } catch (error) {
      console.error('[Fukict DevTools] Failed to setup connection:', error);
      this.connected = false;
      this.update();

      // Check if it's an extension context invalidation error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('Extension context invalidated') ||
        errorMessage.includes('Cannot access')
      ) {
        console.error(
          '[Fukict DevTools] Extension was reloaded. Please close and reopen DevTools.',
        );
        return; // Don't retry on context invalidation
      }

      // Retry after 1 second for other errors
      setTimeout(() => {
        console.log('[Fukict DevTools] Retrying connection after error...');
        this.setupConnection();
      }, 1000);
    }
  }

  private cleanupConnection(): void {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }
  }

  private switchTab(tab: Tab): void {
    this.currentTab = tab;
    this.update();
  }

  private renderAside() {
    if (this.currentTab === 'components') return <ComponentsSidebar />;
    if (this.currentTab === 'stores') return <StoresSidebar />;
    if (this.currentTab === 'router') return <RouterSidebar />;
    return null;
  }

  private renderMain() {
    if (this.currentTab === 'components') return <ComponentsDetail />;
    if (this.currentTab === 'stores') return <StoresDetail />;
    if (this.currentTab === 'router') return <RouterDetail />;
    return null;
  }

  render() {
    if (!this.connected) {
      return (
        <div class="flex h-full flex-col items-center justify-center text-gray-600 dark:text-gray-400">
          <p>Disconnected from DevTools</p>
        </div>
      );
    }

    if (!this.fukictDetected) {
      return (
        <div class="flex h-full flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <p>Fukict not detected on this page.</p>
          <p class="text-xs">Make sure your app is using @fukict/basic.</p>
        </div>
      );
    }

    return (
      <div class="flex h-full flex-col">
        {/* Tab Bar */}
        <div class="flex border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <button
            class={cn(
              tabVariants({ active: this.currentTab === 'components' }),
            )}
            on:click={() => this.switchTab('components')}
          >
            Components
          </button>
          <button
            class={cn(tabVariants({ active: this.currentTab === 'stores' }))}
            on:click={() => this.switchTab('stores')}
          >
            Stores
          </button>
          <button
            class={cn(tabVariants({ active: this.currentTab === 'router' }))}
            on:click={() => this.switchTab('router')}
          >
            Router
          </button>
        </div>

        {/* Content — shared SplitPane skeleton */}
        <div class="flex-1 overflow-hidden">
          <SplitPane storageKey="fukict-devtools-sidebar-width">
            {this.renderAside()}
            {this.renderMain()}
          </SplitPane>
        </div>

        {/* Status Bar */}
        <div class="flex h-6 items-center border-t border-gray-200 bg-gray-50 px-4 text-[11px] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <span>Fukict DevTools v0.1.0</span>
        </div>
      </div>
    );
  }
}
