import { describe, expect, it, vi } from 'vitest';

import { removeEvents, setEvents, updateEvents } from '../src/dom-utils.js';
import { jsx } from '../src/jsx-runtime.js';
import { createDOMFromTree } from '../src/renderer.js';

// Mock DOM environment
const mockElement = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  tagName: 'DIV',
  appendChild: vi.fn(),
  setAttribute: vi.fn(),
  childNodes: [],
});

global.document = {
  createElement: vi.fn(() => mockElement()),
  createTextNode: vi.fn((text: string) => ({ nodeType: 3, textContent: text })),
} as any;

describe('Event Handling', () => {
  it('should create VNode with separated events', () => {
    const handleClick = vi.fn();
    const handleMouseOver = vi.fn();

    const vnode = jsx(
      'button',
      { className: 'test-btn' },
      { click: handleClick, mouseover: handleMouseOver },
      'Click me',
    );

    expect(vnode.type).toBe('button');
    expect(vnode.props).toEqual({ className: 'test-btn' });
    expect(vnode.events).toEqual({
      click: handleClick,
      mouseover: handleMouseOver,
    });
    expect(vnode.children).toEqual(['Click me']);
  });

  it('should handle VNode without events', () => {
    const vnode = jsx('div', { id: 'test' }, null, 'Content');

    expect(vnode.events).toBe(null);
    expect(vnode.props).toEqual({ id: 'test' });
  });

  it('should set events on DOM element', () => {
    const mockEl = mockElement();
    const handleClick = vi.fn();
    const handleKeyDown = vi.fn();

    const events = {
      click: handleClick,
      keydown: handleKeyDown,
    };

    setEvents(mockEl as any, events);

    expect(mockEl.addEventListener).toHaveBeenCalledWith('click', handleClick);
    expect(mockEl.addEventListener).toHaveBeenCalledWith(
      'keydown',
      handleKeyDown,
    );
    expect(mockEl.addEventListener).toHaveBeenCalledTimes(2);
  });

  it('should remove events from DOM element', () => {
    const mockEl = mockElement();
    const handleClick = vi.fn();
    const handleKeyDown = vi.fn();

    const events = {
      click: handleClick,
      keydown: handleKeyDown,
    };

    removeEvents(mockEl as any, events);

    expect(mockEl.removeEventListener).toHaveBeenCalledWith(
      'click',
      handleClick,
    );
    expect(mockEl.removeEventListener).toHaveBeenCalledWith(
      'keydown',
      handleKeyDown,
    );
    expect(mockEl.removeEventListener).toHaveBeenCalledTimes(2);
  });

  it('should update events on DOM element', () => {
    const mockEl = mockElement();
    const oldClick = vi.fn();
    const newClick = vi.fn();
    const newMouseOver = vi.fn();

    const oldEvents = { click: oldClick };
    const newEvents = { click: newClick, mouseover: newMouseOver };

    updateEvents(mockEl as any, newEvents, oldEvents);

    // Should remove old events
    expect(mockEl.removeEventListener).toHaveBeenCalledWith('click', oldClick);

    // Should add new events
    expect(mockEl.addEventListener).toHaveBeenCalledWith('click', newClick);
    expect(mockEl.addEventListener).toHaveBeenCalledWith(
      'mouseover',
      newMouseOver,
    );
  });

  it('should handle null events in updateEvents', () => {
    const mockEl = mockElement();
    const oldClick = vi.fn();

    const oldEvents = { click: oldClick };

    updateEvents(mockEl as any, null, oldEvents);

    // Should only remove old events
    expect(mockEl.removeEventListener).toHaveBeenCalledWith('click', oldClick);
    expect(mockEl.addEventListener).not.toHaveBeenCalled();
  });

  it('should create DOM with events attached', () => {
    const handleClick = vi.fn();

    const vnode = jsx(
      'button',
      { type: 'button' },
      { click: handleClick },
      'Test Button',
    );

    const domNode = createDOMFromTree(vnode) as any;

    expect(document.createElement).toHaveBeenCalledWith('button');
    expect(domNode.addEventListener).toHaveBeenCalledWith('click', handleClick);
  });
});
