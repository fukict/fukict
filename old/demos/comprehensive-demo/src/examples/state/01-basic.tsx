import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

class BasicStateDemo extends Widget {
  private state = createState({
    count: 0,
    message: 'Hello, Fukict State!',
  });

  onMounted() {
    // 订阅状态变更，自动重渲染
    this.state.subscribe(() => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
          <div class="text-5xl font-bold text-center">
            {this.state.get('count')}
          </div>
          <p class="text-center mt-2">{this.state.get('message')}</p>
        </div>

        <div class="flex gap-2">
          <button
            on:click={() => this.state.set('count', this.state.get('count') + 1)}
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            增加
          </button>
          <button
            on:click={() => this.state.set('count', this.state.get('count') - 1)}
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            减少
          </button>
          <button
            on:click={() => this.state.reset()}
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            重置
          </button>
        </div>
      </div>
    );
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
      title="01. State 基础用法"
      description="使用 createState 创建响应式状态容器"
    >
      <DemoCard title="运行效果">
        <BasicStateDemo />
      </DemoCard>

      <CodeBlock
        title="代码示例"
        code={`import { createState } from '@fukict/state';

// 创建状态容器
const state = createState({
  count: 0,
  message: 'Hello'
});

// 读取状态
state.get('count'); // 0

// 更新状态
state.set('count', 1);

// 订阅变更
state.subscribe((newState, prevState, changedKeys) => {
  console.log('Changed:', changedKeys);
  // 手动触发重渲染
});`}
      />
      </ExampleLayout>
    );
  }
}
