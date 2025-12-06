import { Fukict } from '@fukict/basic';
import { createFlux } from '@fukict/flux';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 同步操作 Store (演示直接的状态修改)
 */
const syncStore = createFlux({
  state: {
    count: 0,
    items: [] as string[],
  },
  actions: flux => ({
    increment() {
      const state = flux.getState();
      flux.setState({ count: state.count + 1 });
    },
    incrementBy(amount: number) {
      const state = flux.getState();
      flux.setState({ count: state.count + amount });
    },
    addItem(item: string) {
      const state = flux.getState();
      flux.setState({ items: [...state.items, item] });
    },
    reset() {
      flux.setState({ count: 0, items: [] });
    },
  }),
});

/**
 * 同步操作演示
 */
class SyncDemo extends Fukict {
  private unsubscribe?: () => void;
  private inputValue = '';

  mounted() {
    this.unsubscribe = syncStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const state = syncStore.getState();
    const { increment, incrementBy, addItem, reset } = syncStore.actions;

    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>Count:</strong> {state.count}
          </p>
          <p class="text-gray-700">
            <strong>Items:</strong> {state.items.join(', ') || '(empty)'}
          </p>
        </div>
        <div class="space-y-2">
          <div class="flex gap-2">
            <button
              class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
              on:click={() => increment()}
            >
              +1
            </button>
            <button
              class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
              on:click={() => incrementBy(5)}
            >
              +5
            </button>
            <button
              class="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
              on:click={() => reset()}
            >
              Reset
            </button>
          </div>
          <div class="flex gap-2">
            <input
              type="text"
              class="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
              placeholder="Enter item name"
              value={this.inputValue}
              on:input={(e: Event) => {
                this.inputValue = (e.target as HTMLInputElement).value;
                this.update();
              }}
            />
            <button
              class="rounded bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
              on:click={() => {
                if (this.inputValue.trim()) {
                  addItem(this.inputValue.trim());
                  this.inputValue = '';
                  this.update();
                }
              }}
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * 异步操作 Store
 */
const asyncStore = createFlux({
  state: {
    user: null as { id: number; name: string } | null,
    loading: false,
    logs: [] as string[],
  },
  actions: flux => ({
    async loadUser(userId: number) {
      const state = flux.getState();
      const newLogs = [`Loading user ${userId}...`, ...state.logs];
      if (newLogs.length > 5) newLogs.pop();

      flux.setState({ loading: true, logs: newLogs });

      try {
        // 模拟异步请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = { id: userId, name: `User ${userId}` };

        const currentState = flux.getState();
        const successLogs = [
          `User ${userId} loaded successfully`,
          ...currentState.logs,
        ];
        if (successLogs.length > 5) successLogs.pop();

        flux.setState({ user, logs: successLogs });
      } catch (_error) {
        const currentState = flux.getState();
        const errorLogs = [
          `Failed to load user ${userId}`,
          ...currentState.logs,
        ];
        if (errorLogs.length > 5) errorLogs.pop();

        flux.setState({ logs: errorLogs });
      } finally {
        flux.setState({ loading: false });
      }
    },
    async logout() {
      const state = flux.getState();
      const logoutLogs = ['Logging out...', ...state.logs];
      if (logoutLogs.length > 5) logoutLogs.pop();

      flux.setState({ loading: true, logs: logoutLogs });

      await new Promise(resolve => setTimeout(resolve, 500));

      const currentState = flux.getState();
      const completeLogs = ['Logged out', ...currentState.logs];
      if (completeLogs.length > 5) completeLogs.pop();

      flux.setState({ user: null, loading: false, logs: completeLogs });
    },
  }),
});

/**
 * 异步操作演示
 */
class AsyncDemo extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = asyncStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const state = asyncStore.getState();
    const { loadUser, logout } = asyncStore.actions;

    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>Loading:</strong> {state.loading ? 'Yes' : 'No'}
          </p>
          <p class="text-gray-700">
            <strong>User:</strong>{' '}
            {state.user
              ? `${state.user.name} (ID: ${state.user.id})`
              : '(none)'}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={state.loading}
            on:click={() => loadUser(1)}
          >
            Load User 1
          </button>
          <button
            class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600 disabled:opacity-50"
            disabled={state.loading}
            on:click={() => loadUser(2)}
          >
            Load User 2
          </button>
          <button
            class="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-50"
            disabled={state.loading}
            on:click={() => logout()}
          >
            Logout
          </button>
        </div>
        <div class="rounded bg-gray-50 p-3">
          <p class="mb-2 text-sm font-medium text-gray-900">操作日志:</p>
          <div class="space-y-1 font-mono text-xs text-gray-600">
            {state.logs.length === 0 ? (
              <p class="text-gray-400">点击按钮查看操作日志...</p>
            ) : (
              state.logs.map(log => <p>{log}</p>)
            )}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Actions 页面
 */
export class ActionsMutationsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 同步操作 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">同步操作</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              在 actions 中直接修改状态
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const store = createFlux({
  state: {
    count: 0,
    items: [],
  },
  actions: flux => ({
    // 简单修改
    increment() {
      const state = flux.getState();
      flux.setState({ count: state.count + 1 });
    },

    // 带参数的修改
    incrementBy(amount: number) {
      const state = flux.getState();
      flux.setState({ count: state.count + amount });
    },

    // 数组操作
    addItem(item: string) {
      const state = flux.getState();
      flux.setState({ items: [...state.items, item] });
    },

    // 批量修改
    reset() {
      flux.setState({ count: 0, items: [] });
    },
  }),
});

// 调用 actions
store.actions.increment();
store.actions.incrementBy(5);
store.actions.addItem('New Item');`}
            />
            <DemoBox fukict:slot="demo">
              <SyncDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 异步操作 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">异步操作</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              Actions 可以包含异步逻辑,如 API 调用
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`const store = createFlux({
  state: {
    user: null,
    loading: false,
  },
  actions: flux => ({
    // 异步加载用户
    async loadUser(userId: number) {
      flux.setState({ loading: true });
      try {
        const user = await fetchUser(userId);
        flux.setState({ user });
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        flux.setState({ loading: false });
      }
    },

    // 登出
    async logout() {
      flux.setState({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 500));
      flux.setState({ user: null, loading: false });
    },
  }),
});

// 调用异步 actions
await store.actions.loadUser(123);
await store.actions.logout();`}
            />
            <DemoBox fukict:slot="demo">
              <AsyncDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* Actions 最佳实践 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Actions 最佳实践
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              如何正确使用 Actions
            </p>
          </div>

          <SplitView leftTitle="正确的做法" rightTitle="注意事项">
            <CodeBlock
              fukict:slot="code"
              code={`// ✅ 推荐: 使用 flux.getState() 获取最新状态
actions: flux => ({
  increment() {
    const state = flux.getState();
    flux.setState({ count: state.count + 1 });
  },

  // ✅ 异步操作中多次获取状态
  async loadData() {
    const state1 = flux.getState();
    flux.setState({ loading: true });

    const data = await fetchData();

    const state2 = flux.getState();
    flux.setState({
      data,
      count: state2.count + 1,
      loading: false
    });
  }
})

// ✅ 组件中使用
const state = store.getState();
store.actions.increment();`}
            />
            <CodeBlock
              fukict:slot="demo"
              code={`// ❌ 避免: 直接修改 state
actions: flux => ({
  bad() {
    const state = flux.getState();
    state.count++;  // ❌ 不要直接修改
  }
})

// ❌ 避免: 缓存旧的 state
actions: flux => ({
  async bad() {
    const state = flux.getState();
    await delay(1000);
    // state 可能已经过期了!
    flux.setState({ count: state.count + 1 });
  }
})

// ❌ 避免: 在组件中直接访问 store.state
render() {
  // 不要用 store.state (Vuex 风格)
  const count = store.state.count;  // ❌

  // 应该用 store.getState()
  const state = store.getState();   // ✅
  const count = state.count;
}`}
            />
          </SplitView>
        </div>
      </div>
    );
  }
}
