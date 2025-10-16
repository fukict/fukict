import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

// 定义 Context 键和类型
const THEME_CONTEXT = Symbol('theme');

interface ThemeContext {
  mode: 'light' | 'dark';
  primaryColor: string;
}

/**
 * 消费主题的按钮组件
 */
class ThemedButton extends Fukict {
  render() {
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#3b82f6',
    })!;

    return (
      <button
        class={`rounded px-4 py-2 text-sm font-medium ${
          theme.mode === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-blue-500 text-white'
        }`}
        style={{ backgroundColor: theme.primaryColor }}
      >
        当前主题: {theme.mode}
      </button>
    );
  }
}

/**
 * Context 演示
 */
class ContextDemo extends Fukict {
  private theme: 'light' | 'dark' = 'light';

  mounted() {
    this.updateContext();
  }

  updateContext() {
    // 使用 provideContext 提供 context
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: this.theme,
      primaryColor: this.theme === 'dark' ? '#6b7280' : '#3b82f6',
    });
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="flex gap-2">
          <button
            class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            on:click={() => {
              this.theme = 'light';
              this.updateContext();
              this.update();
            }}
          >
            Light Mode
          </button>
          <button
            class="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
            on:click={() => {
              this.theme = 'dark';
              this.updateContext();
              this.update();
            }}
          >
            Dark Mode
          </button>
        </div>

        <div class="rounded border border-gray-300 bg-gray-50 p-4">
          <ThemedButton />
        </div>
      </div>
    );
  }
}

/**
 * Context 页面
 */
export class ContextPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* Context 基础 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Context 上下文
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 Context 在组件树中共享数据,无需逐层传递 props
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

// 定义 Context 键
const THEME_CONTEXT = Symbol('theme');

interface ThemeContext {
  mode: 'light' | 'dark';
  primaryColor: string;
}

// 提供 Context 的组件
class App extends Fukict {
  mounted() {
    // 在 mounted 中提供 context
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'dark',
      primaryColor: '#3b82f6'
    });
  }

  render() {
    return <ThemedButton />;
  }
}

// 消费 Context 的组件
class ThemedButton extends Fukict {
  render() {
    // 在 render 中获取 context
    const theme = this.getContext<ThemeContext>(
      THEME_CONTEXT,
      { mode: 'light', primaryColor: '#3b82f6' } // 默认值
    )!;

    return (
      <button class={\`btn-\${theme.mode}\`}>
        当前主题: {theme.mode}
      </button>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <ContextDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
