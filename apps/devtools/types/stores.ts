import type { StoreActionType } from '~/constants';

/** Unique store identifier */
export type StoreId = string;

/** Store action record */
export interface StoreAction {
  /** Action name */
  name: string;
  /** Action type (sync/async) */
  type: StoreActionType;
  /** Arguments passed to action */
  args: any[];
  /** Timestamp */
  timestamp: number;
  /** Duration (ms) */
  duration?: number;
  /** Result/Error */
  result?: any;
  error?: any;
}

/** Store information */
export interface StoreInfo {
  /** Store scope */
  scope: StoreId;
  /** Store name/identifier */
  name: string;
  /** Current state (serialized) */
  state: Record<string, any>;
  /** Available actions */
  actions: {
    sync: string[];
    async: string[];
  };
  /** Action history */
  history: StoreAction[];
  /** Subscriber count */
  subscriberCount: number;
  /** Creation timestamp */
  createdAt: number;
}
