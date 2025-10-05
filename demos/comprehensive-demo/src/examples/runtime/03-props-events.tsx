import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class extends RouteWidget {
  render() {
  const handleClick = () => {
    alert('按钮被点击了！');
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    console.log('输入值:', target.value);
  };

  return (
    <ExampleLayout
      title="03. 属性和事件"
      description="学习如何设置 DOM 属性和绑定事件处理器"
    >
      <DemoCard title="基础属性">
        <div class="space-y-4">
          <input
            type="text"
            placeholder="输入文本..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div class="flex gap-2">
            <button
              disabled={false}
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              启用按钮
            </button>
            <button
              disabled={true}
              class="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              禁用按钮
            </button>
          </div>
        </div>
      </DemoCard>

      <DemoCard title="事件处理">
        <div class="space-y-4">
          <button
            on:click={handleClick}
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            点击我
          </button>
          <input
            type="text"
            placeholder="输入内容查看控制台..."
            onInput={handleInput}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </DemoCard>

      <CodeBlock
        title="属性绑定"
        code={`// 基础属性
<input
  type="text"
  placeholder="请输入..."
  value="默认值"
  disabled={false}
  class="input-class"
/>

// 布尔属性
<button disabled={true}>禁用</button>
<input checked={false} type="checkbox" />

// 数据属性
<div data-id="123" data-name="example">
  内容
</div>`}
      />

      <CodeBlock
        title="事件绑定"
        code={`// 点击事件
const handleClick = (e: MouseEvent) => {
  console.log('clicked!', e);
};

<button on:click={handleClick}>点击</button>

// 输入事件
const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  console.log(value);
};

<input onInput={handleInput} />

// 多个事件
<button
  on:click={handleClick}
  onMouseEnter={() => console.log('enter')}
  onMouseLeave={() => console.log('leave')}
>
  多事件按钮
</button>`}
      />

      <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h4 class="font-semibold text-yellow-900 mb-2">⚠️ 注意事项</h4>
        <ul class="text-yellow-800 text-sm space-y-1">
          <li>• 事件名使用 camelCase (on:click, onInput)</li>
          <li>• 事件处理器是原生 DOM 事件，不是合成事件</li>
          <li>• 属性值为 null/undefined 会移除该属性</li>
          <li>• className 在 Fukict 中直接用 class</li>
        </ul>
      </div>
    </ExampleLayout>
  );
  }
}
