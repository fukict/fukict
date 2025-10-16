import { Fukict } from '@fukict/basic';
import { createFlux } from '@fukict/flux';
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

// 创建购物车 Store
const cartStore = createFlux({
  state: {
    items: [] as CartItem[],
    loading: false,
  },

  actions: flux => {
    const actions = {
      addItem(item: Omit<CartItem, 'quantity'>) {
        const state = flux.getState();
        const existingItem = state.items.find(i => i.id === item.id);

        if (existingItem) {
          // 增加数量
          flux.setState({
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
        } else {
          // 添加新商品
          flux.setState({
            items: [...state.items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem(id: number) {
        const state = flux.getState();
        flux.setState({
          items: state.items.filter(item => item.id !== id),
        });
      },

      updateQuantity(id: number, quantity: number) {
        const state = flux.getState();
        if (quantity <= 0) {
          actions.removeItem(id);
        } else {
          flux.setState({
            items: state.items.map(item =>
              item.id === id ? { ...item, quantity } : item,
            ),
          });
        }
      },

      clearCart() {
        flux.setState({ items: [] });
      },

      async checkout() {
        flux.setState({ loading: true });
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 1500));
        flux.setState({ items: [], loading: false });
        alert('结账成功!');
      },
    };

    return actions;
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
            <div class="flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 transition">
              <div>
                <p class="text-sm font-medium text-gray-900">{product.name}</p>
                <p class="text-xs text-gray-600">¥{product.price}</p>
              </div>
              <button
                on:click={() => cartStore.actions.addItem(product)}
                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
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
          <div class="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p class="text-sm text-gray-500">购物车是空的</p>
          </div>
        ) : (
          <div class="space-y-2">
            {items.map(item => (
              <div class="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded-lg">
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
                    class="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    -
                  </button>
                  <span class="text-sm font-medium text-gray-900 w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    on:click={() =>
                      cartStore.actions.updateQuantity(
                        item.id,
                        item.quantity + 1,
                      )
                    }
                    class="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    +
                  </button>
                  <button
                    on:click={() => cartStore.actions.removeItem(item.id)}
                    class="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}

            <div class="pt-3 border-t border-gray-300">
              <div class="flex items-center justify-between mb-3">
                <p class="text-base font-semibold text-gray-900">总计:</p>
                <p class="text-lg font-bold text-green-600">¥{total}</p>
              </div>
              <button
                on:click={() => void cartStore.actions.checkout()}
                disabled={loading}
                class={`w-full px-4 py-2 text-sm font-medium text-white rounded ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
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
            <h3 class="text-base font-medium text-gray-800 mb-1">创建 Store</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 createFlux 创建状态管理 Store,定义 state 和 actions
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="说明">
            <CodeBlock
              fukict:slot="code"
              code={`import { createFlux } from '@fukict/flux';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const cartStore = createFlux({
  state: {
    items: [] as CartItem[],
    loading: false,
  },

  actions: (flux) => {
    const actions = {
      addItem(item: Omit<CartItem, 'quantity'>) {
        const state = flux.getState();
        const existing = state.items.find(i => i.id === item.id);

        if (existing) {
          flux.setState({
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          flux.setState({
            items: [...state.items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem(id: number) {
        const state = flux.getState();
        flux.setState({
          items: state.items.filter(item => item.id !== id),
        });
      },

      async checkout() {
        flux.setState({ loading: true });
        await new Promise(resolve => setTimeout(resolve, 1500));
        flux.setState({ items: [], loading: false });
      },
    };

    return actions;
  },
});`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-3 text-sm text-gray-700">
                <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p class="font-medium text-blue-900 mb-1">状态 (state)</p>
                  <p class="text-xs text-blue-700">定义应用的状态数据结构</p>
                </div>
                <div class="p-3 bg-green-50 border border-green-200 rounded">
                  <p class="font-medium text-green-900 mb-1">操作 (actions)</p>
                  <p class="text-xs text-green-700">
                    定义修改状态的方法,可以是同步或异步
                  </p>
                </div>
                <div class="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p class="font-medium text-purple-900 mb-1">
                    获取状态 (getState)
                  </p>
                  <p class="text-xs text-purple-700">
                    使用 flux.getState() 读取当前状态
                  </p>
                </div>
                <div class="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p class="font-medium text-orange-900 mb-1">
                    更新状态 (setState)
                  </p>
                  <p class="text-xs text-orange-700">
                    使用 flux.setState() 更新状态并通知订阅者
                  </p>
                </div>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 在组件中使用 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              在组件中使用
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
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
          on:click={() => cartStore.actions.checkout()}
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
            <h3 class="text-base font-medium text-gray-800 mb-1">关键概念</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              理解 @fukict/flux 的核心概念和使用模式
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-2">订阅模式</h4>
              <ul class="text-xs text-blue-700 space-y-1">
                <li>• 使用 subscribe() 订阅状态变化</li>
                <li>• 状态更新时自动通知所有订阅者</li>
                <li>• 在 mounted 订阅,beforeUnmount 取消订阅</li>
                <li>• 防止内存泄漏</li>
              </ul>
            </div>

            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 class="text-sm font-medium text-green-900 mb-2">
                响应式更新
              </h4>
              <ul class="text-xs text-green-700 space-y-1">
                <li>• setState() 触发所有订阅者回调</li>
                <li>• 组件在回调中调用 this.update()</li>
                <li>• 实现自动重新渲染</li>
                <li>• 多组件共享同一状态</li>
              </ul>
            </div>

            <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 class="text-sm font-medium text-purple-900 mb-2">异步操作</h4>
              <ul class="text-xs text-purple-700 space-y-1">
                <li>• Actions 支持异步函数</li>
                <li>• 可以包含 API 调用</li>
                <li>• 使用 loading 状态跟踪进度</li>
                <li>• 完成后更新状态</li>
              </ul>
            </div>

            <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 class="text-sm font-medium text-orange-900 mb-2">最佳实践</h4>
              <ul class="text-xs text-orange-700 space-y-1">
                <li>• 不要直接修改 state 对象</li>
                <li>• 总是通过 setState 更新状态</li>
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
