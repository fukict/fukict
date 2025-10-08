import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { defineWidget } from '@fukict/widget';

const Greeting = defineWidget<{ name: string }>(({ name }) => {
  return (
    <div class="p-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg text-white text-center">
      <h3 class="text-2xl font-bold">Hello, {name}!</h3>
      <p class="mt-2">这是一个函数组件</p>
    </div>
  );
});

export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout
      title="01. 基础函数组件"
      description="使用 defineWidget 创建简洁的函数组件"
    >
      <DemoCard title="运行效果">
        <div class="space-y-4">
          <Greeting name="Alice" />
          <Greeting name="Bob" />
          <Greeting name="Fukict" />
        </div>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
