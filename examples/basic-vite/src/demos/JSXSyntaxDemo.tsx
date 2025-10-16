// 演示：JSX 语法支持
export const JSXSyntaxDemo = () => {
  const name = 'Fukict';
  const features = ['轻量', '快速', '灵活'];

  return (
    <div>
      <h2 class="mb-4 text-3xl font-bold">JSX 语法</h2>

      <div class="mb-6 border-l-4 border-green-500 bg-green-50 p-4">
        <p class="text-sm text-gray-700">
          <strong>JSX 编译：</strong>所有 JSX 语法都会被编译为{' '}
          <code class="rounded bg-green-100 px-1">hyperscript()</code> 调用
        </p>
      </div>

      <div class="space-y-6">
        {/* 基本元素 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">1. 基本元素</h3>
          <div class="rounded border border-gray-200 p-4">
            <div class="text-lg">Hello, {name}!</div>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`<div class="text-lg">Hello, {name}!</div>`}</code>
          </pre>
        </div>

        {/* 属性绑定 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">2. 属性绑定</h3>
          <div class="rounded border border-gray-200 p-4">
            <input
              type="text"
              placeholder="输入文本..."
              class="w-full rounded border px-3 py-2"
            />
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`<input type="text" placeholder="输入文本..." />`}</code>
          </pre>
        </div>

        {/* 条件渲染 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">3. 条件渲染</h3>
          <div class="rounded border border-gray-200 p-4">
            {features.length > 0 ? (
              <div class="text-green-600">有 {features.length} 个特性</div>
            ) : (
              <div class="text-gray-400">暂无特性</div>
            )}
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`{features.length > 0 ? (
  <div>有特性</div>
) : (
  <div>暂无特性</div>
)}`}</code>
          </pre>
        </div>

        {/* 列表渲染 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">4. 列表渲染</h3>
          <div class="rounded border border-gray-200 p-4">
            <ul class="list-inside list-disc space-y-1">
              {features.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`{features.map(feature => (
  <li key={feature}>{feature}</li>
))}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
