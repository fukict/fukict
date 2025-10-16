import { Fukict, defineFukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

// 演示函数组件中的 ref
const FunctionRefDemo = defineFukict(() => {
  let inputRef: HTMLInputElement | null = null;

  const focusInput = () => {
    if (inputRef) {
      inputRef.focus();
      inputRef.style.borderColor = '#3b82f6';
      setTimeout(() => {
        if (inputRef) inputRef.style.borderColor = '';
      }, 500);
    }
  };

  const clearInput = () => {
    if (inputRef) {
      inputRef.value = '';
      inputRef.focus();
    }
  };

  return (
    <div class="space-y-3">
      <input
        ref={el => (inputRef = el)}
        type="text"
        placeholder="点击按钮聚焦"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <div class="flex gap-2">
        <button
          on:click={focusInput}
          class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          聚焦输入框
        </button>
        <button
          on:click={clearInput}
          class="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          清空输入框
        </button>
      </div>
    </div>
  );
});

// 演示 Class 组件中的 fukict:ref
class CounterComponent extends Fukict {
  state = { count: 0 };

  increment() {
    this.state.count++;
    this.update(this.props);
  }

  decrement() {
    this.state.count--;
    this.update(this.props);
  }

  getCount() {
    return this.state.count;
  }

  reset() {
    this.state.count = 0;
    this.update(this.props);
  }

  render() {
    return (
      <div class="space-y-3">
        <p class="text-2xl font-bold text-gray-900">计数: {this.state.count}</p>
        <div class="flex gap-2">
          <button
            on:click={() => this.increment()}
            class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
          >
            +1
          </button>
          <button
            on:click={() => this.decrement()}
            class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            -1
          </button>
          <button
            on:click={() => this.reset()}
            class="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
          >
            重置
          </button>
        </div>
      </div>
    );
  }
}

class ParentWithRef extends Fukict {
  private logs: string[] = [];

  handleIncrement() {
    const counter = this.refs.get('myCounter')?.current as
      | CounterComponent
      | undefined;
    if (counter) {
      counter.increment();
      const count = counter.getCount();
      this.logs.push(`外部调用 increment(), 当前值: ${count}`);
      this.update(this.props);
    }
  }

  handleGetValue() {
    const counter = this.refs.get('myCounter')?.current as
      | CounterComponent
      | undefined;
    if (counter) {
      const count = counter.getCount();
      this.logs.push(`获取计数器值: ${count}`);
      this.update(this.props);
    }
  }

  handleReset() {
    const counter = this.refs.get('myCounter')?.current as
      | CounterComponent
      | undefined;
    if (counter) {
      counter.reset();
      this.logs.push('外部调用 reset()');
      this.update(this.props);
    }
  }

  clearLogs() {
    this.logs = [];
    this.update(this.props);
  }

  render() {
    return (
      <div class="space-y-4">
        <CounterComponent fukict:ref="myCounter" />

        <div class="flex flex-wrap gap-2">
          <button
            on:click={() => this.handleIncrement()}
            class="rounded-md bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
          >
            外部控制 +1
          </button>
          <button
            on:click={() => this.handleGetValue()}
            class="rounded-md bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-700"
          >
            获取值
          </button>
          <button
            on:click={() => this.handleReset()}
            class="rounded-md bg-orange-600 px-3 py-2 text-xs text-white hover:bg-orange-700"
          >
            外部重置
          </button>
        </div>

        {this.logs.length > 0 && (
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div class="mb-2 flex items-center justify-between">
              <h4 class="text-xs font-medium text-gray-900">操作日志:</h4>
              <button
                on:click={() => this.clearLogs()}
                class="text-xs text-gray-600 hover:text-gray-900"
              >
                清空
              </button>
            </div>
            <ul class="space-y-1 text-xs text-gray-600">
              {this.logs.map((log, index) => (
                <li>
                  [{index + 1}] {log}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

// 演示 fukict:detach
class ExpensiveComponent extends Fukict {
  private renderCount = 0;

  render() {
    this.renderCount++;
    return (
      <div class="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm">
        <p class="font-medium text-yellow-900">
          昂贵的组件 (渲染次数: {this.renderCount})
        </p>
        <p class="mt-1 text-xs text-yellow-700">
          使用 fukict:detach，只渲染一次
        </p>
      </div>
    );
  }
}

class NormalComponent extends Fukict {
  private renderCount = 0;

  render() {
    this.renderCount++;
    return (
      <div class="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm">
        <p class="font-medium text-blue-900">
          普通组件 (渲染次数: {this.renderCount})
        </p>
        <p class="mt-1 text-xs text-blue-700">会随父组件更新而重新渲染</p>
      </div>
    );
  }
}

class ParentWithDetach extends Fukict {
  private count = 0;

  render() {
    return (
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <p class="text-sm text-gray-700">父组件更新次数: {this.count}</p>
          <button
            on:click={() => {
              this.count++;
              this.update();
            }}
            class="rounded-md bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
          >
            更新父组件
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <ExpensiveComponent fukict:detach />
          <NormalComponent />
        </div>
      </div>
    );
  }
}

/**
 * Refs 页面
 */
export class RefsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 函数组件中的 ref */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              函数组件中的 ref
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              在函数组件中使用 ref 获取 DOM 元素的引用
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { defineFukict } from '@fukict/basic';

const MyComponent = defineFukict(() => {
  let inputRef: HTMLInputElement | null = null;

  const focusInput = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  return (
    <div>
      <input
        ref={el => inputRef = el}
        type="text"
        placeholder="点击按钮聚焦"
      />
      <button on:click={focusInput}>
        聚焦输入框
      </button>
    </div>
  );
});`}
            />
            <DemoBox fukict:slot="demo">
              <FunctionRefDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* Class 组件中的 fukict:ref */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Class 组件中的 fukict:ref
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              在 Class 组件中使用 fukict:ref 获取子组件实例的引用
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

class Counter extends Fukict {
  state = { count: 0 };

  increment() {
    this.state.count++;
    this.update(this.props);
  }

  getCount() {
    return this.state.count;
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button on:click={() => this.increment()}>
          +1
        </button>
      </div>
    );
  }
}

class Parent extends Fukict {
  handleClick() {
    const counter = this.refs.get('myCounter')?.current;
    if (counter) {
      counter.increment();
      console.log(counter.getCount());
    }
  }

  render() {
    return (
      <div>
        <Counter fukict:ref="myCounter" />
        <button on:click={() => this.handleClick()}>
          外部控制
        </button>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <ParentWithRef />
            </DemoBox>
          </SplitView>
        </div>

        {/* fukict:detach */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              fukict:detach
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              阻止组件在父组件更新时被重新渲染（性能优化）
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

export class ParentComponent extends Fukict {
  private count = 0;

  render() {
    return (
      <div>
        <p>Count: {this.count}</p>
        <button on:click={() => {
          this.count++;
          this.update();
        }}>
          增加
        </button>

        {/* 这个组件不会因为父组件更新而重新渲染 */}
        <ExpensiveComponent fukict:detach />
      </div>
    );
  }
}

class ExpensiveComponent extends Fukict {
  render() {
    console.log('ExpensiveComponent rendered');
    return <div>我只渲染一次</div>;
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <ParentWithDetach />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
