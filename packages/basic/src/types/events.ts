/**
 * @fukict/runtime - Event Types
 *
 * Comprehensive event handler types with on: prefix
 */

/**
 * Event handler type with on: prefix
 * Maps all HTMLElementEventMap events to on: prefixed handlers
 * Supports both synchronous and asynchronous handlers
 */
export type EventHandlers = {
  [K in keyof HTMLElementEventMap as `on:${K}`]?: (
    event: HTMLElementEventMap[K],
  ) => void | Promise<void>;
};
