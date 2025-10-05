import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

class PersistDemo extends Widget {
  private state = createState(
    { theme: 'light', count: 0 },
    { persist: { key: 'demo-persist', storage: localStorage, include: ['theme'] } }
  );

  onMounted() {
    this.state.subscribe(() => this.forceUpdate());
  }

  render() {
    const theme = this.state.get('theme');
    return (
      <div class={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
        <p class="mb-4">当前主题: {theme}</p>
        <button
          on:click={() => this.state.set('theme', theme === 'light' ? 'dark' : 'light')}
          class="px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          切换主题
        </button>
        <p class="mt-4 text-sm opacity-75">刷新页面，主题会自动恢复</p>
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
      <ExampleLayout title="05. 持久化" description="使用 localStorage 自动保存状态">
        <DemoCard title="运行效果"><PersistDemo /></DemoCard>
      </ExampleLayout>
    );
  }
}
