import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { defineWidget } from '@fukict/widget';

const Button = defineWidget<{ label: string; onClick: () => void }>(
  ({ label, onClick }) => (
    <button
      on:click={onClick}
      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
    >
      {label}
    </button>
  )
);

const Card = defineWidget<{ title: string; children: any[] }>(
  ({ title, children }) => (
    <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 class="text-lg font-semibold mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  )
);

export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout
      title="03. 组件组合"
      description="组合多个函数组件构建复杂UI"
    >
      <DemoCard title="运行效果">
        <div class="grid grid-cols-2 gap-4">
          <Card title="卡片 1">
            <p class="text-gray-600 mb-4">这是卡片内容</p>
            <Button label="操作" onClick={() => alert('Card 1')} />
          </Card>
          <Card title="卡片 2">
            <p class="text-gray-600 mb-4">组件可以嵌套组合</p>
            <Button label="点击我" onClick={() => alert('Card 2')} />
          </Card>
        </div>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
