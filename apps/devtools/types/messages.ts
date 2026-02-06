import type { MessageSource, MessageType } from '~/constants';

import type { ComponentId, ComponentInfo } from './components.js';
import type { RouteInfo, RouterInfo } from './router.js';
import type { StoreAction, StoreId, StoreInfo } from './stores.js';

// ============================================================================
// Base Message Structure
// ============================================================================

/** Base message structure for all communications */
export interface BaseMessage {
  /** Message type identifier */
  type: MessageType;
  /** Message source */
  source: MessageSource;
  /** Timestamp */
  timestamp?: number;
}

// ============================================================================
// Lifecycle Messages
// ============================================================================

export interface PanelInitMessage extends BaseMessage {
  type: 'PANEL_INIT';
  /** Tab ID being inspected */
  tabId: number;
}

export interface HookReadyMessage extends BaseMessage {
  type: 'HOOK_READY';
  /** Fukict version detected */
  version?: string;
}

export interface FukictDetectedMessage extends BaseMessage {
  type: 'FUKICT_DETECTED';
  /** Framework metadata */
  metadata?: {
    version?: string;
    hasRouter?: boolean;
    hasFlux?: boolean;
  };
}

// ============================================================================
// Component Messages
// ============================================================================

export interface ComponentAddedMessage extends BaseMessage {
  type: 'COMPONENT_ADDED';
  /** Component info */
  component: ComponentInfo;
}

export interface ComponentRemovedMessage extends BaseMessage {
  type: 'COMPONENT_REMOVED';
  /** Component ID */
  componentId: ComponentId;
}

export interface ComponentUpdatedMessage extends BaseMessage {
  type: 'COMPONENT_UPDATED';
  /** Component ID */
  componentId: ComponentId;
  /** Updated fields */
  updates: Partial<ComponentInfo>;
}

export interface GetComponentTreeMessage extends BaseMessage {
  type: 'GET_COMPONENT_TREE';
}

export interface ComponentTreeDataMessage extends BaseMessage {
  type: 'COMPONENT_TREE_DATA';
  /** Serialized component tree */
  tree: {
    roots: ComponentId[];
    components: Record<ComponentId, ComponentInfo>;
    count: number;
  };
}

// ============================================================================
// Store Messages
// ============================================================================

export interface StoreRegisteredMessage extends BaseMessage {
  type: 'STORE_REGISTERED';
  /** Store info */
  store: StoreInfo;
}

export interface StoreStateChangedMessage extends BaseMessage {
  type: 'STORE_STATE_CHANGED';
  /** Store ID */
  storeId: StoreId;
  /** Previous state */
  prevState: Record<string, any>;
  /** New state */
  nextState: Record<string, any>;
  /** State diff (optional optimization) */
  diff?: any;
}

export interface StoreActionDispatchedMessage extends BaseMessage {
  type: 'STORE_ACTION_DISPATCHED';
  /** Store ID */
  storeId: StoreId;
  /** Action record */
  action: StoreAction;
}

export interface GetStoresMessage extends BaseMessage {
  type: 'GET_STORES';
}

export interface StoresDataMessage extends BaseMessage {
  type: 'STORES_DATA';
  /** All stores */
  stores: Record<StoreId, StoreInfo>;
}

export interface UpdateStoreStateMessage extends BaseMessage {
  type: 'UPDATE_STORE_STATE';
  /** Store ID */
  storeId: StoreId;
  /** New state */
  state: Record<string, any>;
}

// ============================================================================
// Router Messages
// ============================================================================

export interface RouterRegisteredMessage extends BaseMessage {
  type: 'ROUTER_REGISTERED';
  /** Router info */
  router: RouterInfo;
}

export interface RouteChangedMessage extends BaseMessage {
  type: 'ROUTE_CHANGED';
  /** Previous route */
  from: RouteInfo;
  /** New route */
  to: RouteInfo;
}

export interface NavigationMessage extends BaseMessage {
  type: 'NAVIGATION';
  /** Navigation record */
  navigation: import('./router.js').NavigationRecord;
}

export interface GetRouterInfoMessage extends BaseMessage {
  type: 'GET_ROUTER_INFO';
}

export interface RouterInfoDataMessage extends BaseMessage {
  type: 'ROUTER_INFO_DATA';
  /** Router info */
  router: RouterInfo | null;
}

// ============================================================================
// Interaction Messages
// ============================================================================

export interface StartInspectMessage extends BaseMessage {
  type: 'START_INSPECT';
}

export interface StopInspectMessage extends BaseMessage {
  type: 'STOP_INSPECT';
}

export interface HighlightComponentMessage extends BaseMessage {
  type: 'HIGHLIGHT_COMPONENT';
  /** Component ID to highlight */
  componentId: ComponentId;
}

export interface UnhighlightComponentMessage extends BaseMessage {
  type: 'UNHIGHLIGHT_COMPONENT';
}

export interface SelectComponentMessage extends BaseMessage {
  type: 'SELECT_COMPONENT';
  /** Component ID to select */
  componentId: ComponentId;
}

export interface ScrollToComponentMessage extends BaseMessage {
  type: 'SCROLL_TO_COMPONENT';
  /** Component ID to scroll to */
  componentId: ComponentId;
}

// ============================================================================
// Error Messages
// ============================================================================

export interface ErrorMessage extends BaseMessage {
  type: 'ERROR';
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Original message that caused error */
  originalMessage?: any;
}

// ============================================================================
// Union Types
// ============================================================================

/** All possible message types */
export type DevToolsMessage =
  | PanelInitMessage
  | HookReadyMessage
  | FukictDetectedMessage
  | ComponentAddedMessage
  | ComponentRemovedMessage
  | ComponentUpdatedMessage
  | GetComponentTreeMessage
  | ComponentTreeDataMessage
  | StoreRegisteredMessage
  | StoreStateChangedMessage
  | StoreActionDispatchedMessage
  | GetStoresMessage
  | StoresDataMessage
  | UpdateStoreStateMessage
  | RouterRegisteredMessage
  | RouteChangedMessage
  | NavigationMessage
  | GetRouterInfoMessage
  | RouterInfoDataMessage
  | StartInspectMessage
  | StopInspectMessage
  | HighlightComponentMessage
  | UnhighlightComponentMessage
  | SelectComponentMessage
  | ScrollToComponentMessage
  | ErrorMessage;
