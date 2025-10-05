import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';

class ManualUpdateDemo extends Widget {
  private count = 0;

  render() {
    return (
      <div class="space-y-4">
        <div class="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
          <div class="text-6xl font-bold">{this.count}</div>
          <p class="mt-2">当前计数</p>
        </div>

        <div class="flex gap-2">
          <button
            on:click={() => this.increment()}
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            +1
          </button>
          <button
            on:click={() => this.decrement()}
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            -1
          </button>
          <button
            on:click={() => this.reset()}
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            重置
          </button>
        </div>
      </div>
    );
  }

  private increment() {
    this.count++;
    this.forceUpdate(); // 手动触发重渲染
  }

  private decrement() {
    this.count--;
    this.forceUpdate();
  }

  private reset() {
    this.count = 0;
    this.forceUpdate();
  }

  private forceUpdate() {
    if (!this.vnode || !this.root) return;
    const newVNode = this.render();
    updateDOM(this.vnode, newVNode, this.root);
    this.vnode = newVNode;
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="05. 手动更新"
      description="手动控制组件的重渲染时机"
    >
      <DemoCard title="运行效果">
        <ManualUpdateDemo />
      </DemoCard>
      </ExampleLayout>
    );
  }
}
