import type { VNode } from '@fukict/core';
import { render, updateDOM } from '@fukict/core';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createWidget } from '../src/functional-widget';

// 先 mock 模块，然后再导入
vi.mock('@fukict/core', () => ({
  render: vi.fn((vnode: VNode, options: { container: Element }) => {
    // 简单的模拟实现
    const element = document.createElement('div');
    element.innerHTML = `<div class="rendered-content">Mock Content</div>`;
    const firstChild = element.firstElementChild;
    if (firstChild) {
      options.container.appendChild(firstChild);
    }
  }),
  updateDOM: vi.fn((oldVNode: VNode, newVNode: VNode, element: Element) => {
    // 简单的模拟实现 - 重新渲染内容
    element.innerHTML =
      '<div class="updated-content">Updated Mock Content</div>';
  }),
}));

// 获取 mock 函数的引用
const mockRender = vi.mocked(render);
const mockUpdateDOM = vi.mocked(updateDOM);

describe('简易函数组件', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockRender.mockClear();
    mockUpdateDOM.mockClear();
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

  it('应该能够挂载和渲染组件', async () => {
    const renderFn = (props: { text: string }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [props.text],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Hello World' });

    // 挂载组件（immediate = true 避免异步）
    await instance.mount(container, true);

    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(container.children.length).toBe(1);
    expect(instance.element).not.toBeNull();
  });

  it('应该能够更新 props 并重新渲染', async () => {
    const renderFn = (props: { text: string; count: number }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [`${props.text}: ${props.count}`],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Count', count: 0 });

    // 挂载
    await instance.mount(container, true);
    expect(mockRender).toHaveBeenCalledTimes(1);

    // 更新 props
    instance.update({ text: 'Count', count: 5 });
    expect(mockUpdateDOM).toHaveBeenCalledTimes(1);
  });

  it('应该能够销毁组件', async () => {
    const renderFn = (props: { text: string }): VNode => ({
      type: 'div',
      props: {},
      events: null,
      children: [props.text],
    });

    const componentFactory = createWidget(renderFn);
    const instance = componentFactory({ text: 'Hello' });

    // 挂载
    await instance.mount(container, true);
    expect(container.children.length).toBe(1);

    // 销毁
    instance.destroy();
    expect(container.children.length).toBe(0);
    expect(instance.element).toBeNull();
  });

  it('应该进行深度比较，相同的 props 不触发重新渲染', async () => {
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
    await instance.mount(container, true);
    expect(mockRender).toHaveBeenCalledTimes(1);

    // 更新相同的 props（深度相等）
    instance.update({ data: { name: 'John', age: 30 } });
    expect(mockUpdateDOM).toHaveBeenCalledTimes(0); // 不应该重新渲染

    // 更新不同的 props
    instance.update({ data: { name: 'Jane', age: 25 } });
    expect(mockUpdateDOM).toHaveBeenCalledTimes(1); // 应该重新渲染
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
      '[@fukict/widget] Widget not mounted, cannot update',
    );

    consoleSpy.mockRestore();
  });
});
