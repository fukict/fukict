/// <reference path="../.wxt/wxt.d.ts" />
/**
 * Fukict DevTools Hook
 *
 * This script is injected into the page context BEFORE any application code runs.
 * It intercepts Fukict framework APIs to collect component tree, store, and router data.
 *
 * Communication flow: Hook (page) → Content Script (bridge) → Background → Panel
 */
import { HOOK_NAME, MESSAGE_SOURCE, MESSAGE_TYPE } from '~/constants';
import type { DevToolsHook } from '~/types';
import {
  buildComponentTreeFromRoot,
  removeRoot,
  rescanComponentTree,
} from '~/utils/hook/component-tracker';
import { handleMessageFromDevTools } from '~/utils/hook/handlers';
import {
  trackRouteChange,
  trackRouterRegistration,
} from '~/utils/hook/router-tracker';
import {
  createTrackStoreStateChange,
  trackStoreAction,
  trackStoreRegistration,
} from '~/utils/hook/store-tracker';
import type { HookContext, HookState } from '~/utils/hook/types';
import { createLogger } from '~/utils/logger';
import { createMessage } from '~/utils/messaging';

export default defineUnlistedScript(() => {
  const logger = createLogger('Hook');

  // ============================================================================
  // Shared State
  // ============================================================================

  const state: HookState = {
    componentTree: {
      roots: [],
      components: new Map(),
      count: 0,
    },
    componentInstanceMap: new Map(),
    functionComponentVNodeMap: new Map(),
    fcSiblingCounters: new Map(),
    stores: new Map(),
    routerInfo: null,
    rootEntries: [],
    listeners: new Map(),
  };

  function sendToDevTools(type: string, payload: any = {}): void {
    const message = createMessage(
      type as any,
      MESSAGE_SOURCE.HOOK,
      payload as any,
    );
    window.postMessage(message, '*');
  }

  const ctx: HookContext = { state, logger, sendToDevTools };

  // ============================================================================
  // Utilities
  // ============================================================================

  function debounce(func: () => void, wait: number): () => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func();
        timeout = null;
      }, wait);
    };
  }

  // ============================================================================
  // Hook API
  // ============================================================================

  function createHookAPI(): DevToolsHook {
    return {
      version: '0.1.0',
      listeners: state.listeners,

      on(event: string, callback: (data: any) => void): () => void {
        if (!state.listeners.has(event)) {
          state.listeners.set(event, new Set());
        }
        state.listeners.get(event)!.add(callback);
        return () => {
          state.listeners.get(event)?.delete(callback);
        };
      },

      emit(event: string, data: any): void {
        const callbacks = state.listeners.get(event);
        if (callbacks) {
          for (const callback of callbacks) {
            try {
              callback(data);
            } catch (error) {
              logger.error('Event callback error:', error);
            }
          }
        }
      },

      getComponentTree: () => state.componentTree,
      getStores: () => state.stores,
      getRouterInfo: () => state.routerInfo,

      inspectElement(_element: Element) {
        // TODO: Find component instance from DOM element
        return null;
      },
    };
  }

  // ============================================================================
  // Installation
  // ============================================================================

  function installHook(): void {
    if (window[HOOK_NAME]) {
      logger.warn('Hook already installed');
      return;
    }

    const hook = createHookAPI();
    Object.defineProperty(window, HOOK_NAME, {
      value: hook,
      writable: false,
      configurable: false,
      enumerable: true,
    });

    // Listen for messages from DevTools panel
    window.addEventListener('message', event =>
      handleMessageFromDevTools(ctx, event),
    );

    // Listen for framework root attachment via standard CustomEvent
    // (framework dispatches 'fukict:attach' in dev mode, no direct coupling)
    window.addEventListener('fukict:attach', ((
      e: CustomEvent<{ vnode: any; container: Element }>,
    ) => {
      const { vnode, container } = e.detail;
      buildComponentTreeFromRoot(ctx, vnode, container);

      // Watch for DOM changes to rescan component tree
      const debouncedRescan = debounce(() => rescanComponentTree(ctx), 300);

      const observer = new MutationObserver(mutations => {
        const hasRelevantChanges = mutations.some(
          mutation =>
            mutation.type === 'childList' &&
            (mutation.addedNodes.length > 0 ||
              mutation.removedNodes.length > 0),
        );
        if (hasRelevantChanges) {
          logger.log('DOM mutations detected, scheduling rescan');
          debouncedRescan();
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      logger.log('MutationObserver set up for', container);
    }) as EventListener);

    // Listen for root detachment (unmount)
    window.addEventListener('fukict:detach', ((
      e: CustomEvent<{ vnode: any; container: Element }>,
    ) => {
      const { vnode, container } = e.detail;
      removeRoot(ctx, vnode, container);
      logger.log('Root detached');
    }) as EventListener);

    // Listen for store registration
    window.addEventListener('fukict:store', ((
      e: CustomEvent<{ scope: string; store: any }>,
    ) => {
      const { store } = e.detail;
      trackStoreRegistration(ctx, { ...store, scope: e.detail.scope });
    }) as EventListener);

    // Listen for store state changes
    const trackStateChange = createTrackStoreStateChange(ctx);
    window.addEventListener('fukict:store:state', ((
      e: CustomEvent<{ storeId: string; prevState: any; nextState: any }>,
    ) => {
      trackStateChange(
        e.detail.storeId,
        e.detail.prevState,
        e.detail.nextState,
      );
    }) as EventListener);

    // Listen for store action dispatches
    window.addEventListener('fukict:store:action', ((
      e: CustomEvent<{ storeId: string; actionName: string; args: any[] }>,
    ) => {
      trackStoreAction(
        ctx,
        e.detail.storeId,
        e.detail.actionName,
        e.detail.args,
      );
    }) as EventListener);

    // Listen for router registration
    window.addEventListener('fukict:router', ((
      e: CustomEvent<{ router: any; mode: string; routes: any[] }>,
    ) => {
      const { router, mode, routes } = e.detail;
      trackRouterRegistration(ctx, {
        mode,
        currentRoute: router.currentRoute,
        routes,
      });
    }) as EventListener);

    // Listen for route changes
    window.addEventListener('fukict:route', ((
      e: CustomEvent<{ from: any; to: any; type?: 'push' | 'replace' | 'pop' }>,
    ) => {
      trackRouteChange(ctx, e.detail.from, e.detail.to, e.detail.type);
    }) as EventListener);

    // Listen for router destroy
    window.addEventListener('fukict:router:destroy', () => {
      ctx.state.routerInfo = null;
      ctx.sendToDevTools(MESSAGE_TYPE.ROUTER_INFO_DATA, { router: null });
    });

    // If framework already attached before hook loaded, pick up existing roots
    if (window.__FUKICT__?.roots?.length) {
      for (const root of window.__FUKICT__.roots) {
        buildComponentTreeFromRoot(ctx, root.vnode, root.container);
      }
      logger.log('Picked up existing roots:', window.__FUKICT__.roots.length);
    }

    // Pick up existing stores
    if (window.__FUKICT__?.stores?.length) {
      for (const entry of window.__FUKICT__.stores) {
        trackStoreRegistration(ctx, { ...entry.store, scope: entry.scope });
      }
      logger.log('Picked up existing stores:', window.__FUKICT__.stores.length);
    }

    // Pick up existing router
    if (window.__FUKICT__?.router) {
      const { instance, mode, routes } = window.__FUKICT__.router;
      trackRouterRegistration(ctx, {
        mode,
        currentRoute: instance.currentRoute,
        routes,
      });
      logger.log('Picked up existing router');
    }

    // Notify that hook is ready
    sendToDevTools(MESSAGE_TYPE.HOOK_READY, { version: hook.version });
    logger.log('Hook installed and ready');
  }

  // Install hook immediately
  installHook();
});
