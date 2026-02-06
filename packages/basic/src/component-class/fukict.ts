/**
 * @fukict/basic - Fukict Class Component Base
 */
import { createRealNode } from '../renderer/create.js';
import { diff, removeNode } from '../renderer/diff/index.js';
import { activate } from '../renderer/mount.js';
import type { Refs, Slots } from '../types/class.js';
import type { ContextData } from '../types/context.js';
import type { VNode, VNodeChild } from '../types/core.js';
import type {
  FukictDetachAttribute,
  FukictRefAttribute,
  FukictSlotAttribute,
} from '../types/dom-attributes.js';
import { createImmutableProxy, getParentContext } from '../utils/context.js';
import { createPrimitiveVNode } from '../vnode.js';

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
   * Unique component instance ID (for debugging)
   * @internal
   */
  readonly $id: number;

  /**
   * Component name (for debugging)
   * @internal
   */
  readonly $name: string;

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
   *
   * Uses $ prefix to indicate this is a framework-provided syntax sugar property.
   */
  protected $slots: S;

  /**
   * Refs object (shared with framework and user)
   * Can be extended by subclasses with specific ref types
   *
   * Uses $ prefix to indicate this is a framework-provided syntax sugar property.
   */
  readonly $refs: Refs;

  /**
   * Current rendered VNode (component's internal render result)
   * @internal
   */
  _render: VNode | null;

  /**
   * Parent component instance
   * Used for context traversal - child can access parent's context via _parent
   * @internal
   */
  _parent: Fukict | null;

  /**
   * Parent DOM container
   * @internal
   */
  _container: Element | null;

  /**
   * Lifecycle phase (prevents re-entrant calls during lifecycle)
   * @internal
   */
  _phase: 'idle' | 'mounting' | 'updating' | 'unmounting';

  /**
   * Constructor
   */
  constructor(props: FukictComponentProps<P>) {
    this.$id = ++componentIdCounter;
    this.$name = this.constructor.name;
    this.props = props;
    this.$slots = {} as S;

    // Initialize instance fields (avoid field initializers for better memory efficiency)
    this.$refs = {};
    this._render = null;
    this._parent = null;
    this._container = null;
    this._phase = 'idle';

    // Note: Do NOT call render() here!
    // render() will be called in mount() after subclass constructor completes
  }

  /**
   * Render method (must be implemented by subclass)
   *
   * @returns VNode to render, or null/undefined to render nothing
   */
  abstract render(): VNode | null | undefined;

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
    if (!this._render) {
      console.warn(
        `[Fukict] Cannot provide context in component "${this.$name}": _render is null. ` +
          `Make sure to call provideContext() after component is mounted.`,
      );
      return;
    }

    if (!this._render.__context__) {
      this._render.__context__ = {
        __parent__: getParentContext(this._render),
      };
    }

    this._render.__context__[key] = createImmutableProxy(value);
  }

  /**
   * Get context value from current or parent contexts
   *
   * Traverses up the VNode tree to find context. Returns default value
   * if context not found.
   *
   * Search order:
   * 1. Current component's _render.__context__ (if component provided its own context)
   * 2. Parent component's context (via _parent)
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
    if (this._render && this._render.__context__) {
      let currentContext: ContextData | undefined = this._render.__context__;

      // Traverse up the chain starting from current component
      while (currentContext) {
        if (key in currentContext) {
          return currentContext[key] as T;
        }
        currentContext = currentContext.__parent__;
      }
    }

    // If not found in own context chain, look in parent component
    if (this._parent) {
      return this._parent.getContext(key, defaultValue);
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
    if (this._phase !== 'idle') {
      console.warn(
        `[Fukict] Component "${this.$name}" tried to update during lifecycle execution (phase: ${this._phase}). ` +
          `This is not allowed and the update was ignored. ` +
          `Do not call update() or trigger parent updates in mounted/updated/beforeUnmount hooks.`,
      );
      return;
    }

    this._phase = 'updating';

    const prevProps = this.props;

    // Update props (use current props if not provided)
    if (newProps !== undefined) {
      (this.props as FukictComponentProps<P>) = newProps;
    }

    // Re-render
    const rawVNode = this.render();

    // Wrap null/undefined as PrimitiveVNode for consistent diff handling
    const newVNode: VNode =
      rawVNode === null || rawVNode === undefined
        ? (createPrimitiveVNode(rawVNode) as VNode)
        : rawVNode;

    // Preserve context from old VNode to new VNode
    if (this._render?.__context__) {
      newVNode.__context__ = this._render.__context__;
    }

    // Diff and patch (let diff handle all cases including PrimitiveVNode)
    if (this._render && this._container) {
      diff(this._render, newVNode, this._container);
    }

    this._render = newVNode;

    // Call lifecycle hook (protected from re-entry)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- async lifecycle hooks are intentionally not awaited
    this.updated?.(prevProps);

    this._phase = 'idle';
  }

  /**
   * Lifecycle: called after component is mounted
   *
   * Can be async, but the framework will not await it.
   * Use for: DOM manipulation, event listeners, data fetching
   */
  mounted?(): void | Promise<void>;

  /**
   * Lifecycle: called before component is unmounted
   *
   * Can be async, but the framework will not await it.
   * Use for: cleanup, removing event listeners, canceling timers
   */
  beforeUnmount?(): void | Promise<void>;

  /**
   * Lifecycle: called after component is updated
   *
   * Can be async, but the framework will not await it.
   * @param prevProps - Previous props before update
   */
  updated?(prevProps: FukictComponentProps<P>): void | Promise<void>;

  /**
   * Mount component to DOM
   *
   * @internal This method is called by the framework. Do NOT override.
   * @sealed
   */
  mount(container: Element, placeholder?: Comment): void {
    this._container = placeholder?.parentElement || container;
    this._phase = 'mounting';

    // First render (if not already rendered)
    if (!this._render) {
      const rawVNode = this.render();
      // Wrap null/undefined as PrimitiveVNode
      this._render =
        rawVNode === null || rawVNode === undefined
          ? (createPrimitiveVNode(rawVNode) as VNode)
          : rawVNode;
    }

    // Create real DOM for instance._render (pass this for fukict:ref)
    createRealNode(this._render, this);

    // Recursively activate nested components in instance._render
    activate({
      vnode: this._render,
      ...(placeholder ? { placeholder } : { container }),
      onMounted: () => {
        this._phase = 'idle';
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- async lifecycle hooks are intentionally not awaited
        this.mounted?.();
      },
    });
  }

  /**
   * Unmount component from DOM
   *
   * @internal This method is called by the framework. Do NOT override.
   * @sealed
   */
  unmount(): void {
    this._phase = 'unmounting';

    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- async lifecycle hooks are intentionally not awaited
    this.beforeUnmount?.();

    removeNode(this._render, this._container as Element);

    // Clear all refs ($refs now store instances directly, not Ref wrappers)
    for (const key in this.$refs) {
      delete this.$refs[key];
    }

    this._render = null;
    this._container = null;

    this._phase = 'idle';
  }
}
