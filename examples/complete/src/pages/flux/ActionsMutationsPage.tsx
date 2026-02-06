import { Fukict } from '@fukict/basic';
import { type ActionContext, defineStore } from '@fukict/flux';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 同步操作 Store (使用新的 defineStore API)
 */
interface SyncState {
  count: number;
  items: string[];
}

const syncStore = defineStore({
  scope: 'actions-sync',
  state: {
    count: 0,
    items: [],
  } as SyncState,
  actions: {
    // 简单修改
    increment: (state: SyncState) => ({ count: state.count + 1 }),

    // 带参数的修改
    incrementBy: (state: SyncState, amount: number) => ({
      count: state.count + amount,
    }),

    // 数组操作
    addItem: (state: SyncState, item: string) => ({
      items: [...state.items, item],
    }),

    // 批量修改
    reset: () => ({ count: 0, items: [] }),
  },
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
    const { count, items } = syncStore.state;
    const { increment, incrementBy, addItem, reset } = syncStore.actions;

    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>Count:</strong> {count}
          </p>
          <p class="text-gray-700">
            <strong>Items:</strong> {items.join(', ') || '(empty)'}
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
 * 异步操作 Store (使用新的 asyncActions API)
 */
interface AsyncState {
  user: { id: number; name: string } | null;
  loading: boolean;
  logs: string[];
}

const asyncStore = defineStore({
  scope: 'actions-async',
  state: {
    user: null,
    loading: false,
    logs: [],
  } as AsyncState,
  asyncActions: {
    // 异步加载用户
    async loadUser(ctx: ActionContext<AsyncState>, userId: number) {
      const state = ctx.getState();
      const newLogs = [`Loading user ${userId}...`, ...state.logs];
      if (newLogs.length > 5) newLogs.pop();

      ctx.setState({ loading: true, logs: newLogs });

      try {
        // 模拟异步请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = { id: userId, name: `User ${userId}` };

        const currentState = ctx.getState();
        const successLogs = [
          `User ${userId} loaded successfully`,
          ...currentState.logs,
        ];
        if (successLogs.length > 5) successLogs.pop();

        ctx.setState({ user, loading: false, logs: successLogs });
      } catch (_error) {
        const currentState = ctx.getState();
        const errorLogs = [
          `Failed to load user ${userId}`,
          ...currentState.logs,
        ];
        if (errorLogs.length > 5) errorLogs.pop();

        ctx.setState({ loading: false, logs: errorLogs });
      }
    },

    // 登出
    async logout(ctx: ActionContext<AsyncState>) {
      const state = ctx.getState();
      const logoutLogs = ['Logging out...', ...state.logs];
      if (logoutLogs.length > 5) logoutLogs.pop();

      ctx.setState({ loading: true, logs: logoutLogs });

      await new Promise(resolve => setTimeout(resolve, 500));

      const currentState = ctx.getState();
      const completeLogs = ['Logged out', ...currentState.logs];
      if (completeLogs.length > 5) completeLogs.pop();

      ctx.setState({ user: null, loading: false, logs: completeLogs });
    },
  },
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
    const { user, loading, logs } = asyncStore.state;
    const { loadUser, logout } = asyncStore.asyncActions;

    return (
      <div class="space-y-4">
        <div class="space-y-2 rounded bg-gray-50 p-4 text-sm">
          <p class="text-gray-700">
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </p>
          <p class="text-gray-700">
            <strong>User:</strong>{' '}
            {user ? `${user.name} (ID: ${user.id})` : '(none)'}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
            on:click={() => loadUser(1)}
          >
            Load User 1
          </button>
          <button
            class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600 disabled:opacity-50"
            disabled={loading}
            on:click={() => loadUser(2)}
          >
            Load User 2
          </button>
          <button
            class="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-50"
            disabled={loading}
            on:click={() => logout()}
          >
            Logout
          </button>
        </div>
        <div class="rounded bg-gray-50 p-3">
          <p class="mb-2 text-sm font-medium text-gray-900">操作日志:</p>
          <div class="space-y-1 font-mono text-xs text-gray-600">
            {logs.length === 0 ? (
              <p class="text-gray-400">点击按钮查看操作日志...</p>
            ) : (
              logs.map(log => <p>{log}</p>)
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
            <h3 class="mb-1 text-base font-medium text-gray-800">
              同步 Actions
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              同步 action 接收当前 state，返回需要更新的部分状态
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { defineStore } from '@fukict/flux';

const store = defineStore({
  state: {
    count: 0,
    items: [],
  },
  actions: {
    // 同步 action: (state, ...args) => Partial<State>

    // 简单修改
    increment: state => ({ count: state.count + 1 }),

    // 带参数的修改
    incrementBy: (state, amount: number) => ({
      count: state.count + amount,
    }),

    // 数组操作
    addItem: (state, item: string) => ({
      items: [...state.items, item],
    }),

    // 批量修改（可以不依赖 state）
    reset: () => ({ count: 0, items: [] }),
  },
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
            <h3 class="mb-1 text-base font-medium text-gray-800">
              异步 Actions
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              异步 action 接收 context 对象，通过 ctx.setState() 多次更新状态
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { defineStore } from '@fukict/flux';

const store = defineStore({
  state: {
    user: null,
    loading: false,
  },
  asyncActions: {
    // 异步 action: (ctx, ...args) => Promise<void>

    // ctx.getState() - 获取最新状态
    // ctx.setState() - 更新状态（可多次调用）

    async loadUser(ctx, userId: number) {
      ctx.setState({ loading: true });

      try {
        const user = await fetchUser(userId);
        ctx.setState({ user, loading: false });
      } catch (error) {
        console.error('Failed to load user:', error);
        ctx.setState({ loading: false });
      }
    },

    async logout(ctx) {
      ctx.setState({ loading: true });
      await new Promise(r => setTimeout(r, 500));
      ctx.setState({ user: null, loading: false });
    },
  },
});

// 调用异步 actions
await store.asyncActions.loadUser(123);
await store.asyncActions.logout();`}
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
              code={`// ✅ 同步 action: 直接返回新状态
actions: {
  increment: state => ({
    count: state.count + 1
  }),

  // 可以接收参数
  addItem: (state, item: string) => ({
    items: [...state.items, item]
  }),
}

// ✅ 异步 action: 使用 ctx
asyncActions: {
  async loadData(ctx, id: string) {
    // 开始加载
    ctx.setState({ loading: true });

    try {
      const data = await fetchData(id);

      // 获取最新状态（重要！）
      const state = ctx.getState();
      ctx.setState({
        data,
        count: state.count + 1,
        loading: false,
      });
    } catch (error) {
      ctx.setState({ error, loading: false });
    }
  },
}`}
            />
            <CodeBlock
              fukict:slot="demo"
              code={`// ❌ 避免: 直接修改 state
actions: {
  bad: state => {
    state.count++;  // ❌ 不要直接修改
    return state;
  }
}

// ❌ 避免: 在同步 action 中做异步操作
actions: {
  bad: async state => {  // ❌ 不要用 async
    await delay(1000);
    return { count: state.count + 1 };
  }
}

// ❌ 避免: 在异步 action 中缓存旧状态
asyncActions: {
  async bad(ctx) {
    const state = ctx.getState();
    await delay(1000);
    // ❌ state 可能已经过期了!
    ctx.setState({ count: state.count + 1 });

    // ✅ 应该重新获取
    const newState = ctx.getState();
    ctx.setState({ count: newState.count + 1 });
  }
}`}
            />
          </SplitView>
        </div>
      </div>
    );
  }
}
