import { Fukict } from '@fukict/basic';

// 演示：生命周期钩子
export class LifecycleDemo extends Fukict<{}> {
  private logs: string[] = [];
  private logContainer: HTMLDivElement | null = null;

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
    this.updateLogs();
  }

  private updateLogs() {
    if (!this.logContainer) return;
    this.logContainer.innerHTML = this.logs
      .map(log => `<div class="font-mono text-sm py-1">${log}</div>`)
      .join('');
  }

  mounted() {
    console.info('LifecycleDemo mounted');
    this.addLog('✅ mounted() - 组件已挂载到 DOM');
  }

  updated() {
    console.info('LifecycleDemo updated');
    this.addLog('🔄 updated() - 组件已更新');
  }

  beforeUnmount() {
    console.info('LifecycleDemo beforeUnmount');
    this.addLog('🗑️  beforeUnmount() - 组件即将卸载');
  }

  render() {
    return (
      <div>
        <h2 class="text-3xl font-bold mb-4">生命周期</h2>

        <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
          <p class="text-sm text-gray-700">
            <strong>类组件生命周期：</strong>mounted → updated → beforeUnmount
          </p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">生命周期日志</h3>

          <div class="mb-4 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
            <div ref={el => (this.logContainer = el)}></div>
          </div>

          <button
            on:click={() => this.update(this.props)}
            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            触发 update()
          </button>
        </div>

        <div class="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre class="text-sm">
            <code>{`export class LifecycleDemo extends Fukict<{}> {
  mounted() {
    // 组件首次挂载后调用
    // 适合：初始化数据、订阅事件、启动定时器
    console.log('Component mounted');
  }

  updated() {
    // 组件更新后调用
    // 适合：响应 props 变化、同步状态
    console.log('Component updated');
  }

  beforeUnmount() {
    // 组件卸载前调用
    // 适合：清理定时器、取消订阅、释放资源
    console.log('Component will unmount');
  }
}`}</code>
          </pre>
        </div>
      </div>
    );
  }
}
