import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class extends RouteWidget {
  render() {
  // 不同类型的 VNode
  const textNode = '纯文本节点';
  const numberNode = 42;
  const booleanNode = true; // 不会渲染
  const nullNode = null; // 不会渲染

  return (
    <ExampleLayout
      title="02. VNode 渲染"
      description="理解 VNode 的结构和不同类型的渲染方式"
    >
      <DemoCard title="文本节点">
        <div class="space-y-2">
          <div class="p-3 bg-gray-100 rounded">文本: {textNode}</div>
          <div class="p-3 bg-gray-100 rounded">数字: {numberNode}</div>
          <div class="p-3 bg-gray-100 rounded">
            布尔值: {booleanNode} (不渲染)
          </div>
          <div class="p-3 bg-gray-100 rounded">Null: {nullNode} (不渲染)</div>
        </div>
      </DemoCard>

      <DemoCard title="嵌套 VNode">
        <div class="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
          <h3 class="text-lg font-semibold">嵌套结构</h3>
          <div class="mt-2 pl-4 border-l-2 border-purple-300">
            <p>这是第一层嵌套</p>
            <div class="mt-2 pl-4 border-l-2 border-pink-300">
              <p>这是第二层嵌套</p>
              <div class="mt-2 pl-4 border-l-2 border-purple-200">
                <p>这是第三层嵌套</p>
              </div>
            </div>
          </div>
        </div>
      </DemoCard>

      <CodeBlock
        title="VNode 结构"
        code={`// 文本节点
const textNode = "Hello";

// 元素节点
const elementNode = (
  <div class="container">
    <h1>标题</h1>
    <p>段落</p>
  </div>
);

// 编译后的 VNode 对象
const vnode = {
  type: 'div',
  props: { class: 'container' },
  children: [
    { type: 'h1', props: null, children: ['标题'] },
    { type: 'p', props: null, children: ['段落'] }
  ],
  events: null,
  ref: null
};`}
      />

      <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h4 class="font-semibold text-green-900 mb-2">✅ 渲染规则</h4>
        <ul class="text-green-800 text-sm space-y-1">
          <li>• 字符串和数字：渲染为文本节点</li>
          <li>• 布尔值、null、undefined：不渲染</li>
          <li>• 数组：依次渲染每个子元素</li>
          <li>• 对象（VNode）：渲染为 DOM 元素</li>
        </ul>
      </div>
    </ExampleLayout>
  );
  }
}
