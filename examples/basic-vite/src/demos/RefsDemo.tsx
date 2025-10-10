import { Fukict } from '@fukict/basic';

// 一个可以被 ref 引用的 Counter 组件
class Counter extends Fukict {
  state = { count: 0 };

  // 公开的方法，可以被父组件通过 ref 调用
  increment() {
    this.state.count++;
    this.update(this.props);
  }

  decrement() {
    this.state.count--;
    this.update(this.props);
  }

  reset() {
    this.state.count = 0;
    this.update(this.props);
  }

  getCount() {
    return this.state.count;
  }

  render() {
    return (
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center">
        <div class="text-4xl font-bold mb-3">{this.state.count}</div>
        <div class="flex gap-2 justify-center">
          <button
            on:click={() => this.decrement()}
            class="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            -1
          </button>
          <button
            on:click={() => this.increment()}
            class="px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            +1
          </button>
        </div>
      </div>
    );
  }
}

// 使用 Class Component 和 fukict:ref
class ParentWithRefs extends Fukict {
  mounted() {
    console.log('ParentWithRefs mounted, refs:', this.refs);
  }

  handleIncrementAll() {
    // 通过 ref 访问子组件实例并调用方法
    const counter1 = this.refs.get('counter1')?.current;
    const counter2 = this.refs.get('counter2')?.current;

    if (counter1) counter1.increment();
    if (counter2) counter2.increment();
  }

  handleResetAll() {
    const counter1 = this.refs.get('counter1')?.current;
    const counter2 = this.refs.get('counter2')?.current;

    if (counter1) counter1.reset();
    if (counter2) counter2.reset();
  }

  handleShowCounts() {
    const counter1 = this.refs.get('counter1')?.current;
    const counter2 = this.refs.get('counter2')?.current;

    if (counter1 && counter2) {
      alert(
        `Counter 1: ${counter1.getCount()}\nCounter 2: ${counter2.getCount()}\nTotal: ${counter1.getCount() + counter2.getCount()}`,
      );
    }
  }

  render() {
    return (
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-4">
          3. Class Component Refs（组件实例引用）
        </h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <Counter fukict:ref="counter1" />
          <Counter fukict:ref="counter2" />
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            on:click={() => this.handleIncrementAll()}
            class="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
          >
            全部 +1
          </button>
          <button
            on:click={() => this.handleResetAll()}
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            全部重置
          </button>
          <button
            on:click={() => this.handleShowCounts()}
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            显示计数总和
          </button>
        </div>

        <pre class="mt-4 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
          <code>{`class Counter extends Fukict {
  increment() { /* ... */ }
  getCount() { return this.state.count; }
}

class Parent extends Fukict {
  handleClick() {
    // 通过 ref 访问子组件实例
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
}`}</code>
        </pre>
      </div>
    );
  }
}

// 演示：Refs 引用
export const RefsDemo = () => {
  let inputRef: HTMLInputElement | null = null;
  let divRef: HTMLDivElement | null = null;

  const focusInput = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  const changeBackground = () => {
    if (divRef) {
      const colors = [
        'bg-red-100',
        'bg-green-100',
        'bg-blue-100',
        'bg-yellow-100',
        'bg-purple-100',
      ];
      const currentColor = colors.find(c => divRef!.classList.contains(c));
      if (currentColor) {
        divRef.classList.remove(currentColor);
      }
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      divRef.classList.add(randomColor);
    }
  };

  const scrollToElement = () => {
    if (divRef) {
      divRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div>
      <h2 class="text-3xl font-bold mb-4">Refs (fukict:ref)</h2>

      <div class="bg-pink-50 border-l-4 border-pink-500 p-4 mb-6">
        <p class="text-sm text-gray-700">
          <strong>Refs 引用：</strong>使用{' '}
          <code class="bg-pink-100 px-1 rounded">fukict:ref</code> 属性获取 DOM
          元素引用或 Class Component 实例引用，用于直接操作 DOM 或调用组件方法
        </p>
      </div>

      <div class="space-y-6">
        {/* Input Ref */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">1. DOM Ref - 聚焦输入框</h3>
          <div class="space-y-3">
            <input
              ref={el => (inputRef = el)}
              type="text"
              placeholder="点击按钮聚焦到这里"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              on:click={focusInput}
              class="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
            >
              聚焦输入框
            </button>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`let inputRef: HTMLInputElement | null = null;

const focusInput = () => {
  if (inputRef) {
    inputRef.focus();
  }
};

<input fukict:ref={el => (inputRef = el)} />
<button on:click={focusInput}>聚焦</button>`}</code>
          </pre>
        </div>

        {/* Div Ref */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">2. DOM Ref - 操作样式</h3>
          <div
            ref={el => (divRef = el)}
            class="mb-3 p-6 bg-blue-100 rounded-lg text-center transition-colors duration-300"
          >
            <p class="text-lg font-semibold">动态改变背景色</p>
          </div>
          <div class="flex gap-2">
            <button
              on:click={changeBackground}
              class="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
            >
              随机改变颜色
            </button>
            <button
              on:click={scrollToElement}
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              滚动到此元素
            </button>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`let divRef: HTMLDivElement | null = null;

const changeBackground = () => {
  if (divRef) {
    divRef.classList.add('bg-red-100');
  }
};

<div fukict:ref={el => (divRef = el)}>...</div>`}</code>
          </pre>
        </div>

        {/* Component Ref */}
        <ParentWithRefs />
      </div>
    </div>
  );
};
