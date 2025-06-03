import { Widget } from '../src/widget';
import { h } from '@vanilla-dom/core';

import { beforeEach, describe, expect, it } from 'vitest';

// 创建一个简单的测试 Widget
class TestWidget extends Widget<{ text: string }, { count: number }> {
  constructor(props: { text: string } = { text: 'test' }) {
    super(props, { count: 0 });
  }

  render() {
    return h('div', { id: 'test-widget' }, [
      h('span', null, this.props.text),
      h('span', null, `Count: ${this.state.count}`),
    ]);
  }
}

describe('Widget', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should create widget instance', () => {
    const widget = new TestWidget({ text: 'hello' });
    expect(widget).toBeInstanceOf(Widget);
  });

  it('should mount and render correctly', async () => {
    const widget = new TestWidget({ text: 'hello' });
    await widget.mount(container);

    const element = container.querySelector('#test-widget');
    expect(element).toBeTruthy();
    expect(element?.textContent).toContain('hello');
    expect(element?.textContent).toContain('Count: 0');
  });

  it('should update state and re-render', async () => {
    const widget = new TestWidget({ text: 'hello' });
    await widget.mount(container);

    await widget.setState({ count: 5 });

    const element = container.querySelector('#test-widget');
    expect(element?.textContent).toContain('Count: 5');
  });

  it('should update props and re-render', async () => {
    const widget = new TestWidget({ text: 'hello' });
    await widget.mount(container);

    await widget.setProps({ text: 'world' });

    const element = container.querySelector('#test-widget');
    expect(element?.textContent).toContain('world');
  });

  it('should unmount correctly', async () => {
    const widget = new TestWidget({ text: 'hello' });
    await widget.mount(container);

    const element = container.querySelector('#test-widget');
    expect(element).toBeTruthy();

    await widget.unmount();

    const elementAfterUnmount = container.querySelector('#test-widget');
    expect(elementAfterUnmount).toBeFalsy();
  });

  it('should call lifecycle hooks', async () => {
    let lifecycleCalls: string[] = [];

    class LifecycleTestWidget extends TestWidget {
      beforeMount() {
        lifecycleCalls.push('beforeMount');
      }

      afterMount() {
        lifecycleCalls.push('afterMount');
      }

      beforeUpdate() {
        lifecycleCalls.push('beforeUpdate');
      }

      afterUpdate() {
        lifecycleCalls.push('afterUpdate');
      }

      beforeUnmount() {
        lifecycleCalls.push('beforeUnmount');
      }

      afterUnmount() {
        lifecycleCalls.push('afterUnmount');
      }
    }

    const widget = new LifecycleTestWidget({ text: 'hello' });

    await widget.mount(container);
    expect(lifecycleCalls).toEqual(['beforeMount', 'afterMount']);

    lifecycleCalls = [];
    await widget.setState({ count: 1 });
    expect(lifecycleCalls).toEqual(['beforeUpdate', 'afterUpdate']);

    lifecycleCalls = [];
    await widget.unmount();
    expect(lifecycleCalls).toEqual(['beforeUnmount', 'afterUnmount']);
  });

  it('should support custom shouldUpdate', async () => {
    const widget = new TestWidget({ text: 'hello' });
    // 配置为永远不更新
    widget['options'].shouldUpdate = () => false;

    await widget.mount(container);

    await widget.setState({ count: 5 });

    const element = container.querySelector('#test-widget');
    // 应该仍然是初始值，因为 shouldUpdate 返回 false
    expect(element?.textContent).toContain('Count: 0');
  });
});
