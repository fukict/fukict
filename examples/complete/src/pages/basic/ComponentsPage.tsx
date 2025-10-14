import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 函数组件示例
 */
const HelloWorld = () => {
  return (
    <div class="text-gray-700 text-sm">
      <p>Hello World from Function Component!</p>
    </div>
  );
};

/**
 * 类组件计数器示例
 */
class CounterDemo extends Fukict {
  private count = 0;

  render() {
    return (
      <div class="space-y-3">
        <p class="text-gray-700 text-lg">Count: {this.count}</p>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          on:click={() => {
            this.count++;
            this.update();
          }}
        >
          Increment
        </button>
      </div>
    );
  }
}

/**
 * 生命周期示例组件
 */
class LifecycleDemo extends Fukict {
  private logs: string[] = [];

  mounted() {
    this.logs.push('Component mounted at ' + new Date().toLocaleTimeString());
    this.update();
  }

  beforeUnmount() {
    console.log('Component will unmount');
  }

  render() {
    return (
      <div class="space-y-2">
        <p class="text-gray-700 text-sm font-medium">Lifecycle Logs:</p>
        <div class="bg-gray-50 rounded p-3 text-xs text-gray-600 space-y-1">
          {this.logs.length === 0 ? (
            <p>No logs yet...</p>
          ) : (
            this.logs.map(log => <p>{log}</p>)
          )}
        </div>
      </div>
    );
  }
}

/**
 * 组件示例页面
 * 叶子页面,直接渲染内容,不需要 RouterView
 */
export class ComponentsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 函数组件示例 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              函数组件 (defineFukict)
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 defineFukict 创建函数组件的方法和最佳实践
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { defineFukict } from '@fukict/basic';

const HelloWorld = defineFukict(() => {
  return (
    <div>
      <p>Hello World from Function Component!</p>
    </div>
  );
});`}
            />
            <DemoBox fukict:slot="demo">
              <HelloWorld />
            </DemoBox>
          </SplitView>
        </div>

        {/* 类组件示例 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              类组件 (Fukict)
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 Fukict 类创建组件的方法,支持状态管理和更新
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class Counter extends Fukict {
  private count = 0;

  render() {
    return (
      <div>
        <p>Count: {this.count}</p>
        <button on:click={() => {
          this.count++;
          this.update();
        }}>
          Increment
        </button>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <CounterDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 生命周期 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">生命周期</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              组件生命周期钩子: mounted, beforeUnmount 等
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`export class MyComponent extends Fukict {
  mounted() {
    console.log('Component mounted');
  }

  beforeUnmount() {
    console.log('Component will unmount');
  }

  render() {
    return <div>Hello</div>;
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <LifecycleDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
