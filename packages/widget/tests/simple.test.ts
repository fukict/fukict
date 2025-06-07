import { createWidget } from '../src/simple';
import type { VNode } from '@vanilla-dom/core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 模拟 @vanilla-dom/core 的 render 函数
const mockRender = vi.fn((vnode: VNode, options: { container: Element }) => {
  // 简单的模拟实现
  const element = document.createElement('div');
  element.innerHTML = `<div class="rendered-content">Mock Content</div>`;
  const firstChild = element.firstElementChild;
  if (firstChild) {
    options.container.appendChild(firstChild);
  }
});

vi.mock('@vanilla-dom/core', () => ({
  render: mockRender,
}));

describe('简易函数组件', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockRender.mockClear();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('应该能够创建简易函数组件', () => {
    const renderFn = (props: { text: string }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [props.text],
    });

    const componentFactory = createWidget(renderFn);
    expect(typeof componentFactory).toBe('function');

    const instance = componentFactory({ text: 'Hello' });
    expect(instance).toHaveProperty('element');
    expect(instance).toHaveProperty('update');
    expect(instance).toHaveProperty('destroy');
  });

  it('应该能够挂载和渲染组件', () => {
    const renderFn = (props: { text: string }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [props.text],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Hello World' });

    // 挂载组件
    (instance as any).mount(container);

    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(container.children.length).toBe(1);
    expect(instance.element).not.toBeNull();
  });

  it('应该能够更新 props 并重新渲染', () => {
    const renderFn = (props: { text: string; count: number }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [`${props.text}: ${props.count}`],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Count', count: 0 });

    // 挂载
    (instance as any).mount(container);
    expect(mockRender).toHaveBeenCalledTimes(1);

    // 更新 props
    instance.update({ text: 'Count', count: 5 });
    expect(mockRender).toHaveBeenCalledTimes(2);
  });

  it('应该能够销毁组件', () => {
    const renderFn = (props: { text: string }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [props.text],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Hello' });

    // 挂载
    (instance as any).mount(container);
    expect(container.children.length).toBe(1);

    // 销毁
    instance.destroy();
    expect(container.children.length).toBe(0);
    expect(instance.element).toBeNull();
  });

  it('应该进行深度比较，相同的 props 不触发重新渲染', () => {
    const renderFn = (props: {
      data: { name: string; age: number };
    }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [`${props.data.name}: ${props.data.age}`],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ data: { name: 'John', age: 30 } });

    // 挂载
    (instance as any).mount(container);
    expect(mockRender).toHaveBeenCalledTimes(1);

    // 更新相同的 props（深度相等）
    instance.update({ data: { name: 'John', age: 30 } });
    expect(mockRender).toHaveBeenCalledTimes(1); // 不应该重新渲染

    // 更新不同的 props
    instance.update({ data: { name: 'Jane', age: 25 } });
    expect(mockRender).toHaveBeenCalledTimes(2); // 应该重新渲染
  });

  it('在未挂载状态下更新应该显示警告', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const renderFn = (props: { text: string }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [props.text],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Hello' });

    // 在未挂载状态下更新
    instance.update({ text: 'Updated' });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Widget not mounted, cannot update',
    );

    consoleSpy.mockRestore();
  });
});
