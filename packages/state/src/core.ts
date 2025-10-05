/**
 * @fukict/state - 核心状态容器
 */

import type {
  Listener,
  SelectorFn,
  State,
  StateOptions,
  Selector,
} from './types';
import { loadFromStorage, saveToStorage } from './persist';
import { runMiddleware } from './middleware';
import { createSelector } from './selector';

/**
 * 创建状态容器
 *
 * @example
 * ```typescript
 * const appState = createState({
 *   count: 0,
 *   user: { name: 'Alice' }
 * });
 *
 * // 读取
 * appState.get('count'); // 0
 *
 * // 更新
 * appState.set('count', 1);
 *
 * // 订阅
 * const unsubscribe = appState.subscribe((state, prev, keys) => {
 *   console.log('Changed:', keys);
 * });
 * ```
 */
export function createState<T extends object>(
  initialState: T,
  options?: StateOptions<T>,
): State<T> {
  // 保存初始状态的副本（用于 reset）
  const frozenInitialState = Object.freeze({ ...initialState });

  // 当前状态
  let state = { ...initialState };

  // 持久化加载
  if (options?.persist) {
    const loaded = loadFromStorage<T>(options.persist);
    if (loaded) {
      state = { ...state, ...loaded };
    }
  }

  // 订阅者集合
  const listeners = new Set<Listener<T>>();

  // 批量更新标志
  let isBatching = false;
  let batchedChanges = new Set<keyof T>();

  // 是否已销毁
  let isDestroyed = false;

  /**
   * 通知订阅者
   */
  function notify(
    changedKeys: (keyof T)[],
    prevState: Readonly<T>,
  ): void {
    if (isDestroyed) {
      console.warn('[@fukict/state] State has been destroyed');
      return;
    }

    if (isBatching) {
      changedKeys.forEach(k => batchedChanges.add(k));
      return;
    }

    if (changedKeys.length === 0) {
      return;
    }

    // 触发订阅者
    listeners.forEach(listener => {
      try {
        listener(Object.freeze({ ...state }), prevState, [
          ...changedKeys,
        ]);
      } catch (error) {
        console.error('[@fukict/state] Listener error:', error);
      }
    });

    // 持久化保存
    if (options?.persist) {
      saveToStorage(state, options.persist);
    }
  }

  return {
    get<K extends keyof T>(key: K): T[K] {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return undefined as T[K];
      }
      return state[key];
    },

    set<K extends keyof T>(key: K, value: T[K]): void {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return;
      }

      // 值相等时跳过
      if (Object.is(state[key], value)) {
        return;
      }

      const prevValue = state[key];
      const prevState = Object.freeze({ ...state });

      // 更新状态
      state = { ...state, [key]: value };

      // 执行中间件
      if (options?.middleware) {
        runMiddleware(options.middleware, {
          key,
          value,
          prevValue,
          state: Object.freeze({ ...state }),
          prevState,
        });
      }

      // 通知订阅者
      notify([key], prevState);
    },

    getState(): Readonly<T> {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return Object.freeze({} as T);
      }
      return Object.freeze({ ...state });
    },

    setState(partial: Partial<T>): void {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return;
      }

      const changedKeys: (keyof T)[] = [];
      const prevState = Object.freeze({ ...state });
      const newState = { ...state };

      // 收集变更
      for (const key in partial) {
        if (!Object.prototype.hasOwnProperty.call(partial, key)) {
          continue;
        }

        const value = partial[key];
        if (value !== undefined && !Object.is(state[key], value)) {
          newState[key] = value;
          changedKeys.push(key);
        }
      }

      if (changedKeys.length === 0) {
        return;
      }

      // 更新状态
      state = newState;

      // 执行中间件（为每个变更执行）
      if (options?.middleware) {
        changedKeys.forEach(key => {
          runMiddleware(options.middleware!, {
            key,
            value: state[key],
            prevValue: prevState[key],
            state: Object.freeze({ ...state }),
            prevState,
          });
        });
      }

      // 通知订阅者
      notify(changedKeys, prevState);
    },

    subscribe(listener: Listener<T>): () => void {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return () => {};
      }

      listeners.add(listener);

      // 返回取消订阅函数
      return () => {
        listeners.delete(listener);
      };
    },

    batch(fn: () => void): void {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return;
      }

      if (isBatching) {
        // 已经在批量模式中，直接执行
        fn();
        return;
      }

      // 记录批量操作前的初始状态
      const batchPrevState = Object.freeze({ ...state });

      isBatching = true;
      batchedChanges.clear();

      try {
        fn();
      } finally {
        isBatching = false;

        // 批量通知
        if (batchedChanges.size > 0) {
          notify(Array.from(batchedChanges), batchPrevState);
        }
      }
    },

    select<R>(selector: SelectorFn<T, R>): Selector<R> {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return {
          get value() {
            return undefined as R;
          },
          subscribe: () => () => {},
        };
      }

      return createSelector(this, selector);
    },

    reset(): void {
      if (isDestroyed) {
        console.warn('[@fukict/state] State has been destroyed');
        return;
      }

      const prevState = Object.freeze({ ...state });
      state = { ...frozenInitialState };

      const changedKeys = Object.keys(state).filter(
        key => !Object.is(state[key as keyof T], prevState[key as keyof T]),
      ) as (keyof T)[];

      if (changedKeys.length > 0) {
        notify(changedKeys, prevState);
      }
    },

    destroy(): void {
      if (isDestroyed) {
        return;
      }

      isDestroyed = true;
      listeners.clear();
      batchedChanges.clear();
    },
  };
}
