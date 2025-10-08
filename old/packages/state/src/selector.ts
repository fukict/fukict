/**
 * @fukict/state - 派生选择器
 */

import type { State, Selector, SelectorFn } from './types';
import { shallowEqual } from './helpers';

/**
 * 创建派生选择器
 *
 * @example
 * ```typescript
 * const state = createState({ todos: [...] });
 * const activeTodos = state.select(s => s.todos.filter(t => !t.done));
 *
 * activeTodos.subscribe(todos => {
 *   console.log('Active todos:', todos);
 * });
 * ```
 */
export function createSelector<S extends object, T>(
  state: State<S>,
  selector: SelectorFn<S, T>,
): Selector<T> {
  // 计算初始值
  let currentValue = selector(state.getState());

  // 订阅者集合
  const listeners = new Set<(value: T) => void>();

  // 订阅源状态变更
  const unsubscribe = state.subscribe(newState => {
    try {
      const nextValue = selector(newState);

      // 浅比较，避免不必要的通知
      // 对于原始值用 Object.is，对于对象用 shallowEqual
      const isEqual =
        typeof nextValue === 'object' && nextValue !== null
          ? shallowEqual(currentValue, nextValue)
          : Object.is(currentValue, nextValue);

      if (!isEqual) {
        currentValue = nextValue;

        // 通知订阅者
        listeners.forEach(listener => {
          try {
            listener(currentValue);
          } catch (error) {
            console.error('[@fukict/state] Selector listener error:', error);
          }
        });
      }
    } catch (error) {
      console.error('[@fukict/state] Selector error:', error);
    }
  });

  return {
    get value() {
      return currentValue;
    },

    subscribe(listener: (value: T) => void): () => void {
      listeners.add(listener);

      // 返回取消订阅函数
      return () => {
        listeners.delete(listener);

        // 如果没有订阅者了，取消对源状态的订阅
        if (listeners.size === 0) {
          unsubscribe();
        }
      };
    },
  };
}
