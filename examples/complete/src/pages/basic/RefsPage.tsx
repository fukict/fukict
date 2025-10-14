import { RouteComponent } from '@fukict/router';

/**
 * Refs 页面
 */
export class RefsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-8">
        {/* 函数组件中的 ref */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">函数组件中的 ref</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            在函数组件中使用 ref 获取 DOM 元素的引用
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { defineFukict } from '@fukict/basic';

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
            </pre>
          </div>
        </div>

        {/* Class 组件中的 fukict:ref */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">
            Class 组件中的 fukict:ref
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            在 Class 组件中使用 fukict:ref 获取组件实例的引用
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { Fukict } from '@fukict/basic';

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
        <button on:click={() => this.increment()}>+1</button>
      </div>
    );
  }
}

class Parent extends Fukict {
  handleClick() {
    // 通过 fukict:ref 访问子组件实例
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
            </pre>
          </div>
        </div>

        {/* fukict:detach */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">fukict:detach</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            阻止组件在父组件更新时被重新渲染（性能优化）
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { Fukict } from '@fukict/basic';

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
            </pre>
          </div>
        </div>

        {/* ref vs fukict:ref 对比 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">ref vs fukict:ref</h3>
          <div class="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
            <ul class="text-sm text-gray-700 space-y-2">
              <li>
                <strong class="text-gray-900">ref</strong>: 用于函数组件中获取
                DOM 元素引用
              </li>
              <li>
                <strong class="text-gray-900">fukict:ref</strong>: 用于 Class
                组件中获取子组件实例引用
              </li>
              <li>
                <strong class="text-gray-900">fukict:detach</strong>:
                用于优化性能，阻止组件重新渲染
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
