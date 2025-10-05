import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout title="02. 购物车" description="电商购物车功能示例">
      <DemoCard title="功能">
        <ul class="list-disc list-inside space-y-2 text-gray-700">
          <li>商品列表展示</li>
          <li>添加到购物车</li>
          <li>数量调整</li>
          <li>总价计算</li>
          <li>状态持久化</li>
        </ul>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
