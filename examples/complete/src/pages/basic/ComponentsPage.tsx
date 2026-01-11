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
    <div class="text-sm text-gray-700">
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
        <p class="text-lg text-gray-700">Count: {this.count}</p>
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
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
        <p class="text-sm font-medium text-gray-700">Lifecycle Logs:</p>
        <div class="space-y-1 rounded bg-gray-50 p-3 text-xs text-gray-600">
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
            <h3 class="mb-1 text-base font-medium text-gray-800">
              函数组件 (defineFukict)
            </h3>
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
            <h3 class="mb-1 text-base font-medium text-gray-800">
              类组件 (Fukict)
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
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
            <h3 class="mb-1 text-base font-medium text-gray-800">生命周期</h3>
            <p class="text-sm leading-relaxed text-gray-600">
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
