/** Component type identifiers */
export const COMPONENT_TYPE = {
  /** Class component (extends Fukict) */
  CLASS: 'class',
  /** Function component (defineFukict) */
  FUNCTION: 'function',
  /** Native DOM element */
  ELEMENT: 'element',
  /** Text node */
  TEXT: 'text',
  /** Fragment */
  FRAGMENT: 'fragment',
} as const;

export type ComponentType =
  (typeof COMPONENT_TYPE)[keyof typeof COMPONENT_TYPE];

/** Store action type identifiers */
export const STORE_ACTION_TYPE = {
  /** Sync action */
  SYNC: 'sync',
  /** Async action */
  ASYNC: 'async',
} as const;

export type StoreActionType =
  (typeof STORE_ACTION_TYPE)[keyof typeof STORE_ACTION_TYPE];
