/**
 * Dev-mode utilities for Fukict ecosystem packages.
 *
 * Provides a unified API for registering dev context on `window.__FUKICT__`.
 * Only active in dev mode (process.env.NODE_ENV !== 'production').
 */
import { METADATA } from './metadata.js';
import { FukictDevInfo } from './types';

/**
 * Get or initialize the global dev info object.
 * Returns `undefined` in production or non-browser environments.
 */
export function getDevInfo(): FukictDevInfo | undefined {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    if (!window.__FUKICT__) {
      window.__FUKICT__ = { version: METADATA.version, roots: [] };
    }
    return window.__FUKICT__;
  }
  return undefined;
}

/**
 * Register ecosystem package dev context onto `window.__FUKICT__`.
 *
 * @param key - Context key (e.g. 'stores', 'router')
 * @param value - Context value
 * @returns The dev info object, or `undefined` if not in dev mode
 *
 * @example
 * ```typescript
 * // In @fukict/flux
 * import { registerDevContext } from '@fukict/basic';
 * registerDevContext('stores', []);
 *
 * // In @fukict/router
 * import { registerDevContext } from '@fukict/basic';
 * registerDevContext('router', { instance: this, mode, routes });
 * ```
 */
export function registerDevContext(
  key: string,
  value: unknown,
): FukictDevInfo | undefined {
  const devInfo = getDevInfo();
  if (devInfo) {
    devInfo[key] = value;
  }
  return devInfo;
}
