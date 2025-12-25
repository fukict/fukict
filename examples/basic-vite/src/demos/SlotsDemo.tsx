import { Fukict } from '@fukict/basic';

// 使用 Class Component 和 fukict:slot 的 Card 组件
class Card extends Fukict<{ title?: string }> {
  render() {
    const { title } = this.props;
    const { header, default: defaultSlot, footer } = this.$slots;

    return (
      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        {/* 如果有 header 插槽就使用，否则用默认的标题栏 */}
        {header ? (
          <div class="px-6 py-4">{header}</div>
        ) : (
          <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 text-white">
            <h3 class="text-xl font-semibold">{title}</h3>
          </div>
        )}

        {/* 默认插槽内容 */}
        <div class="p-6">{defaultSlot}</div>

        {/* 底部插槽 */}
        {footer && (
          <div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    );
  }
}

export const SlotsDemo = () => {
  return (
    <div>
      <h2 class="mb-4 text-3xl font-bold">Slots (fukict:slot)</h2>

      <div class="mb-6 border-l-4 border-teal-500 bg-teal-50 p-4">
        <p class="text-sm text-gray-700">
          <strong>Slots 插槽：</strong>在 Class Component 中通过{' '}
          <code class="rounded bg-teal-100 px-1">fukict:slot</code>{' '}
          属性命名插槽，通过{' '}
          <code class="rounded bg-teal-100 px-1">this.slots</code>{' '}
          访问插槽内容，实现灵活的组件组合
        </p>
      </div>

      <div class="space-y-6">
        {/* 默认插槽 */}
        <Card title="默认插槽">
          <p class="text-gray-700">
            这是通过默认插槽传递的内容（没有 fukict:slot 属性）。
          </p>
          <p class="mt-2 text-gray-700">
            可以包含任意的 JSX 内容，包括文本、元素、组件等。
          </p>
        </Card>

        {/* 具名插槽 - footer */}
        <Card title="具名插槽 (footer)">
          <p class="text-gray-700">
            这个卡片同时使用了默认插槽和具名插槽（footer）。
          </p>
          <div fukict:slot="footer" class="flex justify-end gap-2">
            <button class="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
              取消
            </button>
            <button class="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">
              确认
            </button>
          </div>
        </Card>

        {/* 多个具名插槽 */}
        <Card>
          <div
            fukict:slot="header"
            class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 text-white"
          >
            <h3 class="text-xl font-semibold">📊 自定义标题插槽</h3>
            <p class="text-sm opacity-90">
              使用 fukict:slot="header" 自定义标题栏
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <span class="text-2xl">📊</span>
              </div>
              <div>
                <h4 class="font-semibold">数据统计</h4>
                <p class="text-sm text-gray-600">查看详细的数据分析报告</p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 pt-3">
              <div class="text-center">
                <div class="text-2xl font-bold text-teal-600">1,234</div>
                <div class="text-sm text-gray-600">访问量</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-teal-600">567</div>
                <div class="text-sm text-gray-600">用户数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-teal-600">89%</div>
                <div class="text-sm text-gray-600">转化率</div>
              </div>
            </div>
          </div>

          <div fukict:slot="footer" class="text-sm text-gray-500">
            最后更新: {new Date().toLocaleString()}
          </div>
        </Card>
      </div>

      <div class="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
        <pre class="text-sm">
          <code>{`import { Fukict } from '@fukict/basic';

// Class Component with Slots
class Card extends Fukict {
  render() {
    const { title } = this.props;
    const { header, default: defaultSlot, footer } = this.slots;

    return (
      <div class="card">
        {header ? (
          <div>{header}</div>
        ) : (
          <div class="header">{title}</div>
        )}
        <div class="body">{defaultSlot}</div>
        {footer && <div class="footer">{footer}</div>}
      </div>
    );
  }
}

// 使用
<Card title="标题">
  {/* 默认插槽 */}
  <p>这是默认插槽内容</p>

  {/* 具名插槽 */}
  <div fukict:slot="footer">
    <button>操作</button>
  </div>
</Card>`}</code>
        </pre>
      </div>
    </div>
  );
};
