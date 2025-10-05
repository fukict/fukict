import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout title="03. 数据可视化" description="SVG 图表展示">
      <DemoCard title="说明">
        <p class="text-gray-600">使用 SVG 渲染动态数据图表</p>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
