import { Widget, type VNode } from '@fukict/widget';

class ChildWidget extends Widget<{ count: number }> {
  render(): VNode {
    return (
      <div class="child-widget">
        <p>子组件显示: {this.props.count}</p>
      </div>
    );
  }
}

export class RefsDemo extends Widget<{}> {
  private count = 0;
  private childRef: ChildWidget | null = null;

  protected declare refs: {
    child: ChildWidget;
  };

  increment = () => {
    this.count++;

    // 通过 ref 直接更新子组件
    if (this.refs.child) {
      this.refs.child.update({ count: this.count });
    }
  };

  render(): VNode {
    return (
      <div class="refs-example">
        <h2>Refs 演示: 父子组件通信</h2>
        <div class="refs-content">
          <button on:click={this.increment}>增加 (count: {this.count})</button>
          <ChildWidget fukict:ref="child" count={this.count} />
          <p class="note">通过 fukict:ref 引用子组件，直接调用 update()</p>
        </div>
      </div>
    );
  }
}
