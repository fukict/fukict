import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout title="05. 实时搜索" description="搜索+防抖+高亮">
      <DemoCard title="说明">
        <p class="text-gray-600">实时搜索功能，带防抖和关键词高亮</p>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
