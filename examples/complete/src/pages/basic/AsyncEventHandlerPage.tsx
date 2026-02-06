import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

interface AsyncButtonDemoState {
  loading: boolean;
  message: string;
}

/**
 * 异步事件处理器示例
 * 展示如何在事件处理器中使用异步函数
 */
class AsyncButtonDemo extends Fukict {
  state: AsyncButtonDemoState = {
    loading: false,
    message: '点击按钮开始异步操作',
  };

  private setState(newState: Partial<AsyncButtonDemoState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  // 异步函数 - 模拟 API 调用
  private async fetchData(): Promise<void> {
    this.setState({ loading: true, message: '正在加载数据...' });

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.setState({
      loading: false,
      message: `数据加载完成！时间: ${new Date().toLocaleTimeString()}`,
    });
  }

  // 另一个异步函数 - 模拟表单提交
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.setState({ loading: true, message: '正在提交表单...' });

    await new Promise(resolve => setTimeout(resolve, 1500));

    this.setState({
      loading: false,
      message: `表单提交成功！时间: ${new Date().toLocaleTimeString()}`,
    });
  }

  render() {
    const { loading, message } = this.state;

    return (
      <div class="space-y-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4">
          <p class="mb-3 text-sm text-gray-600">{message}</p>

          <div class="flex gap-3">
            {/* 方式 1: 直接使用异步函数（推荐）- 不再需要 void 操作符 */}
            <button
              class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              on:click={() => this.fetchData()}
            >
              异步加载数据
            </button>

            {/* 方式 2: 在箭头函数中调用异步函数 */}
            <button
              class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              on:click={async () => {
                this.setState({ loading: true, message: '处理中...' });
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.setState({ loading: false, message: '处理完成！' });
              }}
            >
              内联异步处理
            </button>

            {/* 方式 3: 绑定到类方法 */}
            <button
              class="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              on:click={e => this.handleSubmit(e)}
            >
              异步提交
            </button>
          </div>
        </div>

        {loading && (
          <div class="flex items-center gap-2 text-sm text-blue-600">
            <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span>处理中...</span>
          </div>
        )}
      </div>
    );
  }
}

interface AsyncFormDemoState {
  username: string;
  email: string;
  submitting: boolean;
  result: string;
}

/**
 * 表单异步提交示例
 */
class AsyncFormDemo extends Fukict {
  state: AsyncFormDemoState = {
    username: '',
    email: '',
    submitting: false,
    result: '',
  };

  private setState(newState: Partial<AsyncFormDemoState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  private async handleFormSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const { username, email } = this.state;

    if (!username || !email) {
      this.setState({ result: '❌ 请填写所有字段' });
      return;
    }

    this.setState({ submitting: true, result: '正在提交...' });

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.setState({
      submitting: false,
      result: `✅ 成功！用户 ${username} (${email}) 已注册`,
      username: '',
      email: '',
    });
  }

  render() {
    const { username, email, submitting, result } = this.state;

    return (
      <form class="space-y-4" on:submit={e => this.handleFormSubmit(e)}>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            用户名
          </label>
          <input
            type="text"
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            value={username}
            on:input={(e: Event) => {
              const target = e.target as HTMLInputElement;
              this.setState({ username: target.value });
            }}
            disabled={submitting}
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">
            邮箱
          </label>
          <input
            type="email"
            class="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            value={email}
            on:input={(e: Event) => {
              const target = e.target as HTMLInputElement;
              this.setState({ email: target.value });
            }}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          class="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交'}
        </button>

        {result && (
          <div
            class={`rounded p-3 text-sm ${
              result.startsWith('✅')
                ? 'bg-green-50 text-green-800'
                : result.startsWith('❌')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-blue-800'
            }`}
          >
            {result}
          </div>
        )}
      </form>
    );
  }
}

interface AsyncErrorHandlingDemoState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

/**
 * 错误处理示例
 */
class AsyncErrorHandlingDemo extends Fukict {
  state: AsyncErrorHandlingDemoState = {
    status: 'idle',
    error: null,
  };

  private setState(newState: Partial<AsyncErrorHandlingDemoState>): void {
    this.state = {
      ...this.state,
      ...newState,
    };

    this.update();
  }

  private async handleClickWithError(): Promise<void> {
    try {
      this.setState({ status: 'loading', error: null });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟 50% 概率失败
      if (Math.random() > 0.5) {
        throw new Error('网络请求失败');
      }

      this.setState({ status: 'success', error: null });

      // 3秒后重置
      setTimeout(() => {
        this.setState({ status: 'idle', error: null });
      }, 3000);
    } catch (err) {
      this.setState({
        status: 'error',
        error: err instanceof Error ? err.message : '未知错误',
      });
    }
  }

  render() {
    const { status, error } = this.state;

    return (
      <div class="space-y-3">
        <button
          class="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={status === 'loading'}
          on:click={() => this.handleClickWithError()}
        >
          {status === 'loading' ? '请求中...' : '发起请求（可能失败）'}
        </button>

        {status === 'success' && (
          <div class="rounded bg-green-50 p-3 text-sm text-green-800">
            ✅ 请求成功！
          </div>
        )}

        {error && (
          <div class="rounded bg-red-50 p-3 text-sm text-red-800">
            ❌ 错误: {error}
          </div>
        )}

        <p class="text-xs text-gray-500">
          提示: 该按钮有 50% 概率触发错误，用于演示错误处理
        </p>
      </div>
    );
  }
}

/**
 * 异步事件处理器页面
 */
export class AsyncEventHandlerPage extends RouteComponent {
  render() {
    return (
      <div>
        <div class="space-y-8">
          {/* 基础用法 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="基础异步操作">
              <AsyncButtonDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`class AsyncButtonDemo extends Fukict {
  state = {
    loading: false,
    message: '点击按钮开始异步操作',
  };

  // ✅ 现在可以直接使用异步函数，不需要 void 操作符
  private async fetchData(): Promise<void> {
    this.setState({ loading: true, message: '正在加载数据...' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.setState({
      loading: false,
      message: \`数据加载完成！时间: \${new Date().toLocaleTimeString()}\`,
    });
  }

  render() {
    return (
      <button
        on:click={() => this.fetchData()}
        disabled={this.state.loading}
      >
        异步加载数据
      </button>
    );
  }
}`}
            />
          </SplitView>

          {/* 表单提交 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="异步表单提交">
              <AsyncFormDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`class AsyncFormDemo extends Fukict {
  private async handleFormSubmit(e: Event): Promise<void> {
    e.preventDefault();

    this.setState({ submitting: true });

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.setState({
      submitting: false,
      result: '✅ 提交成功！'
    });
  }

  render() {
    return (
      <form on:submit={e => this.handleFormSubmit(e)}>
        <input type="text" />
        <button type="submit">提交</button>
      </form>
    );
  }
}`}
            />
          </SplitView>

          {/* 错误处理 */}
          <SplitView>
            <DemoBox fukict:slot="demo" title="异步错误处理">
              <AsyncErrorHandlingDemo />
            </DemoBox>
            <CodeBlock
              fukict:slot="code"
              language="tsx"
              code={`class AsyncErrorHandlingDemo extends Fukict {
  private async handleClickWithError(): Promise<void> {
    try {
      this.setState({ status: 'loading', error: null });

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (Math.random() > 0.5) {
        throw new Error('网络请求失败');
      }

      this.setState({ status: 'success' });
    } catch (err) {
      this.setState({
        status: 'error',
        error: err.message
      });
    }
  }

  render() {
    return (
      <button on:click={() => this.handleClickWithError()}>
        发起请求（可能失败）
      </button>
    );
  }
}`}
            />
          </SplitView>

          {/* 特性说明 */}
          <div class="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">
              ✨ 异步事件处理器特性
            </h3>
            <div class="space-y-3 text-gray-700">
              <div class="flex items-start gap-2">
                <span class="text-green-600">✅</span>
                <div>
                  <strong>类型安全：</strong>事件处理器类型现在支持{' '}
                  <code class="rounded bg-gray-200 px-1 text-sm">
                    () =&gt; void | Promise&lt;void&gt;
                  </code>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-green-600">✅</span>
                <div>
                  <strong>不再需要 void 操作符：</strong>
                  可以直接使用异步函数，无需{' '}
                  <code class="rounded bg-gray-200 px-1 text-sm">
                    void asyncFunc()
                  </code>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-green-600">✅</span>
                <div>
                  <strong>统一的解决方案：</strong>
                  参考 React 的实践，支持同步和异步函数
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-green-600">✅</span>
                <div>
                  <strong>完整的 TypeScript 支持：</strong>
                  编辑器不再显示类型错误（红色波浪线）
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-amber-600">⚠️</span>
                <div>
                  <strong>错误处理建议：</strong>
                  异步函数中应该使用 try-catch 处理错误，防止未捕获的 Promise
                  rejection
                </div>
              </div>
            </div>
          </div>

          {/* 对比说明 */}
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">
              🔄 修复前后对比
            </h3>
            <div class="space-y-4">
              <div>
                <h4 class="mb-2 text-sm font-medium text-gray-900">
                  ❌ 修复前（需要使用 void 操作符）
                </h4>
                <CodeBlock
                  language="tsx"
                  code={`// 方式 1: 使用 void 操作符（不优雅）
<button on:click={() => void loadUser(1)}>
  Load User
</button>

// 方式 2: 包装在非异步函数中
<button on:click={() => { loadUser(1); }}>
  Load User
</button>`}
                />
              </div>
              <div>
                <h4 class="mb-2 text-sm font-medium text-gray-900">
                  修复后（直接使用异步函数）
                </h4>
                <CodeBlock
                  language="tsx"
                  code={`// 现在可以直接使用，无需任何变通方法
<button on:click={() => loadUser(1)}>
  Load User
</button>

// 或者使用 async 箭头函数
<button on:click={async () => {
  await loadUser(1);
  console.log('加载完成');
}}>
  Load User
</button>`}
                />
              </div>
            </div>
          </div>

          {/* 技术实现 */}
          <div class="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">
              🔧 技术实现
            </h3>
            <p class="mb-3 text-sm text-gray-700">
              修改了 <code class="rounded bg-white px-1">EventHandlers</code>{' '}
              类型定义，允许事件处理器返回 <code>void</code> 或{' '}
              <code>Promise&lt;void&gt;</code>：
            </p>
            <CodeBlock
              language="typescript"
              code={`// packages/basic/src/types/events.ts

export type EventHandlers = {
  [K in keyof HTMLElementEventMap as \`on:\${K}\`]?: (
    event: HTMLElementEventMap[K],
  ) => void | Promise<void>;  // ← 添加了 Promise<void> 支持
};`}
            />
            <p class="mt-3 text-xs text-gray-600">
              这个修改遵循了 React 和其他现代框架的实践，提供了更好的开发体验。
            </p>
          </div>
        </div>
      </div>
    );
  }
}
