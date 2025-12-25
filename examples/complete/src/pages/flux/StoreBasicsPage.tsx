import { Fukict } from '@fukict/basic';
import { defineStore } from '@fukict/flux';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 简单计数器 Store (使用新的 defineStore API)
 */
interface CounterState {
  count: number;
}

const counterStore = defineStore({
  state: {
    count: 0,
  } as CounterState,
  actions: {
    increment: (state: CounterState) => ({ count: state.count + 1 }),
    decrement: (state: CounterState) => ({ count: state.count - 1 }),
    add: (state: CounterState, amount: number) => ({
      count: state.count + amount,
    }),
  },
});

/**
 * 计数器演示
 */
class CounterDemo extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = counterStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { count } = counterStore.state;
    const { increment, decrement, add } = counterStore.actions;

    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4">
          <p class="text-gray-700">
            <strong>Count:</strong> {count}
          </p>
          <p class="text-gray-700">
            <strong>Double:</strong> {count * 2}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            on:click={() => increment()}
          >
            +1
          </button>
          <button
            class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            on:click={() => add(5)}
          >
            +5
          </button>
          <button
            class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            on:click={() => decrement()}
          >
            -1
          </button>
        </div>
      </div>
    );
  }
}

/**
 * Products Store (演示计算值)
 */
interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductsState {
  products: Product[];
}

const productsStore = defineStore({
  state: {
    products: [
      { id: 1, name: 'Product A', price: 10 },
      { id: 2, name: 'Product B', price: 20 },
      { id: 3, name: 'Product C', price: 30 },
    ],
  } as ProductsState,
});

// Selector 函数 (在组件外定义)
function getProductStats(state: ProductsState) {
  const total = state.products.reduce((sum, p) => sum + p.price, 0);
  return {
    count: state.products.length,
    total,
    average: total / state.products.length,
  };
}

function getProductById(state: ProductsState, id: number) {
  return state.products.find(p => p.id === id);
}

/**
 * Getters 演示 (使用 selector 函数)
 */
class GettersDemo extends Fukict {
  private selectedId = 1;
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = productsStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const state = productsStore.state as ProductsState;
    const stats = getProductStats(state);
    const selectedProduct = getProductById(state, this.selectedId);

    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>Product Count:</strong> {stats.count}
          </p>
          <p class="text-gray-700">
            <strong>Total Price:</strong> ${stats.total}
          </p>
          <p class="text-gray-700">
            <strong>Average Price:</strong> ${stats.average.toFixed(2)}
          </p>
        </div>
        <div class="space-y-2">
          <p class="text-sm text-gray-700">选择产品 ID:</p>
          <div class="flex gap-2">
            {[1, 2, 3].map(id => (
              <button
                class={`rounded px-3 py-1.5 text-sm ${
                  this.selectedId === id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                on:click={() => {
                  this.selectedId = id;
                  this.update();
                }}
              >
                {id}
              </button>
            ))}
          </div>
          {selectedProduct && (
            <div class="rounded border border-blue-200 bg-blue-50 p-3 text-sm">
              <p class="text-blue-900">
                <strong>Name:</strong> {selectedProduct.name}
              </p>
              <p class="text-blue-900">
                <strong>Price:</strong> ${selectedProduct.price}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

/**
 * Store 基础页面
 */
export class StoreBasicsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 创建 Store */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">创建 Store</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 defineStore 创建状态管理 Store（推荐）
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { defineStore } from '@fukict/flux';

// 使用 defineStore 创建 Store（推荐）
const counterStore = defineStore({
  state: {
    count: 0,
  },
  actions: {
    // 同步 action: (state, ...args) => Partial<State>
    increment: state => ({ count: state.count + 1 }),
    decrement: state => ({ count: state.count - 1 }),
    add: (state, amount: number) => ({ count: state.count + amount }),
  },
});

// 在组件中使用
class Counter extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = counterStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    // 直接访问 state（更简洁）
    const { count } = counterStore.state;
    return (
      <button on:click={() => counterStore.actions.increment()}>
        Count: {count}
      </button>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <CounterDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* State */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              State (状态)
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              存储应用的状态数据，通过 store.state 直接访问
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="使用说明">
            <CodeBlock
              fukict:slot="code"
              code={`const store = defineStore({
  state: {
    user: null,
    isLoggedIn: false,
    products: [],
    cart: {
      items: [],
      total: 0,
    },
  },
  actions: {
    // actions 在这里定义
  },
});

// 访问状态（两种方式）
// 方式 1: 直接访问 state（推荐）
const { user, cart } = store.state;
console.log(user);
console.log(cart.items);

// 方式 2: 使用 getState()
const state = store.getState();
console.log(state.user);`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p class="font-medium text-gray-900">State 特点:</p>
                <ul class="ml-2 list-inside list-disc space-y-1">
                  <li>存储应用的全局状态</li>
                  <li>支持任意类型的数据</li>
                  <li>
                    通过 <code>store.state</code> 直接访问
                  </li>
                  <li>只能通过 actions 修改</li>
                </ul>
                <div class="mt-3 rounded border border-yellow-200 bg-yellow-50 p-3">
                  <p class="text-xs text-yellow-700">
                    <strong>提示:</strong> 不要直接修改 state，应该使用 actions
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* Selectors (计算值) */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Selectors (计算属性)
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              基于 state 派生的计算值，使用纯函数实现
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const store = defineStore({
  state: {
    products: [
      { id: 1, name: 'A', price: 10 },
      { id: 2, name: 'B', price: 20 },
    ],
  },
});

// Selector 函数 (在组件外定义)
function getProductStats(state) {
  const total = state.products.reduce((sum, p) => sum + p.price, 0);
  return {
    count: state.products.length,
    total,
    average: total / state.products.length,
  };
}

function getProductById(state, id) {
  return state.products.find(p => p.id === id);
}

// 在组件中使用
const stats = getProductStats(store.state);
const product = getProductById(store.state, 1);`}
            />
            <DemoBox fukict:slot="demo">
              <GettersDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
