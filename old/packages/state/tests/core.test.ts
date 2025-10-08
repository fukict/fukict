/**
 * @fukict/state - 核心功能测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createState } from '../src/core';

describe('createState', () => {
  it('应该创建状态容器', () => {
    const state = createState({ count: 0 });
    expect(state.get('count')).toBe(0);
  });

  it('应该获取完整状态', () => {
    const state = createState({ count: 0, name: 'Alice' });
    const fullState = state.getState();

    expect(fullState).toEqual({ count: 0, name: 'Alice' });
    expect(Object.isFrozen(fullState)).toBe(true);
  });

  it('应该设置单个字段', () => {
    const state = createState({ count: 0 });
    state.set('count', 1);
    expect(state.get('count')).toBe(1);
  });

  it('应该批量设置多个字段', () => {
    const state = createState({ count: 0, name: 'Alice' });
    state.setState({ count: 1, name: 'Bob' });

    expect(state.get('count')).toBe(1);
    expect(state.get('name')).toBe('Bob');
  });

  it('应该触发订阅者', () => {
    const state = createState({ count: 0 });
    const listener = vi.fn();

    state.subscribe(listener);
    state.set('count', 1);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      { count: 1 },
      { count: 0 },
      ['count'],
    );
  });

  it('应该支持取消订阅', () => {
    const state = createState({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = state.subscribe(listener);
    state.set('count', 1);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    state.set('count', 2);
    expect(listener).toHaveBeenCalledTimes(1); // 不再触发
  });

  it('应该批量更新，只触发一次通知', () => {
    const state = createState({ count: 0, name: 'Alice' });
    const listener = vi.fn();

    state.subscribe(listener);

    state.batch(() => {
      state.set('count', 1);
      state.set('name', 'Bob');
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      { count: 1, name: 'Bob' },
      { count: 0, name: 'Alice' },
      expect.arrayContaining(['count', 'name']),
    );
  });

  it('应该跳过相同值的更新', () => {
    const state = createState({ count: 0 });
    const listener = vi.fn();

    state.subscribe(listener);
    state.set('count', 0); // 相同值

    expect(listener).not.toHaveBeenCalled();
  });

  it('应该重置到初始状态', () => {
    const state = createState({ count: 0, name: 'Alice' });

    state.set('count', 10);
    state.set('name', 'Bob');
    expect(state.getState()).toEqual({ count: 10, name: 'Bob' });

    state.reset();
    expect(state.getState()).toEqual({ count: 0, name: 'Alice' });
  });

  it('应该销毁状态容器', () => {
    const state = createState({ count: 0 });
    const listener = vi.fn();

    state.subscribe(listener);
    state.destroy();

    // 销毁后操作应该无效
    state.set('count', 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('应该处理嵌套对象', () => {
    const state = createState({
      user: { name: 'Alice', age: 25 },
    });

    state.set('user', { name: 'Bob', age: 30 });
    expect(state.get('user')).toEqual({ name: 'Bob', age: 30 });
  });

  it('应该处理数组', () => {
    const state = createState({
      items: [1, 2, 3],
    });

    state.set('items', [4, 5, 6]);
    expect(state.get('items')).toEqual([4, 5, 6]);
  });

  it('应该在嵌套 batch 中正确工作', () => {
    const state = createState({ count: 0, name: 'Alice' });
    const listener = vi.fn();

    state.subscribe(listener);

    state.batch(() => {
      state.set('count', 1);

      state.batch(() => {
        state.set('name', 'Bob');
      });
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
