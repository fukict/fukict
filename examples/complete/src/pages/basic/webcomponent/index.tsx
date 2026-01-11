/**
 * Web Component 类型扩展示例
 *
 * 本页面展示如何在 Fukict 中使用自定义 Web Component，并获得完整的类型支持
 */
import { RouteComponent } from '@fukict/router';

// 2. 导入并注册 Web Component
import './MyCounter';
// 1. 导入类型扩展（这会触发 declaration merging）
import './types';

/**
 * Web Component 示例页面
 */
export class WebComponentPage extends RouteComponent {
  private counterValue = 0;

  handleCounterChange(event: Event) {
    // 类型断言：Web Component 的 CustomEvent
    const customEvent = event as CustomEvent<{ value: number }>;
    this.counterValue = customEvent.detail.value;
    this.update(this.props);
  }

  render() {
    return (
      <div class="space-y-8">
        {/* 使用示例 */}
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">使用示例</h2>

          <div class="rounded border border-gray-200 bg-white p-6">
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-gray-700">
                计数器（my-counter）
              </label>
              {/* 使用自定义 Web Component，享有完整的类型提示 */}
              <my-counter
                value={this.counterValue}
                step={1}
                min={0}
                max={100}
                on:change={e => this.handleCounterChange(e)}
              />
            </div>
            <p class="text-sm text-gray-500">
              当前值：
              <span class="font-mono font-bold">{this.counterValue}</span>
            </p>
          </div>
        </section>

        {/* 类型定义说明 */}
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">如何扩展 JSX 类型</h2>

          <div class="space-y-4 rounded border border-blue-200 bg-blue-50 p-4">
            <h3 class="font-medium text-blue-800">步骤 1：定义组件属性接口</h3>
            <pre class="overflow-x-auto rounded bg-gray-800 p-4 text-sm text-gray-100">
              {`interface MyCounterAttributes {
  value?: number;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  'on:change'?: (event: CustomEvent<{ value: number }>) => void;
}`}
            </pre>
          </div>

          <div class="space-y-4 rounded border border-green-200 bg-green-50 p-4">
            <h3 class="font-medium text-green-800">
              步骤 2：扩展 JSX.IntrinsicElements
            </h3>
            <pre class="overflow-x-auto rounded bg-gray-800 p-4 text-sm text-gray-100">
              {`import type { HTMLAttributes } from '@fukict/basic';

declare module '@fukict/basic' {
  namespace JSX {
    interface IntrinsicElements {
      'my-counter': HTMLAttributes<HTMLElement> & MyCounterAttributes;
    }
  }
}`}
            </pre>
          </div>

          <div class="space-y-4 rounded border border-purple-200 bg-purple-50 p-4">
            <h3 class="font-medium text-purple-800">步骤 3：在组件中使用</h3>
            <pre class="overflow-x-auto rounded bg-gray-800 p-4 text-sm text-gray-100">
              {`// 导入类型扩展
import './types';

// 导入并注册 Web Component
import './MyCounter';

// 在 JSX 中使用，享有完整的类型提示
<my-counter
  value={0}
  step={1}
  min={0}
  max={100}
  on:change={e => console.log(e.detail.value)}
/>`}
            </pre>
          </div>
        </section>

        {/* 关键点说明 */}
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">关键点</h2>

          <ul class="list-inside list-disc space-y-2 text-gray-600">
            <li>
              使用 <code class="rounded bg-gray-100 px-1">declare module</code>{' '}
              进行 TypeScript 声明合并
            </li>
            <li>
              <code class="rounded bg-gray-100 px-1">
                HTMLAttributes&lt;HTMLElement&gt;
              </code>{' '}
              提供基础的 HTML 属性支持
            </li>
            <li>自定义属性接口添加组件特有的属性和事件</li>
            <li>
              事件使用{' '}
              <code class="rounded bg-gray-100 px-1">on:eventName</code>{' '}
              格式，与 Fukict 事件系统保持一致
            </li>
            <li>需要在使用前导入类型扩展文件（触发声明合并）</li>
          </ul>
        </section>

        {/* 文件结构 */}
        <section class="space-y-4">
          <h2 class="text-xl font-semibold">文件结构</h2>

          <pre class="overflow-x-auto rounded bg-gray-800 p-4 text-sm text-gray-100">
            {`webcomponent/
├── types.ts        # 类型定义和 JSX 扩展
├── MyCounter.ts    # Web Component 实现
└── index.tsx       # 使用示例页面`}
          </pre>
        </section>
      </div>
    );
  }
}
