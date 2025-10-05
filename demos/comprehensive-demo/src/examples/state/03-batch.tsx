import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

class BatchDemo extends Widget {
  private state = createState({
    x: 0,
    y: 0,
    count: 0,
  });

  private updateCount = 0;

  onMounted() {
    this.state.subscribe(() => {
      this.updateCount++;
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-3xl font-bold">{this.state.get('x')}</div>
              <div class="text-sm mt-1">X</div>
            </div>
            <div>
              <div class="text-3xl font-bold">{this.state.get('y')}</div>
              <div class="text-sm mt-1">Y</div>
            </div>
            <div>
              <div class="text-3xl font-bold">{this.state.get('count')}</div>
              <div class="text-sm mt-1">Count</div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            on:click={() => this.updateWithoutBatch()}
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            普通更新（3次通知）
          </button>
          <button
            on:click={() => this.updateWithBatch()}
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            批量更新（1次通知）
          </button>
        </div>

        <div class="p-4 bg-yellow-50 rounded-lg">
          <p class="text-sm text-yellow-900">
            <strong>订阅通知次数:</strong> {this.updateCount}
          </p>
        </div>
      </div>
    );
  }

  private updateWithoutBatch() {
    this.state.set('x', this.state.get('x') + 1);
    this.state.set('y', this.state.get('y') + 1);
    this.state.set('count', this.state.get('count') + 1);
    // 触发 3 次订阅通知
  }

  private updateWithBatch() {
    this.state.batch(() => {
      this.state.set('x', this.state.get('x') + 1);
      this.state.set('y', this.state.get('y') + 1);
      this.state.set('count', this.state.get('count') + 1);
    });
    // 只触发 1 次订阅通知
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
      title="03. 批量更新"
      description="使用 batch 减少订阅通知次数，提升性能"
    >
      <DemoCard title="运行效果">
        <BatchDemo />
        <p class="mt-4 text-sm text-gray-600">
          💡 批量更新可以将多次状态变更合并为一次通知，减少重渲染次数
        </p>
      </DemoCard>
      </ExampleLayout>
    );
  }
}
