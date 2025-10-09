/**
 * @fukict/widget - Update Methods
 *
 * Widget update logic (imports diff)
 */
import type { VNode } from '@fukict/runtime';
import { createNode, unmount } from '@fukict/runtime';

import { diff } from '../diff/core.js';
import { patchProps } from '../diff/props.js';
import { isVNode } from '../diff/types.js';
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
  // Merge props
  widget.props = { ...widget.props, ...newProps };

  // Only perform update if component is mounted
  // If not mounted yet, the initial mount will use the updated props
  if (widget.element && widget.__vnode__) {
    performUpdate(widget);
  } else {
    // console.log('[update] Skipped - not mounted', {
    //   hasElement: !!widget.element,
    //   hasVnode: !!widget.__vnode__,
    // });
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
  if (!widget.element) {
    throw new Error('Cannot __performUpdate: component not mounted');
  }

  const oldVNode = widget.__vnode__;
  if (!oldVNode) {
    throw new Error('Cannot __performUpdate: no previous VNode');
  }

  // Create new VNode
  const newVNode = widget.render();

  // Check if root element type changed
  if (oldVNode.type === newVNode.type && typeof oldVNode.type === 'string') {
    // Same type - can patch in place

    // Step 1: Patch props directly on widget.element
    patchProps(widget.element, oldVNode.props || {}, newVNode.props || {});

    // Step 2: Diff children (inline implementation based on diffChildren logic)
    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];

    // Build a map of old children to their DOM nodes
    const oldDOMMap = new Map();
    let domIndex = 0;

    for (const oldChild of oldChildren) {
      if (
        oldChild === null ||
        oldChild === undefined ||
        typeof oldChild === 'boolean'
      ) {
        continue;
      }

      const domNode = widget.element.childNodes[domIndex];
      if (domNode) {
        oldDOMMap.set(oldChild, domNode);
        domIndex++;
      }
    }

    // Diff position by position
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];

      if (i < oldChildren.length && i < newChildren.length) {
        // Both exist - diff
        const isOldVNode = isVNode(oldChild);
        const isNewVNode = isVNode(newChild);

        if (isOldVNode && isNewVNode) {
          // CRITICAL: Set __dom__ on oldChild so that diff can find it
          const oldNode = oldDOMMap.get(oldChild);
          if (oldNode) {
            (oldChild as any).__dom__ = oldNode;
          }

          diff(oldChild as VNode, newChild as VNode, widget.element, widget);
        } else if (oldChild !== newChild) {
          // Text node changed - replace
          const oldNode = oldDOMMap.get(oldChild);
          if (oldNode) {
            const newNode = createNode(newChild);
            if (newNode) {
              widget.element.replaceChild(newNode, oldNode);
            }
          }
        } else {
          // console.log(
          //   `[performUpdate] → Skipping unchanged text at position ${i}`,
          // );
        }
      } else if (i < newChildren.length) {
        // New child - mount
        const newNode = createNode(newChild);
        if (newNode) {
          widget.element.appendChild(newNode);
        }
      } else {
        // Old child - unmount
        const oldNode = oldDOMMap.get(oldChild);
        if (oldNode) {
          if (isVNode(oldChild)) {
            unmount(oldNode, oldChild as VNode);
          } else {
            widget.element.removeChild(oldNode);
          }
        }
      }
    }

    // Update VNode reference
    widget.__vnode__ = newVNode;
  } else {
    // Different type - need to replace entire element

    const parentElement = widget.element.parentElement;
    if (!parentElement) {
      throw new Error('Cannot __performUpdate: element has no parent');
    }

    const newNode = createNode(newVNode);
    if (newNode && newNode instanceof Element) {
      parentElement.replaceChild(newNode, widget.element);
      widget.element = newNode;
      widget.__vnode__ = newVNode;
    }
  }
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
