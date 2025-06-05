export { Widget } from './widget';

export { createWidget } from './simple';

export {
  widgetToComponent,
  createComponent,
  embedWidget,
  createComponentFactory,
  is,
} from './utils';

export type {
  WidgetProps,
  SimpleWidgetInstance,
  SimpleWidgetRender,
  SimpleWidgetFactory,
  DOMQuery,
  DOMBatchQuery,
} from './types';

export {
  render,
  createDOMFromTree,
  updateDOM,
  hydrate,
  createElement,
  createTextNode,
  appendChild,
  removeNode,
  batchUpdate,
} from '@vanilla-dom/core';

export type {
  VNode,
  VNodeChild,
  ComponentFunction,
  DOMProps,
  RenderOptions,
} from '@vanilla-dom/core';
