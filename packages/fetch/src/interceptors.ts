/**
 * 拦截器管理器（对应 axios 的 InterceptorManager）
 *
 * 支持 use() 注册 / eject() 移除 / forEach() 遍历。
 */

import type {
  Interceptor,
  InterceptorFulfilled,
  InterceptorManagerInterface,
  InterceptorRejected,
} from './types';

export class InterceptorManager<T> implements InterceptorManagerInterface<T> {
  private handlers: (Interceptor<T> | null)[] = [];

  /** 注册拦截器，返回 id */
  use(
    fulfilled: InterceptorFulfilled<T>,
    rejected?: InterceptorRejected,
  ): number {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  /** 根据 id 移除拦截器 */
  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /** 遍历所有活跃拦截器 */
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    for (const handler of this.handlers) {
      if (handler !== null) {
        fn(handler);
      }
    }
  }
}
