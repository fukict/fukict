/**
 * Global type declarations for Fukict dev-mode runtime info.
 *
 * Only the base structure is declared here. Ecosystem packages
 * extend `__FUKICT__` via the `registerDevContext` API from @fukict/basic.
 */

export interface FukictDevInfo {
  version: string;
  roots: Array<{ vnode: unknown; container: Element }>;
  /** Extensible by ecosystem packages via registerDevContext() */
  [key: string]: unknown;
}

declare global {
  interface Window {
    __FUKICT__?: FukictDevInfo;
  }
}
