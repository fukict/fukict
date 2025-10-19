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
      <div class="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center text-white">
        <div class="mb-3 text-4xl font-bold">{this.state.count}</div>
        <div class="flex justify-center gap-2">
          <button
            on:click={() => this.decrement()}
            class="rounded bg-white/20 px-4 py-2 transition-colors hover:bg-white/30"
          >
            -1
          </button>
          <button
            on:click={() => this.increment()}
            class="rounded bg-white/20 px-4 py-2 transition-colors hover:bg-white/30"
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
  // 声明 refs 的类型（直接是组件实例，不需要 Ref 包装）
  declare readonly refs: {
    counter1: Counter;
    counter2: Counter;
  };

  mounted() {
    console.log('ParentWithRefs mounted, refs:', this.refs);
  }

  handleIncrementAll() {
    // 直接访问子组件实例并调用方法
    this.refs.counter1?.increment();
    this.refs.counter2?.increment();
  }

  handleResetAll() {
    this.refs.counter1?.reset();
    this.refs.counter2?.reset();
  }

  handleShowCounts() {
    const counter1 = this.refs.counter1;
    const counter2 = this.refs.counter2;

    if (counter1 && counter2) {
      alert(
        `Counter 1: ${counter1.getCount()}\nCounter 2: ${counter2.getCount()}\nTotal: ${counter1.getCount() + counter2.getCount()}`,
      );
    }
  }

  render() {
    return (
      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-xl font-semibold">
          3. Class Component Refs（组件实例引用）
        </h3>

        <div class="mb-4 grid grid-cols-2 gap-4">
          <Counter fukict:ref="counter1" />
          <Counter fukict:ref="counter2" />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            on:click={() => this.handleIncrementAll()}
            class="rounded bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
          >
            全部 +1
          </button>
          <button
            on:click={() => this.handleResetAll()}
            class="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            全部重置
          </button>
          <button
            on:click={() => this.handleShowCounts()}
            class="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
          >
            显示计数总和
          </button>
        </div>

        <pre class="mt-4 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
          <code>{`class Counter extends Fukict {
  increment() { /* ... */ }
  getCount() { return this.state.count; }
}

class Parent extends Fukict {
  // 类型安全的 refs 声明
  declare readonly refs: {
    myCounter: Counter;
  };

  handleClick() {
    // 直接访问子组件实例（不需要 .current）
    this.refs.myCounter?.increment();
    console.log(this.refs.myCounter?.getCount());
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
      <h2 class="mb-4 text-3xl font-bold">Refs (fukict:ref)</h2>

      <div class="mb-6 border-l-4 border-pink-500 bg-pink-50 p-4">
        <p class="text-sm text-gray-700">
          <strong>Refs 引用：</strong>使用{' '}
          <code class="rounded bg-pink-100 px-1">fukict:ref</code> 属性获取 DOM
          元素引用或 Class Component 实例引用，用于直接操作 DOM 或调用组件方法
        </p>
      </div>

      <div class="space-y-6">
        {/* Input Ref */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">1. DOM Ref - 聚焦输入框</h3>
          <div class="space-y-3">
            <input
              ref={el => (inputRef = el)}
              type="text"
              placeholder="点击按钮聚焦到这里"
              class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
            <button
              on:click={focusInput}
              class="rounded bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
            >
              聚焦输入框
            </button>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
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
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">2. DOM Ref - 操作样式</h3>
          <div
            ref={el => (divRef = el)}
            class="mb-3 rounded-lg bg-blue-100 p-6 text-center transition-colors duration-300"
          >
            <p class="text-lg font-semibold">动态改变背景色</p>
          </div>
          <div class="flex gap-2">
            <button
              on:click={changeBackground}
              class="rounded bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
            >
              随机改变颜色
            </button>
            <button
              on:click={scrollToElement}
              class="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              滚动到此元素
            </button>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
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
