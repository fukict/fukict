/**
 * @fukict/widget - Widget Base Class
 *
 * Core Widget class definition without circular dependencies
 */
import type { VNode } from '@fukict/runtime';
import type { WidgetProps, RefsMap, SlotsMap, WidgetLifecycle } from '../types/index.js';
import { extractSlots } from '../slots/index.js';

/**
 * Widget base class
 *
 * @template TProps - Props type
 */
export abstract class Widget<TProps extends WidgetProps = WidgetProps>
  implements WidgetLifecycle
{
  /**
   * Component props
   */
  public props: TProps;

  /**
   * Root DOM element reference
   * Set automatically after mount
   */
  public element?: Element;

  /**
   * Current VNode
   * Used for diff/patch during updates
   */
  public __vnode__?: VNode;

  /**
   * Instance unique key
   * Used for instance matching during diff
   */
  public __key__: string;

  /**
   * Refs to child components
   * Protected: use `protected declare refs` in subclasses for type safety
   */
  public refs: RefsMap = new Map();

  /**
   * Slots content
   * Extracted from children in constructor
   */
  public slots: SlotsMap = new Map();

  /**
   * Constructor
   * @param props - Initial props
   */
  constructor(props: TProps) {
    // Extract slots from children
    this.slots = extractSlots(props.children);

    // Remove children from props (hidden from user)
    const { children: _children, ...propsWithoutChildren } = props;
    this.props = propsWithoutChildren as TProps;

    this.__key__ = generateKey();
  }

  /**
   * Lifecycle: Called after component is mounted to DOM
   */
  onMounted?(): void;

  /**
   * Lifecycle: Called before component is unmounted
   */
  onBeforeUnmount?(): void;

  /**
   * Render method
   * Must be implemented by subclasses
   * @returns VNode tree
   */
  abstract render(): VNode;

  /**
   * Update component props
   * Can be overridden to control update behavior
   *
   * @param newProps - New props (partial)
   */
  public update(_newProps: Partial<TProps>): void {
    // Implementation delegated to update module to avoid circular dependency
    throw new Error('update() implementation not loaded');
  }

  /**
   * Force update (without diff)
   * Completely rebuilds the component tree
   */
  public forceUpdate(): void {
    // Implementation delegated to update module to avoid circular dependency
    throw new Error('forceUpdate() implementation not loaded');
  }

  /**
   * Mount component to container
   * @param container - Container element
   */
  public mount(_container: Element): void {
    // Implementation delegated to lifecycle module to avoid circular dependency
    throw new Error('mount() implementation not loaded');
  }

  /**
   * Unmount component
   */
  public unmount(): void {
    // Implementation delegated to lifecycle module to avoid circular dependency
    throw new Error('unmount() implementation not loaded');
  }
}

/**
 * Generate unique key for widget instance
 */
let keyCounter = 0;
function generateKey(): string {
  return `widget_${++keyCounter}_${Date.now()}`;
}
