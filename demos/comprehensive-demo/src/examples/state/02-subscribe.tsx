import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

class SubscribeDemo extends Widget {
  private state = createState({
    name: '',
    age: 0,
    email: '',
  });

  private logs: string[] = [];

  onMounted() {
    this.state.subscribe((state, prev, keys) => {
      const log = `[${keys.join(', ')}] 发生变化`;
      this.logs.push(log);
      if (this.logs.length > 5) this.logs.shift();
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              value={this.state.get('name')}
              onInput={(e) =>
                this.state.set('name', (e.target as HTMLInputElement).value)
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              年龄
            </label>
            <input
              type="number"
              value={this.state.get('age')}
              onInput={(e) =>
                this.state.set('age', parseInt((e.target as HTMLInputElement).value) || 0)
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div class="p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-blue-900 mb-2">订阅日志</h4>
          <div class="space-y-1">
            {this.logs.map((log, i) => (
              <div key={i} class="text-sm text-blue-800">
                {log}
              </div>
            ))}
          </div>
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
      title="02. 订阅变更"
      description="监听状态变化并响应"
    >
      <DemoCard title="运行效果">
        <SubscribeDemo />
      </DemoCard>
      </ExampleLayout>
    );
  }
}
