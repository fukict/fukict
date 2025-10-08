import { Widget, type VNode } from '@fukict/widget';

import './Counter.css';

export class Counter extends Widget<{ initialCount: number }> {
  private count: number;

  constructor(props: { initialCount: number }) {
    super(props);
    this.count = props.initialCount;
  }

  increment = () => {
    this.count++;
    this.forceUpdate();
  };

  decrement = () => {
    this.count--;
    this.forceUpdate();
  };

  render(): VNode {
    return (
      <div class="counter-example">
        <h2>类组件: Counter</h2>
        <div class="counter">
          <button on:click={this.decrement}>-</button>
          <span class="count">{this.count}</span>
          <button on:click={this.increment}>+</button>
        </div>
      </div>
    );
  }
}
