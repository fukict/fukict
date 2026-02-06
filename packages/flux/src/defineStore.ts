import { registerDevContext } from '@fukict/basic';

import { Flux } from './Flux';
import type {
  ActionContext,
  AsyncActions,
  DefineStoreConfig,
  FluxListener,
  FluxSelector,
  Store,
  SyncActions,
  Unsubscribe,
} from './types';

/** Module-level store registry for dev mode */
const devStores: Array<{ scope: string; store: Record<string, unknown> }> = [];

/**
 * 创建状态管理 Store
 *
 * @param config Store 配置
 * @returns Store 实例
 *
 * @example 基础用法
 * ```typescript
 * const counterStore = defineStore({
 *   state: {
 *     count: 0,
 *   },
 *   actions: {
 *     increment: (state) => ({ count: state.count + 1 }),
 *     add: (state, amount: number) => ({ count: state.count + amount }),
 *   },
 * });
 *
 * // 使用
 * counterStore.actions.increment();
 * counterStore.actions.add(5);
 * console.log(counterStore.state.count);
 * ```
 *
 * @example 异步 actions
 * ```typescript
 * const userStore = defineStore({
 *   state: {
 *     user: null,
 *     loading: false,
 *     error: null,
 *   },
 *   asyncActions: {
 *     async fetchUser(ctx, id: string) {
 *       ctx.setState({ loading: true, error: null });
 *       try {
 *         const user = await api.getUser(id);
 *         ctx.setState({ user, loading: false });
 *       } catch (error) {
 *         ctx.setState({ error, loading: false });
 *       }
 *     },
 *   },
 * });
 *
 * // 使用
 * await userStore.asyncActions.fetchUser('123');
 * ```
 */
export function defineStore<
  T extends object,
  A extends SyncActions<T> = {},
  AA extends AsyncActions<T> = {},
>(config: DefineStoreConfig<T, A, AA>): Store<T, A, AA> {
  // 创建 Flux 实例
  const flux = new Flux<T>(config.state);

  // 创建 action context（用于异步 actions）
  const createContext = (): ActionContext<T> => ({
    getState: () => flux.getState(),
    setState: partial => flux.setState(partial),
  });

  // 包装同步 actions
  const wrappedActions = {} as {
    [K in keyof A]: A[K] extends (state: T, ...args: infer Args) => Partial<T>
      ? (...args: Args) => void
      : never;
  };

  if (config.actions) {
    for (const key of Object.keys(config.actions) as (keyof A)[]) {
      const action = config.actions[key];
      // @ts-expect-error - 动态创建包装函数
      wrappedActions[key] = (...args: unknown[]) => {
        const currentState = flux.getState();
        const partial = action(currentState, ...args) as Partial<T>;
        if (partial !== undefined && partial !== null) {
          flux.setState(partial);
        }
      };
    }
  }

  // 包装异步 actions
  const wrappedAsyncActions = {} as {
    [K in keyof AA]: AA[K] extends (
      ctx: ActionContext<T>,
      ...args: infer Args
    ) => Promise<void>
      ? (...args: Args) => Promise<void>
      : never;
  };

  if (config.asyncActions) {
    for (const key of Object.keys(config.asyncActions) as (keyof AA)[]) {
      const asyncAction = config.asyncActions[key];
      // @ts-expect-error - 动态创建包装函数
      wrappedAsyncActions[key] = async (...args: unknown[]) => {
        const ctx = createContext();
        await asyncAction(ctx, ...args);
      };
    }
  }

  // Dev mode: track store registration, actions, and state changes
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    devStores.push({
      scope: config.scope,
      store: {
        state: config.state,
        actions: wrappedActions,
        asyncActions: wrappedAsyncActions,
      },
    });
    registerDevContext('stores', devStores);

    const storeId = config.scope;

    // Wrap sync actions for tracking
    const syncActions = wrappedActions as Record<
      string,
      (...a: unknown[]) => unknown
    >;
    for (const key of Object.keys(syncActions)) {
      const original = syncActions[key];
      syncActions[key] = (...args: unknown[]) => {
        window.dispatchEvent(
          new CustomEvent('fukict:store:action', {
            detail: { storeId, actionName: key, args },
          }),
        );
        return original(...args);
      };
    }

    // Wrap async actions for tracking
    const asyncActions = wrappedAsyncActions as Record<
      string,
      (...a: unknown[]) => Promise<unknown>
    >;
    for (const key of Object.keys(asyncActions)) {
      const original = asyncActions[key];
      asyncActions[key] = async (...args: unknown[]) => {
        window.dispatchEvent(
          new CustomEvent('fukict:store:action', {
            detail: { storeId, actionName: key, args },
          }),
        );
        return original(...args);
      };
    }

    // Track state changes
    let prevState = flux.getState();
    flux.subscribe((newState: T) => {
      window.dispatchEvent(
        new CustomEvent('fukict:store:state', {
          detail: { storeId, prevState, nextState: newState },
        }),
      );
      prevState = newState;
    });

    // Dispatch registration event (after wrapping actions)
    window.dispatchEvent(
      new CustomEvent('fukict:store', {
        detail: {
          scope: config.scope,
          store: {
            state: config.state,
            actions: wrappedActions,
            asyncActions: wrappedAsyncActions,
          },
        },
      }),
    );
  }

  // 创建 store 对象
  const store: Store<T, A, AA> = {
    // 状态访问（只读代理）
    get state() {
      return flux.getState();
    },

    // 同步 actions
    actions: wrappedActions,

    // 异步 actions
    asyncActions: wrappedAsyncActions,

    // 订阅方法
    subscribe: ((
      selectorOrListener: FluxSelector<T, unknown> | FluxListener<T>,
      listener?: FluxListener<unknown>,
    ): Unsubscribe => {
      if (listener) {
        return flux.subscribe(
          selectorOrListener as FluxSelector<T, unknown>,
          listener,
        );
      }
      return flux.subscribe(selectorOrListener as FluxListener<T>);
    }) as Store<T, A, AA>['subscribe'],

    // 获取状态快照
    getState: () => flux.getState(),

    // 直接设置状态（高级用法）
    setState: partial => flux.setState(partial),
  };

  return store;
}
