/** Route tree node (preserves children hierarchy) */
export interface RouteTreeNode {
  /** Route path pattern */
  path: string;
  /** Route name */
  name?: string;
  /** Component name */
  component?: string;
  /** Child routes */
  children?: RouteTreeNode[];
}

/** Matched route entry with depth info */
export interface MatchedRouteEntry {
  /** Route path pattern */
  path: string;
  /** Component name */
  component?: string;
  /** Nesting depth (0 = root) */
  depth: number;
}

/** Route information */
export interface RouteInfo {
  /** Route path pattern */
  path: string;
  /** Route name */
  name?: string;
  /** Path parameters */
  params: Record<string, string>;
  /** Query parameters */
  query: Record<string, string>;
  /** Hash fragment */
  hash: string;
  /** Full URL */
  fullPath: string;
  /** Matched route entries with depth */
  matched: MatchedRouteEntry[];
}

/** Router navigation record */
export interface NavigationRecord {
  /** From route */
  from: RouteInfo;
  /** To route */
  to: RouteInfo;
  /** Navigation timestamp */
  timestamp: number;
  /** Navigation type */
  type: 'push' | 'replace' | 'pop';
}

/** Router information */
export interface RouterInfo {
  /** Router mode (hash/history) */
  mode: 'hash' | 'history';
  /** Current route */
  currentRoute: RouteInfo;
  /** All registered routes (tree structure) */
  routes: RouteTreeNode[];
  /** Navigation history */
  history: NavigationRecord[];
}
