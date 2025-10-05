import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout title="08. 全局状态" description="跨组件状态共享">
      <DemoCard title="说明">
        <p class="text-gray-600">创建全局 state 实例，在多个组件间共享</p>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
