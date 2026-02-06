import type { ComponentType } from '~/constants';

/** Unique component identifier */
export type ComponentId = string;

/** Serialized component information */
export interface ComponentInfo {
  /** Unique component ID */
  id: ComponentId;
  /** Component name (class name or function name) */
  name: string;
  /** Component type */
  type: ComponentType;
  /** Parent component ID */
  parentId?: ComponentId;
  /** Child component IDs */
  children: ComponentId[];
  /** Component props (serialized) */
  props: Record<string, any>;
  /** Component state (for class components) */
  state?: Record<string, any>;
  /** Component refs */
  refs?: Record<string, any>;
  /** DOM node type (for element nodes) */
  tagName?: string;
  /** Text content (for text nodes) */
  textContent?: string;
  /** Source file path (if available) */
  filePath?: string;
  /** Line number in source file */
  lineNumber?: number;
  /** Whether component is currently mounted */
  isMounted: boolean;
  /** Mount timestamp */
  mountedAt?: number;
  /** Update count */
  updateCount: number;
  /** Last update timestamp */
  lastUpdatedAt?: number;
  /** DOM element bounds (for highlighting) */
  bounds?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  /** Instance data (grouped: Framework, Computed, Properties) */
  instanceData?: Record<string, any>;
  /** Context data (provided + injected via provideContext/getContext) */
  contextData?: Record<string, any>;
  /** VNode metadata */
  vnodeInfo?: {
    type: string;
    hasRender: boolean;
    nodeType: string | null;
    childrenCount: number;
  };
}

/** Component tree structure */
export interface ComponentTree {
  /** Root component IDs */
  roots: ComponentId[];
  /** Component map (id -> info) */
  components: Map<ComponentId, ComponentInfo>;
  /** Total component count */
  count: number;
}
