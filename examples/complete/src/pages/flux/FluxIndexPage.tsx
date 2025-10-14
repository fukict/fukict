import { RouteComponent } from '@fukict/router';

/**
 * Flux 模块页面
 */
export class FluxIndexPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            状态管理 (@fukict/flux)
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            轻量级状态管理库,提供 Store、Actions、Getters 等功能
          </p>
        </div>

        {/* 创建 Store */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">创建 Store</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            使用 createFlux 创建状态管理 Store
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { createFlux } from '@fukict/flux';

// 定义 Store
const counterStore = createFlux({
  // 状态
  state: {
    count: 0,
    history: [] as number[],
  },

  // 计算属性
  getters: {
    double(state) {
      return state.count * 2;
    },
    isEven(state) {
      return state.count % 2 === 0;
    },
  },

  // 同步变更
  mutations: {
    increment(state) {
      state.count++;
      state.history.push(state.count);
    },
    decrement(state) {
      state.count--;
      state.history.push(state.count);
    },
    reset(state) {
      state.count = 0;
      state.history = [];
    },
  },

  // 异步操作
  actions: {
    async incrementAsync({ commit }) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      commit('increment');
    },
  },
});`}
            </pre>
          </div>
        </div>

        {/* 在组件中使用 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">在组件中使用</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            订阅 Store 状态变化并更新组件
          </p>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <pre class="text-xs text-gray-700 leading-relaxed">
              {`import { Fukict } from '@fukict/basic';
import { counterStore } from './store';

export class Counter extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 订阅状态变化
    this.unsubscribe = counterStore.subscribe(() => {
      this.update();  // 状态变化时重新渲染
    });
  }

  beforeUnmount() {
    // 取消订阅
    this.unsubscribe?.();
  }

  render() {
    const { count, history } = counterStore.state;
    const { double, isEven } = counterStore.getters;

    return (
      <div>
        <p>Count: {count}</p>
        <p>Double: {double}</p>
        <p>Is Even: {isEven ? 'Yes' : 'No'}</p>

        <button on:click={() => counterStore.commit('increment')}>
          +1
        </button>
        <button on:click={() => counterStore.commit('decrement')}>
          -1
        </button>
        <button on:click={() => counterStore.dispatch('incrementAsync')}>
          Async +1
        </button>
        <button on:click={() => counterStore.commit('reset')}>
          Reset
        </button>

        <p>History: {history.join(', ')}</p>
      </div>
    );
  }
}`}
            </pre>
          </div>
        </div>

        {/* Actions vs Mutations */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">
            Actions vs Mutations
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
              <h3 class="text-base font-medium text-gray-900 mb-2">
                Mutations
              </h3>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>同步操作</li>
                <li>直接修改 state</li>
                <li>通过 commit 调用</li>
                <li>可追踪状态变化</li>
              </ul>
            </div>
            <div class="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
              <h3 class="text-base font-medium text-gray-900 mb-2">Actions</h3>
              <ul class="text-sm text-gray-700 space-y-1">
                <li>异步操作</li>
                <li>通过 commit 调用 mutations</li>
                <li>通过 dispatch 调用</li>
                <li>可以包含业务逻辑</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 最佳实践 */}
        <div class="bg-gray-50/50 border border-gray-200/60 rounded-lg p-4">
          <h3 class="text-base font-medium text-gray-900 mb-2">最佳实践</h3>
          <ul class="text-sm text-gray-700 space-y-1">
            <li>始终在 mounted 时订阅,beforeUnmount 时取消订阅</li>
            <li>不要直接修改 state,始终通过 mutations</li>
            <li>异步操作放在 actions 中,同步操作放在 mutations 中</li>
            <li>Getters 用于派生状态,不要在 getters 中修改 state</li>
          </ul>
        </div>
      </div>
    );
  }
}
