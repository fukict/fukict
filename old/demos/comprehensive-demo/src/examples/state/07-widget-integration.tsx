import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout title="07. Widget 集成" description="State 与 Widget 的完整集成">
      <DemoCard title="说明">
        <p class="text-gray-600">参考其他示例，State 与 Widget 的集成方式</p>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
