// 演示：函数组件自动包裹 defineFukict
export const FunctionComponentDemo = () => {
  let count = 0;
  let displayRef: HTMLSpanElement | null = null;

  const increment = () => {
    count++;
    if (displayRef) {
      displayRef.textContent = count.toString();
    }
  };

  return (
    <div>
      <h2 class="mb-4 text-3xl font-bold">函数组件 (defineFukict)</h2>

      <div class="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
        <p class="text-sm text-gray-700">
          <strong>自动包裹：</strong>大写开头的箭头函数会被 babel-preset
          自动识别并包裹{' '}
          <code class="rounded bg-blue-100 px-1">defineFukict()</code>
        </p>
      </div>

      <div class="rounded-lg bg-white p-6 shadow">
        <h3 class="mb-4 text-xl font-semibold">交互示例</h3>
        <div class="flex items-center gap-4">
          <button
            on:click={increment}
            class="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            点击 +1
          </button>
          <span class="text-2xl font-bold" ref={el => (displayRef = el)}>
            {count}
          </span>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
        <pre class="text-sm">
          <code>{`// 输入代码
export const FunctionComponentDemo = () => {
  let count = 0;
  return <div>{count}</div>;
};

// babel-preset 编译后
import { defineFukict, hyperscript } from '@fukict/basic';

export const FunctionComponentDemo = defineFukict(() => {
  let count = 0;
  return hyperscript('div', null, [count]);
});
FunctionComponentDemo.displayName = 'FunctionComponentDemo';`}</code>
        </pre>
      </div>
    </div>
  );
};
