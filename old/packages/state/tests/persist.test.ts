/**
 * @fukict/state - 持久化测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createState } from '../src/core';

// 模拟 localStorage
const mockStorage: Record<string, string> = {};
const localStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),
} as unknown as Storage;

describe('persist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该持久化状态', () => {
    const state = createState(
      { count: 0, name: 'Alice' },
      {
        persist: {
          key: 'test-state',
          storage: localStorage,
        },
      },
    );

    state.set('count', 1);
    state.set('name', 'Bob');

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(mockStorage['test-state']).toBeTruthy();

    const saved = JSON.parse(mockStorage['test-state']);
    expect(saved).toEqual({ count: 1, name: 'Bob' });
  });

  it('应该从存储中加载状态', () => {
    // 预先保存状态
    mockStorage['test-state'] = JSON.stringify({ count: 5, name: 'Charlie' });

    const state = createState(
      { count: 0, name: 'Alice' },
      {
        persist: {
          key: 'test-state',
          storage: localStorage,
        },
      },
    );

    expect(state.get('count')).toBe(5);
    expect(state.get('name')).toBe('Charlie');
  });

  it('应该支持白名单过滤', () => {
    const state = createState(
      { count: 0, name: 'Alice', temp: 'xyz' },
      {
        persist: {
          key: 'test-state',
          storage: localStorage,
          include: ['count', 'name'],
        },
      },
    );

    state.setState({ count: 1, name: 'Bob', temp: 'abc' });

    const saved = JSON.parse(mockStorage['test-state']);
    expect(saved).toEqual({ count: 1, name: 'Bob' });
    expect(saved.temp).toBeUndefined();
  });

  it('应该支持黑名单过滤', () => {
    const state = createState(
      { count: 0, name: 'Alice', password: 'secret' },
      {
        persist: {
          key: 'test-state',
          storage: localStorage,
          exclude: ['password'],
        },
      },
    );

    state.setState({ count: 1, name: 'Bob', password: 'newsecret' });

    const saved = JSON.parse(mockStorage['test-state']);
    expect(saved).toEqual({ count: 1, name: 'Bob' });
    expect(saved.password).toBeUndefined();
  });

  it('应该处理加载失败', () => {
    mockStorage['test-state'] = 'invalid json';

    const state = createState(
      { count: 0 },
      {
        persist: {
          key: 'test-state',
          storage: localStorage,
        },
      },
    );

    // 应该使用初始状态
    expect(state.get('count')).toBe(0);
  });

  it('应该处理保存失败', () => {
    const failingStorage = {
      ...localStorage,
      setItem: vi.fn(() => {
        throw new Error('Storage full');
      }),
    } as unknown as Storage;

    const state = createState(
      { count: 0 },
      {
        persist: {
          key: 'test-state',
          storage: failingStorage,
        },
      },
    );

    // 不应该抛出错误
    expect(() => state.set('count', 1)).not.toThrow();
  });
});
