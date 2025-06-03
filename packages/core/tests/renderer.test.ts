import { h } from '../src/jsx-runtime.js';
import { createDOMFromTree, render } from '../src/renderer.js';
import type { VNode } from '../src/types.js';

import { beforeEach, describe, expect, it } from 'vitest';

// Mock DOM environment
const mockContainer = {
  appendChild: (node: any) => node,
  removeChild: (node: any) => node,
  replaceChild: (newNode: any, oldNode: any) => newNode,
  firstChild: null,
  childNodes: [],
} as any;

// Mock document.createElement
global.document = {
  createElement: (tag: string) => ({
    tagName: tag.toUpperCase(),
    appendChild: (node: any) => node,
    removeChild: (node: any) => node,
    setAttribute: (key: string, value: string) => {},
    addEventListener: (event: string, handler: Function) => {},
    textContent: '',
    childNodes: [],
  }),
  createTextNode: (text: string) => ({
    nodeType: 3,
    textContent: text,
  }),
} as any;

describe('Renderer', () => {
  it('should create DOM from simple VNode', () => {
    const vnode: VNode = h('div', { class: 'test' }, 'Hello World');
    const domNode = createDOMFromTree(vnode) as Element;

    expect(domNode.tagName).toBe('DIV');
  });

  it('should render VNode to container', () => {
    const vnode: VNode = h('div', null, 'Hello');

    render(vnode, { container: mockContainer });

    // 基础测试：确保没有抛出错误
    expect(true).toBe(true);
  });

  it('should handle nested VNodes', () => {
    const vnode: VNode = h(
      'div',
      null,
      h('span', null, 'Child 1'),
      h('span', null, 'Child 2'),
    );

    const domNode = createDOMFromTree(vnode) as Element;
    expect(domNode.tagName).toBe('DIV');
  });

  it('should handle text children', () => {
    const vnode: VNode = h('p', null, 'Just text');
    const domNode = createDOMFromTree(vnode) as Element;

    expect(domNode.tagName).toBe('P');
  });
});
