import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState, createLoggerMiddleware } from '@fukict/state';

class MiddlewareDemo extends Widget {
  private state = createState(
    { value: 0 },
    { middleware: [createLoggerMiddleware({ collapsed: true })] }
  );

  onMounted() {
    this.state.subscribe(() => this.forceUpdate());
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="p-6 bg-purple-100 rounded-lg text-center">
          <div class="text-4xl font-bold">{this.state.get('value')}</div>
        </div>
        <button
          on:click={() => this.state.set('value', this.state.get('value') + 1)}
          class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          增加（查看控制台日志）
        </button>
      </div>
    );
  }

  private forceUpdate() {
    if (!this.vnode || !this.root) return;
    updateDOM(this.vnode, this.render(), this.root);
    this.vnode = this.render();
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout title="06. 中间件" description="使用中间件拦截状态变更">
      <DemoCard title="运行效果"><MiddlewareDemo /></DemoCard>
      </ExampleLayout>
    );
  }
}
