/**
 * @fukict/widget - Component Handlers
 *
 * Register component handlers with runtime to extend rendering capabilities.
 */
import { registerComponentHandler } from '@fukict/runtime';
import type { VNode, VNodeChild } from '@fukict/runtime';
import { Widget } from '../widget/index.js';
import { isWidgetFunction } from '../define-widget/index.js';
import { isFukictAttr } from '../constants/index.js';

/**
 * Register Widget class component handler
 */
registerComponentHandler({
  name: 'Widget',
  priority: 100,

  // 1. Detect Widget class
  detect(fn: Function): boolean {
    return (
      (typeof fn === 'function' && fn.prototype instanceof Widget) ||
      (fn as any).__COMPONENT_TYPE__ === 'WIDGET_CLASS'
    );
  },

  // 2. Render Widget instance
  render(Component: any, props: any, children: VNodeChild[]): VNode | null {
    // Create instance
    const instance = new Component({ ...props, children });

    // Call render
    const vnode = instance.render();

    // Store VNode in instance (needed for update mechanism)
    instance.__vnode__ = vnode;

    // Store instance reference (for lifecycle)
    (vnode as any).__instance__ = instance;
    (vnode as any).__instanceKey__ = instance.__key__;

    return vnode;
  },

  // 3. processAttribute: skip fukict: prefix
  processAttribute(_element: Element, key: string, _value: any): boolean {
    // Tell runtime: "this attribute is handled by Widget, don't set to DOM"
    return isFukictAttr(key);
  },
});

/**
 * Register defineWidget function component handler
 */
registerComponentHandler({
  name: 'defineWidget',
  priority: 100,

  // Detect defineWidget function
  detect(fn: Function): boolean {
    return isWidgetFunction(fn);
  },

  // Render function component
  render(component: any, props: any, children: VNodeChild[]): VNode | null {
    // Directly call function
    const vnode = component({ ...props, children });

    // Mark source (for debugging)
    (vnode as any).__component__ = component;

    return vnode;
  },

  // Function components don't need lifecycle, other methods not implemented
});
