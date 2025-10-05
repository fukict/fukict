/**
 * @fukict/state - 选择器测试
 */

import { describe, it, expect, vi } from 'vitest';
import { createState } from '../src/core';

describe('selector', () => {
  it('应该创建派生选择器', () => {
    const state = createState({
      todos: [
        { id: 1, text: 'Task 1', done: false },
        { id: 2, text: 'Task 2', done: true },
      ],
    });

    const activeTodos = state.select(s => s.todos.filter(t => !t.done));

    expect(activeTodos.value).toEqual([{ id: 1, text: 'Task 1', done: false }]);
  });

  it('应该在源状态变化时更新', () => {
    const state = createState({
      todos: [{ id: 1, text: 'Task 1', done: false }],
    });

    const activeTodos = state.select(s => s.todos.filter(t => !t.done));
    expect(activeTodos.value.length).toBe(1);

    state.set('todos', [
      { id: 1, text: 'Task 1', done: true },
      { id: 2, text: 'Task 2', done: false },
    ]);

    expect(activeTodos.value.length).toBe(1);
    expect(activeTodos.value[0].id).toBe(2);
  });

  it('应该订阅选择器变更', () => {
    const state = createState({
      count: 0,
    });

    const doubled = state.select(s => s.count * 2);
    const listener = vi.fn();

    doubled.subscribe(listener);

    state.set('count', 1);
    expect(listener).toHaveBeenCalledWith(2);

    state.set('count', 2);
    expect(listener).toHaveBeenCalledWith(4);
  });

  it('应该跳过相同值的通知', () => {
    const state = createState({
      count: 0,
    });

    const isEven = state.select(s => s.count % 2 === 0);
    const listener = vi.fn();

    isEven.subscribe(listener);

    state.set('count', 2); // true
    expect(listener).toHaveBeenCalledTimes(0); // 初始值已经是 true

    state.set('count', 1); // false
    expect(listener).toHaveBeenCalledTimes(1);

    state.set('count', 3); // false
    expect(listener).toHaveBeenCalledTimes(1); // 值没变，不通知
  });

  it('应该支持取消订阅', () => {
    const state = createState({ count: 0 });
    const doubled = state.select(s => s.count * 2);
    const listener = vi.fn();

    const unsubscribe = doubled.subscribe(listener);

    state.set('count', 1);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    state.set('count', 2);
    expect(listener).toHaveBeenCalledTimes(1); // 不再触发
  });

  it('应该处理对象选择器', () => {
    const state = createState({
      user: { name: 'Alice', age: 25 },
    });

    const userName = state.select(s => s.user.name);

    expect(userName.value).toBe('Alice');

    state.set('user', { name: 'Bob', age: 30 });
    expect(userName.value).toBe('Bob');
  });

  it('应该处理复杂的派生计算', () => {
    const state = createState({
      items: [
        { id: 1, price: 10, quantity: 2 },
        { id: 2, price: 20, quantity: 1 },
      ],
    });

    const total = state.select(s =>
      s.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );

    expect(total.value).toBe(40);

    state.set('items', [
      { id: 1, price: 10, quantity: 3 },
      { id: 2, price: 20, quantity: 2 },
    ]);

    expect(total.value).toBe(70);
  });
});
