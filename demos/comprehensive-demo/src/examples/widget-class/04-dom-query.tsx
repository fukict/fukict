import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';

class DOMQueryDemo extends Widget {
  onMounted() {
    // 可以在挂载后使用 $ 和 $$ 查询 DOM
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="demo-container">
          <button
            on:click={() => this.highlightItems()}
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            高亮所有项目
          </button>
          <button
            on:click={() => this.getFirstItem()}
            class="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            获取第一项
          </button>
        </div>

        <div class="items-list space-y-2">
          <div class="item p-3 bg-gray-100 rounded" data-id="1">Item 1</div>
          <div class="item p-3 bg-gray-100 rounded" data-id="2">Item 2</div>
          <div class="item p-3 bg-gray-100 rounded" data-id="3">Item 3</div>
        </div>
      </div>
    );
  }

  private highlightItems() {
    // 使用 $$ 批量查询
    const items = this.$$('.item');
    items.batchSet('style', 'background-color: #fef3c7; border: 2px solid #f59e0b;');
    setTimeout(() => {
      items.batchSet('style', '');
    }, 1000);
  }

  private getFirstItem() {
    // 使用 $ 单个查询
    const first = this.$('.item');
    if (first) {
      const id = first.get('data-id');
      alert(`第一项的 data-id: ${id}`);
    }
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="04. DOM 查询"
      description="使用 $ 和 $$ 方法查询和操作 DOM 元素"
    >
      <DemoCard title="运行效果">
        <DOMQueryDemo />
      </DemoCard>
      </ExampleLayout>
    );
  }
}
