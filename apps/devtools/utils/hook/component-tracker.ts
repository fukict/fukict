/**
 * Component tracking functions for hook
 */
import { CONFIG } from '~/constants';
// ---- Internal helpers ----

import { MESSAGE_TYPE } from '~/constants';
import {
  getComponentId,
  getComponentName,
  getFunctionComponentId,
  serialize,
} from '~/utils/serialize';
import { throttle } from '~/utils/timing';

import {
  extractVNodeInfo,
  getComponentBounds,
  getFunctionComponentBounds,
} from './dom-utils.js';
import { extractContextData, extractInstanceData } from './extractors.js';
import type { ComponentId, ComponentInfo, HookContext } from './types.js';

/**
 * VNode type enum (from @fukict/basic)
 */
enum VNodeType {
  Element = 'element',
  Fragment = 'fragment',
  FunctionComponent = 'function',
  ClassComponent = 'class',
  Primitive = 'primitive',
}

/**
 * Traverse VNode tree and collect component instances (class + function)
 */
export function traverseVNodeTree(
  ctx: HookContext,
  vnode: any,
  parentId?: ComponentId,
): void {
  if (!vnode || typeof vnode !== 'object') return;

  // Handle ClassComponentVNode
  if (vnode.__type__ === VNodeType.ClassComponent && vnode.__instance__) {
    const instance = vnode.__instance__;
    trackComponentFromVNode(ctx, instance, parentId);

    const instanceId = getComponentId(instance);
    if (instance._render) {
      traverseVNodeTree(ctx, instance._render, instanceId);
    }
    return;
  }

  // Handle FunctionComponentVNode
  if (vnode.__type__ === VNodeType.FunctionComponent) {
    const fnName =
      (vnode.__tag__ && typeof vnode.__tag__ === 'function'
        ? vnode.__tag__.name
        : null) || 'Anonymous';

    const counterKey = `${parentId || 'root'}:${fnName}`;
    const index = ctx.state.fcSiblingCounters.get(counterKey) || 0;
    ctx.state.fcSiblingCounters.set(counterKey, index + 1);

    const fcId = getFunctionComponentId(parentId || 'root', fnName, index);
    trackFunctionComponentFromVNode(ctx, vnode, fcId, fnName, parentId);

    if (vnode.__render__) {
      traverseVNodeTree(ctx, vnode.__render__, fcId);
    }
    return;
  }

  // For Element, Fragment, traverse children
  if (vnode.children && Array.isArray(vnode.children)) {
    for (const child of vnode.children) {
      if (Array.isArray(child)) {
        for (const c of child) {
          traverseVNodeTree(ctx, c, parentId);
        }
      } else {
        traverseVNodeTree(ctx, child, parentId);
      }
    }
  }
}

/**
 * Track a class component from VNode tree traversal
 */
function trackComponentFromVNode(
  ctx: HookContext,
  instance: any,
  parentId?: ComponentId,
): void {
  const { state, logger } = ctx;
  const id = getComponentId(instance);

  const componentInfo: ComponentInfo = {
    id,
    name: getComponentName(instance),
    type: typeof instance.render === 'function' ? 'class' : 'function',
    parentId,
    children: [],
    props: serialize(instance.props || {}),
    state: serialize(instance.state),
    refs: serialize(instance.refs),
    instanceData: extractInstanceData(instance),
    contextData: extractContextData(instance),
    isMounted: true,
    mountedAt: Date.now(),
    updateCount: 0,
    bounds: getComponentBounds(instance),
    vnodeInfo: extractVNodeInfo(instance),
  };

  state.componentTree.components.set(id, componentInfo);
  state.componentTree.count++;
  state.componentInstanceMap.set(id, instance);

  if (parentId) {
    const parent = state.componentTree.components.get(parentId);
    if (parent && !parent.children.includes(id)) {
      parent.children.push(id);
    }
  } else {
    if (!state.componentTree.roots.includes(id)) {
      state.componentTree.roots.push(id);
    }
  }

  logger.log('Component tracked from vnode:', componentInfo.name, id);
}

/**
 * Track a function component from VNode tree traversal
 */
function trackFunctionComponentFromVNode(
  ctx: HookContext,
  vnode: any,
  fcId: ComponentId,
  fnName: string,
  parentId?: ComponentId,
): void {
  const { state, logger } = ctx;

  const componentInfo: ComponentInfo = {
    id: fcId,
    name: fnName,
    type: 'function',
    parentId,
    children: [],
    props: serialize(vnode.__props__ || vnode.props || {}),
    isMounted: true,
    mountedAt: Date.now(),
    updateCount: 0,
    bounds: getFunctionComponentBounds(vnode),
  };

  state.componentTree.components.set(fcId, componentInfo);
  state.componentTree.count++;
  state.functionComponentVNodeMap.set(fcId, vnode);

  if (parentId) {
    const parent = state.componentTree.components.get(parentId);
    if (parent && !parent.children.includes(fcId)) {
      parent.children.push(fcId);
    }
  } else {
    if (!state.componentTree.roots.includes(fcId)) {
      state.componentTree.roots.push(fcId);
    }
  }

  logger.log('Function component tracked:', fnName, fcId);
}

/**
 * Clear and rebuild the full component tree from root vnode
 */
function clearTree(ctx: HookContext): void {
  const { state } = ctx;
  state.componentTree.roots = [];
  state.componentTree.components.clear();
  state.componentTree.count = 0;
  state.componentInstanceMap.clear();
  state.functionComponentVNodeMap.clear();
  state.fcSiblingCounters.clear();
}

/**
 * Register a new root and rebuild the full component tree.
 * Supports multiple roots — each attach() call adds to the list.
 */
export function buildComponentTreeFromRoot(
  ctx: HookContext,
  vnode: any,
  container: Element,
): void {
  ctx.logger.log('Adding root vnode, rebuilding tree');

  // Add root entry (skip if already tracked)
  const exists = ctx.state.rootEntries.some(
    r => r.vnode === vnode && r.container === container,
  );
  if (!exists) {
    ctx.state.rootEntries.push({ vnode, container });
  }

  rebuildAllRoots(ctx);
}

/**
 * Remove a root and rebuild the tree.
 */
export function removeRoot(
  ctx: HookContext,
  vnode: any,
  container: Element,
): void {
  ctx.state.rootEntries = ctx.state.rootEntries.filter(
    r => r.vnode !== vnode || r.container !== container,
  );
  rebuildAllRoots(ctx);
}

/**
 * Re-scan component tree from all roots (called on DOM mutations)
 */
export function rescanComponentTree(ctx: HookContext): void {
  if (ctx.state.rootEntries.length === 0) {
    ctx.logger.warn('Cannot rescan: no root entries');
    return;
  }

  ctx.logger.log('Re-scanning component tree due to DOM changes');
  rebuildAllRoots(ctx);
}

/**
 * Clear tree then traverse all root entries.
 */
function rebuildAllRoots(ctx: HookContext): void {
  clearTree(ctx);

  for (const { vnode } of ctx.state.rootEntries) {
    traverseVNodeTree(ctx, vnode);
  }

  ctx.logger.log('Component tree built:', {
    roots: ctx.state.componentTree.roots.length,
    total: ctx.state.componentTree.count,
    rootEntries: ctx.state.rootEntries.length,
  });

  sendComponentTreeData(ctx);
}

/**
 * Track component when it updates
 */
export function createTrackComponentUpdate(ctx: HookContext) {
  return throttle((instance: any): void => {
    const { state, logger } = ctx;
    const id = getComponentId(instance);
    const componentInfo = state.componentTree.components.get(id);
    if (!componentInfo) return;

    componentInfo.props = serialize(instance.props || {});
    componentInfo.state = serialize(instance.state);
    componentInfo.refs = serialize(instance.refs);
    componentInfo.instanceData = extractInstanceData(instance);
    componentInfo.contextData = extractContextData(instance);
    componentInfo.updateCount++;
    componentInfo.lastUpdatedAt = Date.now();
    componentInfo.vnodeInfo = extractVNodeInfo(instance);

    logger.log('Component updated:', componentInfo.name, id);

    ctx.sendToDevTools('COMPONENT_UPDATED', {
      componentId: id,
      updates: {
        props: componentInfo.props,
        state: componentInfo.state,
        refs: componentInfo.refs,
        instanceData: componentInfo.instanceData,
        contextData: componentInfo.contextData,
        updateCount: componentInfo.updateCount,
        lastUpdatedAt: componentInfo.lastUpdatedAt,
        vnodeInfo: componentInfo.vnodeInfo,
      },
    });
  }, CONFIG.TREE_UPDATE_THROTTLE);
}

/**
 * Track component when it unmounts
 */
export function trackComponentUnmount(ctx: HookContext, instance: any): void {
  const { state, logger } = ctx;
  const id = getComponentId(instance);
  const componentInfo = state.componentTree.components.get(id);
  if (!componentInfo) return;

  componentInfo.isMounted = false;

  if (componentInfo.parentId) {
    const parent = state.componentTree.components.get(componentInfo.parentId);
    if (parent) {
      parent.children = parent.children.filter(childId => childId !== id);
    }
  } else {
    state.componentTree.roots = state.componentTree.roots.filter(
      rootId => rootId !== id,
    );
  }

  state.componentTree.components.delete(id);
  state.componentTree.count--;
  state.componentInstanceMap.delete(id);

  logger.log('Component unmounted:', componentInfo.name, id);
  ctx.sendToDevTools('COMPONENT_REMOVED', { componentId: id });
}

function sendComponentTreeData(ctx: HookContext, requestId?: string): void {
  const tree = {
    roots: ctx.state.componentTree.roots,
    components: Object.fromEntries(ctx.state.componentTree.components),
    count: ctx.state.componentTree.count,
  };
  const payload: any = { tree };
  if (requestId) payload.requestId = requestId;
  ctx.sendToDevTools(MESSAGE_TYPE.COMPONENT_TREE_DATA, payload);
}
