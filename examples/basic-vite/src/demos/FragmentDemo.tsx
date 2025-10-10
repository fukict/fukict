// 演示：Fragment 片段
export const FragmentDemo = () => {
  const items = ['Apple', 'Banana', 'Cherry'];

  // 条件渲染返回多个元素
  const renderStatus = (isOnline: boolean) => {
    if (isOnline) {
      return (
        <>
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span class="text-green-700">在线</span>
        </>
      );
    } else {
      return (
        <>
          <span class="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          <span class="text-gray-600">离线</span>
        </>
      );
    }
  };

  return (
    <div>
      <h2 class="text-3xl font-bold mb-4">Fragment</h2>

      <div class="bg-cyan-50 border-l-4 border-cyan-500 p-4 mb-6">
        <p class="text-sm text-gray-700">
          <strong>Fragment 片段：</strong>使用{' '}
          <code class="bg-cyan-100 px-1 rounded">&lt;&gt;...&lt;/&gt;</code>{' '}
          返回多个元素而不添加额外的 DOM 节点
        </p>
      </div>

      <div class="space-y-6">
        {/* 基本用法 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">1. 基本用法</h3>
          <div class="border border-gray-200 rounded p-4">
            <>
              <p class="text-gray-700">第一段内容</p>
              <p class="text-gray-700">第二段内容</p>
              <p class="text-gray-700">第三段内容</p>
            </>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`<>
  <p>第一段内容</p>
  <p>第二段内容</p>
  <p>第三段内容</p>
</>`}</code>
          </pre>
        </div>

        {/* 列表渲染 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">2. 列表中使用</h3>
          <div class="border border-gray-200 rounded p-4">
            <ul class="space-y-2">
              {items.map((item, index) => (
                <>
                  <li class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center text-sm font-semibold">
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
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`{items.map((item, index) => (
  <>
    <li>{item}</li>
    {index < items.length - 1 && <hr />}
  </>
))}`}</code>
          </pre>
        </div>

        {/* 条件渲染 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">3. 条件渲染中使用</h3>
          <div class="border border-gray-200 rounded p-4 space-y-3">
            <div class="flex items-center">
              <span class="text-gray-600 mr-3">用户状态:</span>
              {renderStatus(true)}
            </div>
            <div class="flex items-center">
              <span class="text-gray-600 mr-3">服务器状态:</span>
              {renderStatus(false)}
            </div>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
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

      <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p class="text-sm text-gray-700">
          <strong>💡 提示：</strong>Fragment 不会在 DOM 中创建额外节点，保持
          HTML 结构的简洁性。
        </p>
      </div>
    </div>
  );
};
