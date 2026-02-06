/** Message source identifiers for different parts of the extension */
export const MESSAGE_SOURCE = {
  /** Hook script running in page context */
  HOOK: 'fukict-devtools-hook',
  /** Content script (bridge) */
  CONTENT: 'fukict-devtools-content',
  /** DevTools panel */
  PANEL: 'fukict-devtools-panel',
  /** Background service worker */
  BACKGROUND: 'fukict-devtools-background',
} as const;

export type MessageSource =
  (typeof MESSAGE_SOURCE)[keyof typeof MESSAGE_SOURCE];

/** All message types used in the DevTools communication protocol */
export const MESSAGE_TYPE = {
  // ===== Lifecycle Messages =====
  /** Panel initialization */
  PANEL_INIT: 'PANEL_INIT',
  /** Hook ready signal */
  HOOK_READY: 'HOOK_READY',
  /** Fukict framework detected */
  FUKICT_DETECTED: 'FUKICT_DETECTED',
  /** Extension shutdown */
  SHUTDOWN: 'SHUTDOWN',

  // ===== Component Tree Messages =====
  /** Component mounted to tree */
  COMPONENT_ADDED: 'COMPONENT_ADDED',
  /** Component unmounted from tree */
  COMPONENT_REMOVED: 'COMPONENT_REMOVED',
  /** Component updated (props/state changed) */
  COMPONENT_UPDATED: 'COMPONENT_UPDATED',
  /** Request full component tree */
  GET_COMPONENT_TREE: 'GET_COMPONENT_TREE',
  /** Full component tree response */
  COMPONENT_TREE_DATA: 'COMPONENT_TREE_DATA',

  // ===== Store Messages =====
  /** New store registered */
  STORE_REGISTERED: 'STORE_REGISTERED',
  /** Store state changed */
  STORE_STATE_CHANGED: 'STORE_STATE_CHANGED',
  /** Store action dispatched */
  STORE_ACTION_DISPATCHED: 'STORE_ACTION_DISPATCHED',
  /** Request all stores data */
  GET_STORES: 'GET_STORES',
  /** All stores data response */
  STORES_DATA: 'STORES_DATA',
  /** Update store state from DevTools */
  UPDATE_STORE_STATE: 'UPDATE_STORE_STATE',

  // ===== Router Messages =====
  /** Router instance registered */
  ROUTER_REGISTERED: 'ROUTER_REGISTERED',
  /** Route changed */
  ROUTE_CHANGED: 'ROUTE_CHANGED',
  /** Navigation occurred */
  NAVIGATION: 'NAVIGATION',
  /** Request router info */
  GET_ROUTER_INFO: 'GET_ROUTER_INFO',
  /** Router info response */
  ROUTER_INFO_DATA: 'ROUTER_INFO_DATA',

  // ===== Interaction Messages =====
  /** Start inspect mode (click to select component) */
  START_INSPECT: 'START_INSPECT',
  /** Stop inspect mode */
  STOP_INSPECT: 'STOP_INSPECT',
  /** Highlight component on page */
  HIGHLIGHT_COMPONENT: 'HIGHLIGHT_COMPONENT',
  /** Remove highlight */
  UNHIGHLIGHT_COMPONENT: 'UNHIGHLIGHT_COMPONENT',
  /** Select component in DevTools */
  SELECT_COMPONENT: 'SELECT_COMPONENT',
  /** Scroll to component in page */
  SCROLL_TO_COMPONENT: 'SCROLL_TO_COMPONENT',

  // ===== Error Messages =====
  /** Error occurred */
  ERROR: 'ERROR',
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
