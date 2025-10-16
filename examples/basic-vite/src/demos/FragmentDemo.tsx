// 演示：Fragment 片段
export const FragmentDemo = () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  // 条件渲染返回多个元素
  const renderStatus = (isOnline: boolean) => {
    if (isOnline) {
      return (
        <>
          <span class="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
          <span class="text-green-700">在线</span>
        </>
      );
    } else {
      return (
        <>
          <span class="mr-2 inline-block h-2 w-2 rounded-full bg-gray-400"></span>
          <span class="text-gray-600">离线</span>
        </>
      );
    }
  };

  return (
    <div>
      <h2 class="mb-4 text-3xl font-bold">Fragment</h2>

      <div class="mb-6 border-l-4 border-cyan-500 bg-cyan-50 p-4">
        <p class="text-sm text-gray-700">
          <strong>Fragment 片段：</strong>使用{' '}
          <code class="rounded bg-cyan-100 px-1">&lt;&gt;...&lt;/&gt;</code>{' '}
          返回多个元素而不添加额外的 DOM 节点
        </p>
      </div>

      <div class="space-y-6">
        {/* 基本用法 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">1. 基本用法</h3>
          <div class="rounded border border-gray-200 p-4">
            <>
              <p class="text-gray-700">第一段内容</p>
              <p class="text-gray-700">第二段内容</p>
              <p class="text-gray-700">第三段内容</p>
            </>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`<>
  <p>第一段内容</p>
  <p>第二段内容</p>
  <p>第三段内容</p>
</>`}</code>
          </pre>
        </div>

        {/* 列表渲染 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">2. 列表中使用</h3>
          <div class="rounded border border-gray-200 p-4">
            <ul class="space-y-2">
              {items.map((item, index) => (
                <>
                  <li class="flex items-center gap-2">
                    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                  {index < items.length - 1 && (
                    <div class="border-t border-gray-200"></div>
                  )}
                </>
              ))}
            </ul>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`{items.map((item, index) => (
  <>
    <li>{item}</li>
    {index < items.length - 1 && <hr />}
  </>
))}`}</code>
          </pre>
        </div>

        {/* 条件渲染 */}
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="mb-3 text-xl font-semibold">3. 条件渲染中使用</h3>
          <div class="space-y-3 rounded border border-gray-200 p-4">
            <div class="flex items-center">
              <span class="mr-3 text-gray-600">用户状态:</span>
              {renderStatus(true)}
            </div>
            <div class="flex items-center">
              <span class="mr-3 text-gray-600">服务器状态:</span>
              {renderStatus(false)}
            </div>
          </div>
          <pre class="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">
            <code>{`const renderStatus = (isOnline: boolean) => {
  if (isOnline) {
    return (
      <>
        <span class="dot green"></span>
        <span>在线</span>
      </>
    );
  }
  return (
    <>
      <span class="dot gray"></span>
      <span>离线</span>
    </>
  );
};`}</code>
          </pre>
        </div>
      </div>

      <div class="mt-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <p class="text-sm text-gray-700">
          <strong>💡 提示：</strong>Fragment 不会在 DOM 中创建额外节点，保持
          HTML 结构的简洁性。
        </p>
      </div>
    </div>
  );
};
