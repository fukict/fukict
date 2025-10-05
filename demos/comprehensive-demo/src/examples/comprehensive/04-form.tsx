import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout title="04. 表单验证" description="复杂表单处理">
      <DemoCard title="说明">
        <p class="text-gray-600">完整的表单验证和错误处理</p>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
