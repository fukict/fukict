import { Fukict } from '@fukict/basic';

// 演示：类组件
export class ClassComponentDemo extends Fukict<{}> {
  private count = 0;
  private timer?: number;
  private displayRef: HTMLSpanElement | null = null;

  mounted() {
    this.timer = setInterval(() => {
      this.count++;
      if (this.displayRef) {
        this.displayRef.textContent = this.count.toString();
      }
    }, 1000);
  }

  beforeUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <div>
        <h2 class="mb-4 text-3xl font-bold">类组件 (Fukict)</h2>

        <div class="mb-6 border-l-4 border-purple-500 bg-purple-50 p-4">
          <p class="text-sm text-gray-700">
            <strong>类组件：</strong>继承自{' '}
            <code class="rounded bg-purple-100 px-1">Fukict</code>{' '}
            基类，支持完整的生命周期和状态管理
          </p>
        </div>

        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-4 text-xl font-semibold">自动计时器</h3>
          <p class="mb-4 text-gray-600">
            这个计数器会在组件挂载后自动开始，每秒递增
          </p>
          <div class="text-4xl font-bold text-purple-600">
            <span ref={el => (this.displayRef = el)}>{this.count}</span>
          </div>
        </div>

        <div class="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
          <pre class="text-sm">
            <code>{`export class ClassComponentDemo extends Fukict<{}> {
  private count = 0;
  private timer?: number;

  mounted() {
    // 组件挂载后启动定时器
    this.timer = setInterval(() => {
      this.count++;
      this.update(this.props); // 触发重新渲染
    }, 1000);
  }

  beforeUnmount() {
    // 组件卸载前清理定时器
    clearInterval(this.timer);
  }

  render() {
    return <div>Timer: {this.count}</div>;
  }
}`}</code>
          </pre>
        </div>
      </div>
    );
  }
}
