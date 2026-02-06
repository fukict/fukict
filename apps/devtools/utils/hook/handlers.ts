/**
 * Message handling functions for hook
 */
import { MESSAGE_SOURCE, MESSAGE_TYPE } from '~/constants';

import {
  findDOMFromVNode,
  getComponentBounds,
  getFunctionComponentBounds,
} from './dom-utils.js';
import type { ComponentId, HookContext } from './types.js';

/**
 * Handle messages from DevTools (content script)
 */
export function handleMessageFromDevTools(
  ctx: HookContext,
  event: MessageEvent,
): void {
  const message = event.data;
  if (message.source !== MESSAGE_SOURCE.CONTENT) return;

  const requestId = message.requestId;

  switch (message.type) {
    case MESSAGE_TYPE.GET_COMPONENT_TREE:
      sendComponentTreeData(ctx, requestId);
      break;
    case MESSAGE_TYPE.GET_STORES:
      sendStoresData(ctx, requestId);
      break;
    case MESSAGE_TYPE.GET_ROUTER_INFO:
      sendRouterInfoData(ctx, requestId);
      break;
    case 'GET_COMPONENT_BOUNDS':
      handleGetComponentBounds(ctx, message.componentId);
      break;
    case 'GET_COMPONENT_DOM':
      handleGetComponentDOM(ctx, message.componentId);
      break;
    case 'FIND_COMPONENT_AT':
      handleFindComponentAt(ctx, message.x, message.y);
      break;
    default:
      break;
  }
}

/**
 * Send component tree data
 */
export function sendComponentTreeData(
  ctx: HookContext,
  requestId?: string,
): void {
  const tree = {
    roots: ctx.state.componentTree.roots,
    components: Object.fromEntries(ctx.state.componentTree.components),
    count: ctx.state.componentTree.count,
  };
  const payload: any = { tree };
  if (requestId) payload.requestId = requestId;
  ctx.sendToDevTools(MESSAGE_TYPE.COMPONENT_TREE_DATA, payload);
}

/**
 * Send stores data
 */
export function sendStoresData(ctx: HookContext, requestId?: string): void {
  const storesData = Object.fromEntries(ctx.state.stores);
  const payload: any = { stores: storesData };
  if (requestId) payload.requestId = requestId;
  ctx.sendToDevTools(MESSAGE_TYPE.STORES_DATA, payload);
}

/**
 * Send router info data
 */
export function sendRouterInfoData(ctx: HookContext, requestId?: string): void {
  const payload: any = { router: ctx.state.routerInfo };
  if (requestId) payload.requestId = requestId;
  ctx.sendToDevTools(MESSAGE_TYPE.ROUTER_INFO_DATA, payload);
}

/**
 * Handle GET_COMPONENT_BOUNDS request
 */
function handleGetComponentBounds(
  ctx: HookContext,
  componentId: ComponentId,
): void {
  const { state, logger } = ctx;
  const component = state.componentTree.components.get(componentId);

  if (!component) {
    window.postMessage(
      {
        type: 'COMPONENT_BOUNDS_RESPONSE',
        source: MESSAGE_SOURCE.HOOK,
        bounds: null,
      },
      '*',
    );
    return;
  }

  const instance = state.componentInstanceMap.get(componentId);
  let bounds = undefined;

  if (instance) {
    bounds = getComponentBounds(instance);
  } else {
    const fcVNode = state.functionComponentVNodeMap.get(componentId);
    if (fcVNode) {
      bounds = getFunctionComponentBounds(fcVNode);
    } else {
      logger.warn('No instance or FC vnode found for:', componentId);
    }
  }

  window.postMessage(
    {
      type: 'COMPONENT_BOUNDS_RESPONSE',
      source: MESSAGE_SOURCE.HOOK,
      bounds,
      name: component.name,
    },
    '*',
  );
}

/**
 * Handle GET_COMPONENT_DOM request
 */
function handleGetComponentDOM(
  ctx: HookContext,
  componentId: ComponentId,
): void {
  const { state, logger } = ctx;
  const component = state.componentTree.components.get(componentId);
  if (!component) {
    logger.warn('Component not found:', componentId);
    return;
  }

  const instance = state.componentInstanceMap.get(componentId);
  let domNode: Node | Node[] | null = null;

  if (instance) {
    domNode = findDOMFromVNode(instance._render);
  } else {
    const fcVNode = state.functionComponentVNodeMap.get(componentId);
    if (fcVNode) {
      domNode = findDOMFromVNode(fcVNode.__render__ || fcVNode);
    } else {
      logger.warn('No instance or FC vnode found for:', componentId);
      return;
    }
  }

  if (domNode) {
    let element: Element;
    if (Array.isArray(domNode)) {
      element = domNode[0] as Element;
    } else {
      element = domNode as Element;
    }

    (window as any).__FUKICT_DEVTOOLS_INSPECT_TARGET__ = element;

    window.postMessage(
      {
        type: 'COMPONENT_DOM_READY',
        source: MESSAGE_SOURCE.HOOK,
        componentId,
        ok: true,
      },
      '*',
    );
  } else {
    logger.warn('No DOM node found for component:', componentId);
  }
}

/**
 * Handle FIND_COMPONENT_AT request.
 * Given viewport coordinates, find the deepest component containing that point.
 */
function handleFindComponentAt(ctx: HookContext, x: number, y: number): void {
  const { state } = ctx;
  const element = document.elementFromPoint(x, y);

  if (!element) {
    window.postMessage(
      {
        type: 'FIND_COMPONENT_AT_RESPONSE',
        source: MESSAGE_SOURCE.HOOK,
        componentId: null,
        bounds: null,
        name: null,
      },
      '*',
    );
    return;
  }

  let bestMatch: { id: ComponentId; name: string; bounds: any } | null = null;

  // Check class component instances
  for (const [id, instance] of state.componentInstanceMap.entries()) {
    const domNode = findDOMFromVNode(instance._render);
    if (!domNode) continue;
    const nodes = Array.isArray(domNode) ? domNode : [domNode];
    for (const node of nodes) {
      if (node instanceof Element && node.contains(element)) {
        const comp = state.componentTree.components.get(id);
        if (comp) {
          if (!bestMatch || isDescendantComponent(state, id, bestMatch.id)) {
            bestMatch = {
              id,
              name: comp.name,
              bounds: getComponentBounds(instance),
            };
          }
        }
      }
    }
  }

  // Check function component vnodes
  for (const [id, vnode] of state.functionComponentVNodeMap.entries()) {
    const domNode = findDOMFromVNode(vnode.__render__ || vnode);
    if (!domNode) continue;
    const nodes = Array.isArray(domNode) ? domNode : [domNode];
    for (const node of nodes) {
      if (node instanceof Element && node.contains(element)) {
        const comp = state.componentTree.components.get(id);
        if (comp) {
          if (!bestMatch || isDescendantComponent(state, id, bestMatch.id)) {
            bestMatch = {
              id,
              name: comp.name,
              bounds: getFunctionComponentBounds(vnode),
            };
          }
        }
      }
    }
  }

  window.postMessage(
    {
      type: 'FIND_COMPONENT_AT_RESPONSE',
      source: MESSAGE_SOURCE.HOOK,
      componentId: bestMatch?.id || null,
      bounds: bestMatch?.bounds || null,
      name: bestMatch?.name || null,
    },
    '*',
  );
}

/**
 * Check if childId is a descendant of ancestorId in the component tree.
 */
function isDescendantComponent(
  state: HookContext['state'],
  childId: ComponentId,
  ancestorId: ComponentId,
): boolean {
  let current = state.componentTree.components.get(childId);
  while (current && current.parentId) {
    if (current.parentId === ancestorId) return true;
    current = state.componentTree.components.get(current.parentId);
  }
  return false;
}
