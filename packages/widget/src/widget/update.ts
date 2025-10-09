/**
 * @fukict/widget - Update Methods
 *
 * Widget update logic (imports diff)
 */
import { createNode } from '@fukict/runtime';

import { diff } from '../diff/index.js';
import type { WidgetProps } from '../types/index.js';
import type { Widget } from './class.js';

/**
 * Update widget props
 *
 * @param widget - Widget instance
 * @param newProps - New props (partial)
 */
export function update<TProps extends WidgetProps>(
  widget: Widget<TProps>,
  newProps: Partial<TProps>,
): void {
  console.log('[update] CALLED with newProps:', newProps);
  console.log('[update] Widget state:', {
    hasElement: !!widget.element,
    hasVnode: !!widget.__vnode__,
    widgetType: widget.constructor.name,
  });

  // Merge props
  widget.props = { ...widget.props, ...newProps };

  // Only perform update if component is mounted
  // If not mounted yet, the initial mount will use the updated props
  if (widget.element && widget.__vnode__) {
    console.log('[update] Calling performUpdate...');
    performUpdate(widget);
  } else {
    console.log('[update] Skipped - not mounted', {
      hasElement: !!widget.element,
      hasVnode: !!widget.__vnode__,
    });
  }
}

/**
 * Perform smooth update (with diff)
 *
 * @param widget - Widget instance
 */
export function performUpdate<TProps extends WidgetProps>(
  widget: Widget<TProps>,
): void {
  console.log('[performUpdate] CALLED');

  if (!widget.element) {
    throw new Error('Cannot __performUpdate: component not mounted');
  }

  const oldVNode = widget.__vnode__;
  if (!oldVNode) {
    throw new Error('Cannot __performUpdate: no previous VNode');
  }

  console.log('[performUpdate] Old VNode:', oldVNode);

  // Create new VNode
  const newVNode = widget.render();
  console.log('[performUpdate] New VNode:', newVNode);

  // Perform diff/patch with new algorithm
  const parentElement = widget.element.parentElement;
  if (!parentElement) {
    throw new Error('Cannot __performUpdate: element has no parent');
  }

  console.log('[performUpdate] Calling diff()...');
  const newNode = diff(oldVNode, newVNode, parentElement, widget);
  console.log('[performUpdate] diff() returned:', newNode);

  // Update element reference if changed
  if (newNode && newNode instanceof Element) {
    widget.element = newNode;
  }

  // Update VNode reference
  widget.__vnode__ = newVNode;
  console.log('[performUpdate] Complete');
}

/**
 * Force update (without diff)
 * Completely rebuilds the component tree
 *
 * WARNING:
 * - All child component instances will be destroyed and recreated
 * - All refs will be invalidated
 * - All child component internal state will be lost
 *
 * Only use when:
 * - Component state is completely invalid
 * - Diff cost is higher than rebuild cost
 * - Need to force reset all child components
 *
 * @param widget - Widget instance
 */
export function forceUpdate<TProps extends WidgetProps>(
  widget: Widget<TProps>,
): void {
  if (!widget.element) {
    throw new Error('Cannot forceUpdate: component not mounted');
  }

  // Call widget's unmount method which will be implemented
  if (widget.__vnode__) {
    widget.unmount();
  }

  // Create new VNode
  const newVNode = widget.render();
  widget.__vnode__ = newVNode;

  // Create new DOM
  const newNode = createNode(newVNode);

  if (!newNode) {
    throw new Error('forceUpdate: createNode returned null');
  }

  // Replace DOM
  const parent = widget.element.parentElement;
  if (!parent) {
    throw new Error('Cannot forceUpdate: element has no parent');
  }

  parent.replaceChild(newNode, widget.element);

  // Update element reference
  if (newNode instanceof Element) {
    widget.element = newNode;
  }

  // Trigger onMounted
  widget.onMounted?.();
}
