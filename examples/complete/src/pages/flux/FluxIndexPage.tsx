import { Fukict } from '@fukict/basic';
import { type ActionContext, defineStore } from '@fukict/flux';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

// 购物车商品接口
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
}

// 创建购物车 Store
const cartStore = defineStore({
  scope: 'cart',

  state: {
    items: [] as CartItem[],
    loading: false,
  } as CartState,

  actions: {
    addItem(state: CartState, item: Omit<CartItem, 'quantity'>) {
      const existingItem = state.items.find(i => i.id === item.id);

      if (existingItem) {
        return {
          items: state.items.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      } else {
        return {
          items: [...state.items, { ...item, quantity: 1 }],
        };
      }
    },

    removeItem(state: CartState, id: number) {
      return {
        items: state.items.filter(item => item.id !== id),
      };
    },

    updateQuantity(state: CartState, id: number, quantity: number) {
      if (quantity <= 0) {
        return {
          items: state.items.filter(item => item.id !== id),
        };
      }
      return {
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item,
        ),
      };
    },

    clearCart() {
      return { items: [] };
    },
  },

  asyncActions: {
    async checkout(ctx: ActionContext<CartState>) {
      ctx.setState({ loading: true });
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 1500));
      ctx.setState({ items: [], loading: false });
      alert('结账成功!');
    },
  },
});

// 可用商品列表
const availableProducts = [
  { id: 1, name: 'MacBook Pro', price: 12999 },
  { id: 2, name: 'iPhone 15', price: 5999 },
  { id: 3, name: 'AirPods Pro', price: 1999 },
  { id: 4, name: 'iPad Air', price: 4799 },
  { id: 5, name: 'Apple Watch', price: 2999 },
];

// 商品列表组件
class ProductList extends Fukict {
  render() {
    return (
      <div class="space-y-2">
        <h4 class="text-sm font-medium text-gray-900">可选商品</h4>
        <div class="space-y-2">
          {availableProducts.map(product => (
            <div class="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-3 transition hover:border-blue-400">
              <div>
                <p class="text-sm font-medium text-gray-900">{product.name}</p>
                <p class="text-xs text-gray-600">¥{product.price}</p>
              </div>
              <button
                on:click={() => cartStore.actions.addItem(product)}
                class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                加入购物车
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

// 购物车组件
class ShoppingCart extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 订阅 store 变化
    this.unsubscribe = cartStore.subscribe(() => {
      this.update(this.props);
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { items, loading } = cartStore.getState();
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return (
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">购物车</h4>
          {items.length > 0 && (
            <button
              on:click={() => cartStore.actions.clearCart()}
              class="text-xs text-red-600 hover:text-red-700"
            >
              清空购物车
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p class="text-sm text-gray-500">购物车是空的</p>
          </div>
        ) : (
          <div class="space-y-2">
            {items.map(item => (
              <div class="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 p-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{item.name}</p>
                  <p class="text-xs text-gray-600">¥{item.price}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    on:click={() =>
                      cartStore.actions.updateQuantity(
                        item.id,
                        item.quantity - 1,
                      )
                    }
                    class="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-sm text-gray-700 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span class="w-8 text-center text-sm font-medium text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    on:click={() =>
                      cartStore.actions.updateQuantity(
                        item.id,
                        item.quantity + 1,
                      )
                    }
                    class="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-sm text-gray-700 hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    on:click={() => cartStore.actions.removeItem(item.id)}
                    class="ml-2 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}

            <div class="border-t border-gray-300 pt-3">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-base font-semibold text-gray-900">总计:</p>
                <p class="text-lg font-bold text-green-600">¥{total}</p>
              </div>
              <button
                on:click={() => void cartStore.asyncActions.checkout()}
                disabled={loading}
                class={`w-full rounded px-4 py-2 text-sm font-medium text-white ${
                  loading
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? '处理中...' : '结账'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

/**
 * Flux 完整示例页面
 */
export class FluxIndexPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 创建 Store */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">创建 Store</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 defineStore 创建状态管理 Store,定义 state 和 actions
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`import { defineStore } from '@fukict/flux';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const cartStore = defineStore({
  scope: 'cart',

  state: {
    items: [] as CartItem[],
    loading: false,
  },

  actions: {
    addItem(state, item: Omit<CartItem, 'quantity'>) {
      const existing = state.items.find(i => i.id === item.id);

      if (existing) {
        return {
          items: state.items.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      } else {
        return {
          items: [...state.items, { ...item, quantity: 1 }],
        };
      }
    },

    removeItem(state, id: number) {
      return {
        items: state.items.filter(item => item.id !== id),
      };
    },
  },

  asyncActions: {
    async checkout(ctx) {
      ctx.setState({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 1500));
      ctx.setState({ items: [], loading: false });
    },
  },
});`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="rounded border border-blue-200 bg-blue-50 p-3">
                  <p class="mb-1 font-medium text-blue-900">状态 (state)</p>
                  <p class="text-xs text-blue-700">定义应用的状态数据结构</p>
                </div>
                <div class="rounded border border-green-200 bg-green-50 p-3">
                  <p class="mb-1 font-medium text-green-900">操作 (actions)</p>
                  <p class="text-xs text-green-700">
                    定义修改状态的方法,同步 action 返回 Partial&lt;State&gt;
                  </p>
                </div>
                <div class="rounded border border-purple-200 bg-purple-50 p-3">
                  <p class="mb-1 font-medium text-purple-900">
                    异步操作 (asyncActions)
                  </p>
                  <p class="text-xs text-purple-700">
                    通过 ctx.setState() 多次更新状态
                  </p>
                </div>
                <div class="rounded border border-orange-200 bg-orange-50 p-3">
                  <p class="mb-1 font-medium text-orange-900">作用域 (scope)</p>
                  <p class="text-xs text-orange-700">
                    必填，用于 DevTools 识别和调试
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 在组件中使用 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              在组件中使用
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              订阅 Store 状态变化并在组件中响应更新
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';
import { cartStore } from './store';

class ShoppingCart extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 订阅状态变化
    this.unsubscribe = cartStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    // 取消订阅
    this.unsubscribe?.();
  }

  render() {
    const { items, loading } = cartStore.getState();
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return (
      <div>
        {items.map(item => (
          <div>
            <p>{item.name} x {item.quantity}</p>
            <p>¥{item.price}</p>
            <button on:click={() =>
              cartStore.actions.removeItem(item.id)
            }>
              删除
            </button>
          </div>
        ))}
        <p>总计: ¥{total}</p>
        <button
          on:click={() => cartStore.asyncActions.checkout()}
          disabled={loading}
        >
          {loading ? '处理中...' : '结账'}
        </button>
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="grid grid-cols-2 gap-4">
                <ProductList />
                <ShoppingCart />
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 关键概念 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">关键概念</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              理解 @fukict/flux 的核心概念和使用模式
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-blue-900">订阅模式</h4>
              <ul class="space-y-1 text-xs text-blue-700">
                <li>• 使用 subscribe() 订阅状态变化</li>
                <li>• 状态更新时自动通知所有订阅者</li>
                <li>• 在 mounted 订阅,beforeUnmount 取消订阅</li>
                <li>• 防止内存泄漏</li>
              </ul>
            </div>

            <div class="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-green-900">
                响应式更新
              </h4>
              <ul class="space-y-1 text-xs text-green-700">
                <li>• setState() 触发所有订阅者回调</li>
                <li>• 组件在回调中调用 this.update()</li>
                <li>• 实现自动重新渲染</li>
                <li>• 多组件共享同一状态</li>
              </ul>
            </div>

            <div class="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-purple-900">异步操作</h4>
              <ul class="space-y-1 text-xs text-purple-700">
                <li>• asyncActions 支持异步函数</li>
                <li>• 可以包含 API 调用</li>
                <li>• 使用 loading 状态跟踪进度</li>
                <li>• 通过 ctx.setState() 多次更新</li>
              </ul>
            </div>

            <div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 class="mb-2 text-sm font-medium text-orange-900">最佳实践</h4>
              <ul class="space-y-1 text-xs text-orange-700">
                <li>• 不要直接修改 state 对象</li>
                <li>• 总是通过 actions 更新状态</li>
                <li>• Actions 中使用不可变更新模式</li>
                <li>• 妥善管理订阅生命周期</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
