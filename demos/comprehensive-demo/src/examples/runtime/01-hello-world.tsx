import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';

export default class HelloWorldExample extends RouteWidget {
  render() {
  return (
    <ExampleLayout
      title="01. Hello World"
      description="最简单的 VNode 渲染示例，理解 Fukict Runtime 的基本用法"
    >
      <DemoCard title="运行效果">
        <div class="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h2 class="text-2xl font-bold text-gray-900">Hello, Fukict! 👋</h2>
          <p class="text-gray-600 mt-2">这是你的第一个 Fukict 应用</p>
        </div>
      </DemoCard>

      <CodeBlock
        title="代码示例"
        code={`import { render } from '@fukict/runtime';

// 创建 VNode
const app = (
  <div class="greeting">
    <h2>Hello, Fukict! 👋</h2>
    <p>这是你的第一个 Fukict 应用</p>
  </div>
);

// 渲染到 DOM
render(app, {
  container: document.getElementById('app')!,
  replace: true
});`}
      />

      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h4 class="font-semibold text-blue-900 mb-2">💡 核心概念</h4>
        <ul class="text-blue-800 text-sm space-y-1">
          <li>• VNode 是虚拟 DOM 节点的表示</li>
          <li>• JSX 语法会被 Babel 编译为 VNode 对象</li>
          <li>• render 函数将 VNode 转换为真实 DOM</li>
          <li>• replace: true 会清空容器后再渲染</li>
        </ul>
      </div>
    </ExampleLayout>
    );
  }
}
