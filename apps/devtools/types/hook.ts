import type { ComponentId, ComponentTree } from './components.js';
import type { RouterInfo } from './router.js';
import type { StoreId, StoreInfo } from './stores.js';

/** Hook API exposed to page */
export interface DevToolsHook {
  /** Hook version */
  version: string;

  /** Registered event listeners */
  listeners: Map<string, Set<(data: any) => void>>;

  /** Subscribe to events */
  on(event: string, callback: (data: any) => void): () => void;

  /** Emit event */
  emit(event: string, data: any): void;

  /** Get component tree */
  getComponentTree(): ComponentTree;

  /** Get stores */
  getStores(): Map<StoreId, StoreInfo>;

  /** Get router info */
  getRouterInfo(): RouterInfo | null;

  /** Inspect element */
  inspectElement(element: Element): ComponentId | null;
}

// ============================================================================
// Global Type Augmentation
// ============================================================================

declare global {
  interface Window {
    [key: string]: any;
    __FUKICT_DEVTOOLS_HOOK__?: DevToolsHook;
  }
}
