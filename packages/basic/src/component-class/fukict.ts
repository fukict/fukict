/**
 * @fukict/basic - Fukict Class Component Base
 */
import { createRealNode } from '../renderer/create.js';
import { diff, removeNode } from '../renderer/diff/index.js';
import { activate } from '../renderer/mount.js';
import type { Ref, Slots } from '../types/class.js';
import type { ContextData } from '../types/context.js';
import type { VNode, VNodeChild } from '../types/core.js';
import type {
  FukictDetachAttribute,
  FukictRefAttribute,
  FukictSlotAttribute,
} from '../types/dom-attributes.js';
import { createImmutableProxy, getParentContext } from '../utils/context.js';

// Global component instance counter for unique IDs
let componentIdCounter = 0;

/**
 * Component children props
 * Note: TypeScript sees children as VNodeChild during JSX compilation,
 * but Babel transforms them to VNode[] at runtime
 */
export interface BaseProps {
  children?: VNodeChild | VNodeChild[];
}

/**
 * Complete props type for Fukict components (including all fukict attributes)
 */
export type FukictComponentProps<P extends Record<string, any>> = P &
  BaseProps &
  FukictRefAttribute &
  FukictSlotAttribute &
  FukictDetachAttribute;

/**
 * Fukict class component base class
 *
 * @example Basic usage with self-update
 * ```ts
 * class Counter extends Fukict<{ initial: number }> {
 *   private count: number;
 *
 *   constructor(props, children) {
 *     super(props, children);
 *     this.count = props.initial;
 *   }
 *
 *   increment() {
 *     this.count++;
 *     // Self-update: manually trigger re-render
 *     this.update();
 *   }
 *
 *   render() {
 *     return <div on:click={() => this.increment()}>{this.count}</div>;
 *   }
 * }
 * ```
 *
 * @example Custom update logic
 * ```ts
 * class OptimizedComponent extends Fukict<{ data: string }> {
 *   update(newProps) {
 *     // Custom logic: skip update if data hasn't changed
 *     if (newProps.data === this.props.data) return;
 *     super.update(newProps);
 *   }
 * }
 * ```
 */
export abstract class Fukict<
  P extends Record<string, any> = {},
  S extends Slots = Slots,
> {
  /**
   * Component type marker for Babel plugin
   * @internal
   */
  static readonly __COMPONENT_TYPE__ = 'class' as const;

  /**
   * Unique component instance ID (for debugging)
   * @internal
   */
  readonly __id__: number;

  /**
   * Component name (for debugging)
   * @internal
   */
  readonly __name__: string;

  /**
   * Component props (readonly)
   * Automatically includes optional children property and fukict attributes
   */
  protected readonly props: FukictComponentProps<P>;

  /**
   * Component slots (extracted by renderer)
   *
   * Note: Slots are not available when component is manually instantiated
   * or in detached rendering mode (fukict:detach).
   */
  protected slots: S;

  /**
   * Refs map (shared with framework and user)
   */
  readonly refs: Map<string | symbol, Ref>;

  /**
   * Current rendered VNode (component's internal render result)
   * @internal
   */
  __vnode__: VNode | null;

  /**
   * Wrapper VNode (ClassComponentVNode that wraps this instance in parent's tree)
   * Used for context traversal - child can access parent's context via __wrapper__
   * @internal
   */
  __wrapper__: VNode | null;

  /**
   * Parent DOM container
   * @internal
   */
  __container__: Element | null;

  /**
   * Component placeholder (in container mode)
   * @internal
   */
  __placeholder__: Comment | null;

  /**
   * Lifecycle execution flags (prevent re-entrant calls during lifecycle)
   * @internal
   */
  __inUpdating__: boolean;
  __inMounting__: boolean;
  __inUnmounting__: boolean;

  /**
   * Constructor
   */
  constructor(props: FukictComponentProps<P>) {
    this.__id__ = ++componentIdCounter;
    this.__name__ = this.constructor.name;
    this.props = props;
    this.slots = {} as S;

    // Initialize instance fields (avoid field initializers for better memory efficiency)
    this.refs = new Map();
    this.__vnode__ = null;
    this.__wrapper__ = null;
    this.__container__ = null;
    this.__placeholder__ = null;
    this.__inUpdating__ = false;
    this.__inMounting__ = false;
    this.__inUnmounting__ = false;

    // Note: Do NOT call render() here!
    // render() will be called in mount() after subclass constructor completes
  }

  /**
   * Render method (must be implemented by subclass)
   */
  abstract render(): VNode;

  /**
   * Provide context value at current component level
   *
   * Only available in Class Components. Context is stored on VNode tree
   * with no global state. Lower-level contexts override parent contexts.
   *
   * @param key - Context key (Symbol or string)
   * @param value - Context value (will be wrapped in Proxy for immutability)
   *
   * @example
   * ```ts
   * import { THEME_CONTEXT, type ThemeContext } from './contexts';
   *
   * class App extends Fukict {
   *   mounted() {
   *     this.provideContext<ThemeContext>(THEME_CONTEXT, {
   *       mode: 'dark',
   *       color: '#000',
   *     });
   *   }
   * }
   * ```
   */
  protected provideContext<T>(key: string | symbol, value: T): void {
    if (!this.__vnode__) {
      console.warn(
        `[Fukict] Cannot provide context in component "${this.__name__}": __vnode__ is null. ` +
          `Make sure to call provideContext() after component is mounted.`,
      );
      return;
    }

    if (!this.__vnode__.__context__) {
      this.__vnode__.__context__ = {
        __parent__: getParentContext(this.__vnode__),
      };
    }

    this.__vnode__.__context__[key] = createImmutableProxy(value);
  }

  /**
   * Get context value from current or parent contexts
   *
   * Traverses up the VNode tree to find context. Returns default value
   * if context not found.
   *
   * Search order:
   * 1. Current component's __vnode__.__context__ (if component provided its own context)
   * 2. Parent component's context (via __wrapper__.__parentInstance__)
   *
   * @param key - Context key (Symbol or string)
   * @param defaultValue - Default value if context not found
   * @returns Context value (or default)
   *
   * @example
   * ```ts
   * import { THEME_CONTEXT, type ThemeContext } from './contexts';
   *
   * class Button extends Fukict {
   *   render() {
   *     const theme = this.getContext<ThemeContext>(
   *       THEME_CONTEXT,
   *       { mode: 'light', color: '#fff' }
   *     );
   *     return <button style={`background: ${theme.color}`}>Click me</button>;
   *   }
   * }
   * ```
   */
  protected getContext<T>(
    key: string | symbol,
    defaultValue?: T,
  ): T | undefined {
    // First, check if this component has its own context
    if (this.__vnode__ && this.__vnode__.__context__) {
      let currentContext: ContextData | undefined = this.__vnode__.__context__;

      // Traverse up the chain starting from current component
      while (currentContext) {
        if (key in currentContext) {
          return currentContext[key] as T;
        }
        currentContext = currentContext.__parent__;
      }
    }

    // If not found in own context chain, look in parent component
    if (this.__wrapper__) {
      const parentInstance = (this.__wrapper__ as any).__parentInstance__;
      if (parentInstance) {
        // Recursively search in parent
        return parentInstance.getContext(key, defaultValue);
      }
    }

    return defaultValue;
  }

  /**
   * Update component (props-driven update with built-in diff)
   *
   * Can be overridden by user for custom update logic.
   * Called by renderer when parent updates props.
   * Skipped when component is detached (fukict:detach).
   *
   * @param newProps - New props (optional, defaults to current props for self-update)
   */
  update(newProps?: FukictComponentProps<P>): void {
    // Prevent re-entrant update during lifecycle hooks
    if (this.__inUpdating__ || this.__inMounting__ || this.__inUnmounting__) {
      console.warn(
        `[Fukict] Component "${this.__name__}" tried to update during lifecycle execution. ` +
          `This is not allowed and the update was ignored. ` +
          `Do not call update() or trigger parent updates in mounted/updated/beforeUnmount hooks.`,
      );
      return;
    }

    this.__inUpdating__ = true;

    const prevProps = this.props;

    // Update props (use current props if not provided)
    if (newProps !== undefined) {
      (this.props as FukictComponentProps<P>) = newProps;
    }

    // Re-render
    const newVNode = this.render();

    // Preserve context from old VNode to new VNode
    if (this.__vnode__?.__context__) {
      newVNode.__context__ = this.__vnode__.__context__;
    }

    // Built-in diff and patch
    if (this.__vnode__ && this.__container__) {
      diff(this.__vnode__, newVNode, this.__container__);
    }

    this.__vnode__ = newVNode;

    // Call lifecycle hook (protected from re-entry)
    if (this.updated) {
      this.updated(prevProps);
    }

    this.__inUpdating__ = false;
  }

  /**
   * Lifecycle: called after component is mounted
   */
  mounted?(): void;

  /**
   * Lifecycle: called before component is unmounted
   */
  beforeUnmount?(): void;

  /**
   * Lifecycle: called after component is updated
   */
  updated?(prevProps: FukictComponentProps<P>): void;

  /**
   * Mount component (called by renderer or manually)
   * @internal
   */
  mount(container: Element, placeholder?: Comment): void {
    this.__placeholder__ = placeholder || null;
    this.__container__ = placeholder?.parentElement || container;
    this.__inMounting__ = true;

    // First render (if not already rendered)
    if (!this.__vnode__) {
      this.__vnode__ = this.render();
    }

    if (!this.__vnode__) {
      this.__inMounting__ = false;
      return;
    }

    // 1. Create real DOM for instance.__vnode__ (pass this for fukict:ref)
    createRealNode(this.__vnode__, this);

    // 2. Recursively activate nested components in instance.__vnode__
    activate({
      vnode: this.__vnode__,
      ...(placeholder ? { placeholder } : { container }),
      onMounted: () => {
        this.__inMounting__ = false;
        // 3. Trigger mounted() hook (protected from re-entry)
        this.mounted?.();
      },
    });
  }

  /**
   * Unmount component (called by renderer)
   * @internal
   */
  unmount(): void {
    this.__inUnmounting__ = true;

    this.beforeUnmount?.();

    removeNode(this.__vnode__, this.__container__ as Element);

    for (const ref of this.refs.values()) {
      ref.current = null;
    }
    this.refs.clear();

    this.__vnode__ = null;
    this.__container__ = null;

    this.__inUnmounting__ = false;
  }
}
