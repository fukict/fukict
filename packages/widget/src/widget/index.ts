/**
 * @fukict/widget - Widget Module Entry
 *
 * Exports Widget class with all methods properly wired
 */
import { Widget as WidgetClass } from './class.js';
import {
  mountChildren,
  mount as mountImpl,
  unmountChildren,
  unmount as unmountImpl,
} from './lifecycle.js';
import {
  forceUpdate as forceUpdateImpl,
  performUpdate as performUpdateImpl,
  update as updateImpl,
} from './update.js';

// Wire up Widget prototype methods to avoid circular dependencies
// This allows Widget class definition to not import diff, while update module can import diff
WidgetClass.prototype.mount = function (container: Element) {
  mountImpl(this, container);
};

WidgetClass.prototype.unmount = function () {
  unmountImpl(this);
};

WidgetClass.prototype.update = function (newProps: any) {
  updateImpl(this, newProps);
};

WidgetClass.prototype.forceUpdate = function () {
  forceUpdateImpl(this);
};

// Add internal methods for diff module
(WidgetClass.prototype as any).__mountChildren = function (
  vnode: any,
  node: Node,
) {
  mountChildren(this, vnode, node);
};

(WidgetClass.prototype as any).__unmountChildren = function (vnode: any) {
  unmountChildren(this, vnode);
};

(WidgetClass.prototype as any).__performUpdate = function () {
  performUpdateImpl(this);
};

// Export Widget class
export { WidgetClass as Widget };

// Also export types
export type { Widget as WidgetType } from './class.js';
