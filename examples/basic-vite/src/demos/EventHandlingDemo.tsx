// 演示：事件处理
export const EventHandlingDemo = () => {
  let clickCount = 0;
  let mousePosition = { x: 0, y: 0 };
  let inputValue = '';

  let clickDisplay: HTMLSpanElement | null = null;
  let mouseDisplay: HTMLDivElement | null = null;
  let inputDisplay: HTMLSpanElement | null = null;

  const handleClick = () => {
    clickCount++;
    if (clickDisplay) {
      clickDisplay.textContent = clickCount.toString();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    mousePosition = {
      x: Math.floor(e.clientX - rect.left),
      y: Math.floor(e.clientY - rect.top),
    };
    if (mouseDisplay) {
      mouseDisplay.textContent = `X: ${mousePosition.x}, Y: ${mousePosition.y}`;
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    if (inputDisplay) {
      inputDisplay.textContent = inputValue || '(空)';
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      alert(`你输入了: ${inputValue}`);
    }
  };

  return (
    <div>
      <h2 class="text-3xl font-bold mb-4">事件处理 (on:)</h2>

      <div class="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
        <p class="text-sm text-gray-700">
          <strong>事件前缀：</strong>使用{' '}
          <code class="bg-orange-100 px-1 rounded">on:</code> 前缀绑定事件，如{' '}
          <code class="bg-orange-100 px-1 rounded">on:click</code>,{' '}
          <code class="bg-orange-100 px-1 rounded">on:input</code>
        </p>
      </div>

      <div class="space-y-6">
        {/* Click 事件 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">1. on:click - 点击事件</h3>
          <button
            on:click={handleClick}
            class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            点击我
          </button>
          <div class="mt-3 text-lg">
            点击次数:{' '}
            <span
              class="font-bold text-orange-600"
              ref={el => (clickDisplay = el)}
            >
              0
            </span>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`<button on:click={handleClick}>点击我</button>`}</code>
          </pre>
        </div>

        {/* MouseMove 事件 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">2. on:mousemove - 鼠标移动</h3>
          <div
            on:mousemove={handleMouseMove}
            class="h-40 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-center justify-center cursor-crosshair"
          >
            <div
              class="text-gray-700 font-mono"
              ref={el => (mouseDisplay = el)}
            >
              移动鼠标查看坐标
            </div>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`<div on:mousemove={handleMouseMove}>...</div>`}</code>
          </pre>
        </div>

        {/* Input 事件 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-3">
            3. on:input / on:keypress - 输入事件
          </h3>
          <input
            type="text"
            on:input={handleInput}
            on:keypress={handleKeyPress}
            placeholder="输入后按 Enter..."
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div class="mt-3 text-lg">
            当前输入:{' '}
            <span
              class="font-mono text-orange-600"
              ref={el => (inputDisplay = el)}
            >
              (空)
            </span>
          </div>
          <pre class="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`<input
  on:input={handleInput}
  on:keypress={handleKeyPress}
/>`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
