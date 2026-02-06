/**
 * DevTools Panel Store
 */
import type { ComponentInfo, RouterInfo, StoreInfo } from '~/types/index.js';

import { defineStore } from '@fukict/flux';

interface DevToolsState {
  // Use plain objects instead of Map for better reactivity
  components: Record<string, ComponentInfo>;
  stores: Record<string, StoreInfo>;
  router: RouterInfo | null;
  /** Set by inspect picker to select a component in the panel */
  pendingSelectId: string | null;
  /** Set by cross-panel navigation (e.g. "reveal in components") */
  pendingTab: string | null;
  /** Currently selected component ID in Components panel */
  selectedComponentId: string | null;
  /** Currently selected store ID in Stores panel */
  selectedStoreId: string | null;
  /** Currently selected route path in Router panel */
  selectedRoutePath: string | null;
}

export const devtoolsStore = defineStore({
  scope: 'devtools',

  state: {
    components: {},
    stores: {},
    router: null,
    pendingSelectId: null,
    pendingTab: null,
    selectedComponentId: null,
    selectedStoreId: null,
    selectedRoutePath: null,
  } as DevToolsState,

  asyncActions: {
    async refreshTrees(ctx: any) {
      console.log('[Fukict DevTools] refreshTrees called');
      const tabId = chrome.devtools.inspectedWindow.tabId;
      console.log('[Fukict DevTools] Requesting component tree for tab', tabId);
      const response = await chrome.runtime.sendMessage({
        type: 'GET_COMPONENT_TREE',
        tabId,
      });
      console.log('[Fukict DevTools] Got component tree response:', response);
      if (response?.tree?.components) {
        // Convert Map to plain object if needed
        const components =
          response.tree.components instanceof Map
            ? Object.fromEntries(response.tree.components)
            : response.tree.components;
        ctx.setState({ components });
      }
    },

    async refreshStores(ctx: any) {
      console.log('[Fukict DevTools] refreshStores called');
      const tabId = chrome.devtools.inspectedWindow.tabId;
      const response = await chrome.runtime.sendMessage({
        type: 'GET_STORES',
        tabId,
      });
      console.log('[Fukict DevTools] Got stores response:', response);
      if (response?.stores) {
        // Convert Map to plain object if needed
        const stores =
          response.stores instanceof Map
            ? Object.fromEntries(response.stores)
            : response.stores;
        ctx.setState({ stores });
      }
    },

    async refreshRouter(ctx: any) {
      console.log('[Fukict DevTools] refreshRouter called');
      const tabId = chrome.devtools.inspectedWindow.tabId;
      const response = await chrome.runtime.sendMessage({
        type: 'GET_ROUTER_INFO',
        tabId,
      });
      console.log('[Fukict DevTools] Got router response:', response);
      if (response?.router) {
        ctx.setState({ router: response.router });
      }
    },

    async refreshAll(ctx: any) {
      console.log('[Fukict DevTools] refreshAll called');
      const tabId = chrome.devtools.inspectedWindow.tabId;
      console.log('[Fukict DevTools] Tab ID:', tabId);

      try {
        const [componentsRes, storesRes, routerRes] = await Promise.all([
          chrome.runtime.sendMessage({ type: 'GET_COMPONENT_TREE', tabId }),
          chrome.runtime.sendMessage({ type: 'GET_STORES', tabId }),
          chrome.runtime.sendMessage({ type: 'GET_ROUTER_INFO', tabId }),
        ]);

        console.log('[Fukict DevTools] refreshAll responses:', {
          components: componentsRes,
          stores: storesRes,
          router: routerRes,
        });

        // Convert Maps to plain objects if needed
        const components =
          componentsRes?.tree?.components instanceof Map
            ? Object.fromEntries(componentsRes.tree.components)
            : (componentsRes?.tree?.components ?? {});

        const stores =
          storesRes?.stores instanceof Map
            ? Object.fromEntries(storesRes.stores)
            : (storesRes?.stores ?? {});

        ctx.setState({
          components,
          stores,
          router: routerRes?.router ?? null,
        });
      } catch (error) {
        console.error('[Fukict DevTools] refreshAll error:', error);
      }
    },
  },
});
