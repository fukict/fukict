/**
 * Store tracking functions for hook
 */
import { CONFIG, MESSAGE_TYPE } from '~/constants';
import { serialize } from '~/utils/serialize';
import { throttle } from '~/utils/timing';

import type { HookContext, StoreId, StoreInfo } from './types.js';

/**
 * Track store registration
 */
export function trackStoreRegistration(ctx: HookContext, store: any): void {
  const { state, logger } = ctx;
  const storeId: StoreId = store.scope || `store-${state.stores.size + 1}`;

  const storeInfo: StoreInfo = {
    scope: storeId,
    name: store.scope || storeId,
    state: serialize(store.state || {}),
    actions: {
      sync: Object.keys(store.actions || {}),
      async: Object.keys(store.asyncActions || {}),
    },
    history: [],
    subscriberCount: store.subscribers?.size || 0,
    createdAt: Date.now(),
  };

  state.stores.set(storeId, storeInfo);
  logger.log('Store registered:', storeInfo.name);
  ctx.sendToDevTools(MESSAGE_TYPE.STORE_REGISTERED, { store: storeInfo });
}

/**
 * Create throttled store state change tracker
 */
export function createTrackStoreStateChange(ctx: HookContext) {
  return throttle((storeId: StoreId, prevState: any, nextState: any): void => {
    const storeInfo = ctx.state.stores.get(storeId);
    if (!storeInfo) return;

    const serializedPrevState = serialize(prevState);
    const serializedNextState = serialize(nextState);
    storeInfo.state = serializedNextState;

    ctx.logger.log('Store state changed:', storeId);
    ctx.sendToDevTools(MESSAGE_TYPE.STORE_STATE_CHANGED, {
      storeId,
      prevState: serializedPrevState,
      nextState: serializedNextState,
    });
  }, CONFIG.STORE_UPDATE_THROTTLE);
}

/**
 * Track store action dispatch
 */
export function trackStoreAction(
  ctx: HookContext,
  storeId: StoreId,
  actionName: string,
  args: any[],
): void {
  const storeInfo = ctx.state.stores.get(storeId);
  if (!storeInfo) return;

  const action = {
    name: actionName,
    type: storeInfo.actions.async.includes(actionName)
      ? ('async' as const)
      : ('sync' as const),
    args: serialize(args),
    timestamp: Date.now(),
  };

  storeInfo.history.push(action);
  if (storeInfo.history.length > CONFIG.MAX_STORE_HISTORY) {
    storeInfo.history.shift();
  }

  ctx.logger.log('Store action dispatched:', storeId, actionName);
  ctx.sendToDevTools(MESSAGE_TYPE.STORE_ACTION_DISPATCHED, {
    storeId,
    action,
  });
}
