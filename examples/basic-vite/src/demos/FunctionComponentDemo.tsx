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
      <h2 class="text-3xl font-bold mb-4">函数组件 (defineFukict)</h2>

      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p class="text-sm text-gray-700">
          <strong>自动包裹：</strong>大写开头的箭头函数会被 babel-preset
          自动识别并包裹{' '}
          <code class="bg-blue-100 px-1 rounded">defineFukict()</code>
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-4">交互示例</h3>
        <div class="flex items-center gap-4">
          <button
            on:click={increment}
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            点击 +1
          </button>
          <span class="text-2xl font-bold" ref={el => (displayRef = el)}>
            {count}
          </span>
        </div>
      </div>

      <div class="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
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
FunctionComponentDemo.displayName = 'FunctionComponentDemo';
FunctionComponentDemo.__COMPONENT_TYPE__ = 'function';`}</code>
        </pre>
      </div>
    </div>
  );
};
