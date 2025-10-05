import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { defineWidget } from '@fukict/widget';

const PropsDemo = defineWidget<{ value: number; color: string }>(
  ({ value, color }) => {
    return (
      <div class={`p-6 rounded-lg text-white text-center bg-${color}-600`}>
        <div class="text-4xl font-bold">{value}</div>
        <p class="mt-2 text-sm">Props 自动深度比较更新</p>
      </div>
    );
  }
);

export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout
      title="02. Props 变更更新"
      description="函数组件会自动深度比较 props 并更新"
    >
      <DemoCard title="运行效果">
        <div class="grid grid-cols-3 gap-4">
          <PropsDemo value={10} color="red" />
          <PropsDemo value={20} color="green" />
          <PropsDemo value={30} color="blue" />
        </div>
        <p class="mt-4 text-sm text-gray-600">
          💡 当 props 变化时，函数组件会自动重新渲染
        </p>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
