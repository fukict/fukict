/**
 * @fukict/state - 中间件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { createState } from '../src/core';
import { createLoggerMiddleware } from '../src/middleware';
import type { Middleware } from '../src/types';

describe('middleware', () => {
  it('应该执行中间件', () => {
    const mw = vi.fn();

    const state = createState(
      { count: 0 },
      {
        middleware: [mw],
      },
    );

    state.set('count', 1);

    expect(mw).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'count',
        value: 1,
        prevValue: 0,
      }),
    );
  });

  it('应该按顺序执行多个中间件', () => {
    const calls: number[] = [];

    const mw1: Middleware = () => calls.push(1);
    const mw2: Middleware = () => calls.push(2);
    const mw3: Middleware = () => calls.push(3);

    const state = createState(
      { count: 0 },
      {
        middleware: [mw1, mw2, mw3],
      },
    );

    state.set('count', 1);

    expect(calls).toEqual([1, 2, 3]);
  });

  it('应该在 setState 时为每个变更执行中间件', () => {
    const mw = vi.fn();

    const state = createState(
      { count: 0, name: 'Alice' },
      {
        middleware: [mw],
      },
    );

    state.setState({ count: 1, name: 'Bob' });

    expect(mw).toHaveBeenCalledTimes(2);
    expect(mw).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ key: 'count' }),
    );
    expect(mw).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ key: 'name' }),
    );
  });

  it('应该处理中间件错误', () => {
    const errorMw: Middleware = () => {
      throw new Error('Middleware error');
    };

    const state = createState(
      { count: 0 },
      {
        middleware: [errorMw],
      },
    );

    // 不应该抛出错误
    expect(() => state.set('count', 1)).not.toThrow();

    // 状态应该正常更新
    expect(state.get('count')).toBe(1);
  });

  it('应该接收完整的上下文', () => {
    const mw = vi.fn();

    const state = createState(
      { count: 0, name: 'Alice' },
      {
        middleware: [mw],
      },
    );

    state.set('count', 1);

    expect(mw).toHaveBeenCalledWith({
      key: 'count',
      value: 1,
      prevValue: 0,
      state: { count: 1, name: 'Alice' },
      prevState: { count: 0, name: 'Alice' },
    });
  });

  it('logger 中间件应该工作', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const state = createState(
      { count: 0 },
      {
        middleware: [createLoggerMiddleware()],
      },
    );

    state.set('count', 1);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
