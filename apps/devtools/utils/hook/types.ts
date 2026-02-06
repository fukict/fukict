/**
 * Shared types for hook modules
 */
import type {
  ComponentId,
  ComponentInfo,
  ComponentTree,
  RouterInfo,
  StoreId,
  StoreInfo,
} from '~/types';
import type { createLogger } from '~/utils/logger';

/** A single root attachment */
export interface RootEntry {
  vnode: any;
  container: Element;
}

/** Mutable state shared across all hook modules */
export interface HookState {
  componentTree: ComponentTree;
  componentInstanceMap: Map<ComponentId, any>;
  functionComponentVNodeMap: Map<ComponentId, any>;
  fcSiblingCounters: Map<string, number>;
  stores: Map<StoreId, StoreInfo>;
  routerInfo: RouterInfo | null;
  /** All attached root vnodes (supports multi-root apps) */
  rootEntries: RootEntry[];
  listeners: Map<string, Set<(data: any) => void>>;
}

/** Context object passed to hook module functions */
export interface HookContext {
  state: HookState;
  logger: ReturnType<typeof createLogger>;
  sendToDevTools: (type: string, payload?: any) => void;
}

export type {
  ComponentId,
  ComponentInfo,
  ComponentTree,
  RouterInfo,
  StoreId,
  StoreInfo,
};
