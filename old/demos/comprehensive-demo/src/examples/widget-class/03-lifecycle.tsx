import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';

class LifecycleDemo extends Widget {
  private logs: string[] = [];

  onMounted() {
    this.addLog('✅ 组件已挂载 (onMounted)');

    // 模拟异步操作
    setTimeout(() => {
      this.addLog('⏰ 定时器触发（2秒后）');
    }, 2000);
  }

  onUnmounting() {
    this.addLog('🔴 组件即将卸载 (onUnmounting)');
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="p-4 bg-green-50 rounded-lg">
          <h4 class="font-semibold text-green-900 mb-2">生命周期日志</h4>
          <div class="space-y-1">
            {this.logs.length === 0 ? (
              <p class="text-gray-500">等待生命周期事件...</p>
            ) : (
              this.logs.map((log, i) => (
                <div key={i} class="text-sm text-green-800">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  private addLog(message: string) {
    this.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
    console.log(message);
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="03. 生命周期"
      description="使用 onMounted 和 onUnmounting 生命周期钩子"
    >
      <DemoCard title="运行效果">
        <LifecycleDemo />
        <p class="mt-4 text-sm text-gray-600">
          💡 打开浏览器控制台查看完整的生命周期日志
        </p>
      </DemoCard>
      </ExampleLayout>
    );
  }
}
