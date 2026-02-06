/** DevTools configuration options */
export const CONFIG = {
  /** Maximum component tree depth to collect */
  MAX_TREE_DEPTH: 1000,

  /** Maximum number of props to serialize per component */
  MAX_PROPS_DEPTH: 8,

  /** Maximum string length for serialization */
  MAX_STRING_LENGTH: 500,

  /** Throttle interval for tree updates (ms) */
  TREE_UPDATE_THROTTLE: 100,

  /** Throttle interval for store updates (ms) */
  STORE_UPDATE_THROTTLE: 50,

  /** Maximum store history size */
  MAX_STORE_HISTORY: 50,

  /** Highlight overlay z-index */
  HIGHLIGHT_Z_INDEX: 999999,

  /** Highlight border width (px) */
  HIGHLIGHT_BORDER_WIDTH: 2,

  /** Highlight border color */
  HIGHLIGHT_BORDER_COLOR: '#3b82f6',

  /** Highlight background color */
  HIGHLIGHT_BG_COLOR: 'rgba(59, 130, 246, 0.1)',

  /** Enable verbose logging */
  VERBOSE_LOGGING: true,
} as const;

/** Logger prefix for consistent logging */
export const LOGGER_PREFIX = '[Fukict DevTools]';
