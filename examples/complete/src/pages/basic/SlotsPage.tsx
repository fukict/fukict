import { Fukict, type VNode } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 默认插槽 - Card 组件
 */
class Card extends Fukict {
  render() {
    return (
      <div class="overflow-hidden rounded-lg border border-gray-300">
        <div class="bg-white p-4">{this.slots.default}</div>
      </div>
    );
  }
}

/**
 * 默认插槽演示
 */
class DefaultSlotDemo extends Fukict {
  render() {
    return (
      <Card>
        <h3 class="mb-2 text-lg font-semibold text-gray-900">卡片标题</h3>
        <p class="text-sm text-gray-600">
          这是卡片的主要内容，通过默认插槽传递进来。
        </p>
      </Card>
    );
  }
}

/**
 * 具名插槽 - Card 组件 (支持 header 和 footer)
 */
interface CardWithSlotsProps {
  title?: string;
}

class CardWithSlots extends Fukict<CardWithSlotsProps> {
  render() {
    return (
      <div class="overflow-hidden rounded-lg border border-gray-300">
        {/* Header 插槽 */}
        {this.slots.header && (
          <div class="border-b border-gray-300 bg-gray-50 px-4 py-3">
            {this.slots.header}
          </div>
        )}

        {/* 默认插槽 */}
        <div class="bg-white p-4">{this.slots.default}</div>

        {/* Footer 插槽 */}
        {this.slots.footer && (
          <div class="border-t border-gray-300 bg-gray-50 px-4 py-3">
            {this.slots.footer}
          </div>
        )}
      </div>
    );
  }
}

/**
 * 具名插槽演示
 */
class NamedSlotsDemo extends Fukict {
  render() {
    return (
      <CardWithSlots>
        <div fukict:slot="header">
          <h3 class="text-base font-semibold text-gray-900">卡片标题</h3>
        </div>

        <p class="mb-3 text-sm text-gray-600">这是卡片的主要内容区域。</p>
        <p class="text-sm text-gray-600">支持多个子元素。</p>

        <div fukict:slot="footer">
          <button class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">
            确定
          </button>
        </div>
      </CardWithSlots>
    );
  }
}

/**
 * 插槽作用域 - List 组件
 */
interface ListProps {
  items: string[];
  renderItem: (item: string, index: number) => VNode;
}

class List extends Fukict<ListProps> {
  render() {
    const { items, renderItem } = this.props;

    return (
      <ul class="space-y-2">
        {items.map((item, index) => (
          <li class="flex items-center">{renderItem(item, index)}</li>
        ))}
      </ul>
    );
  }
}

/**
 * 插槽作用域演示
 */
class ScopedSlotDemo extends Fukict {
  private items = ['Apple', 'Banana', 'Cherry'];

  render() {
    return (
      <List
        items={this.items}
        renderItem={(item, index) => (
          <div class="flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
              {index + 1}
            </span>
            <span class="text-sm text-gray-700">{item}</span>
          </div>
        )}
      />
    );
  }
}

/**
 * 动态 slots 更新演示
 */
class DynamicCard extends Fukict {
  render() {
    return (
      <div class="overflow-hidden rounded-lg border border-gray-300">
        {/* Header 插槽 */}
        {this.slots.header && (
          <div class="border-b border-gray-300 bg-gray-50 px-4 py-3">
            {this.slots.header}
          </div>
        )}

        {/* 默认插槽 */}
        <div class="bg-white p-4">{this.slots.default}</div>

        {/* Footer 插槽 */}
        {this.slots.footer && (
          <div class="border-t border-gray-300 bg-gray-50 px-4 py-3">
            {this.slots.footer}
          </div>
        )}
      </div>
    );
  }
}

class DynamicSlotsDemo extends Fukict {
  private mode: 'simple' | 'full' = 'simple';
  private content = '这是默认内容';
  private count = 0;

  toggleMode() {
    this.mode = this.mode === 'simple' ? 'full' : 'simple';
    this.update();
  }

  updateContent() {
    this.count++;
    this.content = `内容已更新 ${this.count} 次`;
    this.update();
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="flex gap-2">
          <button
            on:click={() => this.toggleMode()}
            class="rounded-md bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-700"
          >
            切换模式 (当前: {this.mode === 'simple' ? '简单' : '完整'})
          </button>
          <button
            on:click={() => this.updateContent()}
            class="rounded-md bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
          >
            更新内容
          </button>
        </div>

        {this.mode === 'simple' ? (
          <DynamicCard>
            <p class="text-sm text-gray-700">{this.content}</p>
          </DynamicCard>
        ) : (
          <DynamicCard>
            <div fukict:slot="header">
              <h3 class="text-base font-semibold text-gray-900">
                完整模式标题
              </h3>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium text-gray-900">{this.content}</p>
              <p class="text-xs text-gray-600">
                这是完整模式，包含 header 和 footer 插槽
              </p>
            </div>

            <div fukict:slot="footer">
              <button class="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600">
                操作按钮
              </button>
            </div>
          </DynamicCard>
        )}

        <div class="rounded-md bg-green-50 p-3 text-xs text-green-800">
          <p class="font-medium">💡 说明:</p>
          <p class="mt-1">
            当父组件 update 时，会重新调用 setupClassComponentVNode， 确保
            this.slots 始终包含最新的子内容。
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Slots 插槽页面
 */
export class SlotsPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 默认插槽 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">默认插槽</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 this.slots.default 访问子内容
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { Fukict } from '@fukict/basic';

// 定义容器组件
class Card extends Fukict {
  render() {
    return (
      <div class="card">
        <div class="card-body">
          {this.slots.default}
        </div>
      </div>
    );
  }
}

// 使用
export class MyPage extends Fukict {
  render() {
    return (
      <Card>
        <h2>卡片标题</h2>
        <p>卡片内容</p>
      </Card>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <DefaultSlotDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 具名插槽 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">具名插槽</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              使用 fukict:slot 属性指定插槽名称
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`class Card extends Fukict {
  render() {
    return (
      <div class="card">
        {this.slots.header && (
          <div class="card-header">
            {this.slots.header}
          </div>
        )}
        <div class="card-body">
          {this.slots.default}
        </div>
        {this.slots.footer && (
          <div class="card-footer">
            {this.slots.footer}
          </div>
        )}
      </div>
    );
  }
}

// 使用
<Card>
  <div fukict:slot="header">
    <h2>标题</h2>
  </div>

  <p>主要内容</p>

  <div fukict:slot="footer">
    <button>确定</button>
  </div>
</Card>`}
            />
            <DemoBox fukict:slot="demo">
              <NamedSlotsDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 插槽作用域 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">插槽作用域</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              通过 renderItem 等函数 prop 实现作用域插槽
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`interface ListProps {
  items: string[];
  renderItem: (item: string, index: number) => VNode;
}

class List extends Fukict<ListProps> {
  render() {
    const { items, renderItem } = this.props;
    return (
      <ul>
        {items.map((item, index) => (
          <li key={index}>{renderItem(item, index)}</li>
        ))}
      </ul>
    );
  }
}

// 使用
<List
  items={['Apple', 'Banana', 'Cherry']}
  renderItem={(item, index) => (
    <span>{index + 1}. {item}</span>
  )}
/>`}
            />
            <DemoBox fukict:slot="demo">
              <ScopedSlotDemo />
            </DemoBox>
          </SplitView>
        </div>

        {/* 动态 slots 更新 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              Update 时动态更新 Slots
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              当父组件 update 重新渲染时，子组件的 this.slots
              会自动更新为最新的内容
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`class Card extends Fukict {
  render() {
    return (
      <div>
        {this.slots.header && (
          <div class="header">{this.slots.header}</div>
        )}
        <div class="body">{this.slots.default}</div>
        {this.slots.footer && (
          <div class="footer">{this.slots.footer}</div>
        )}
      </div>
    );
  }
}

class Parent extends Fukict {
  private mode: 'simple' | 'full' = 'simple';

  toggleMode() {
    this.mode = this.mode === 'simple' ? 'full' : 'simple';
    this.update();
  }

  render() {
    return (
      <div>
        <button on:click={() => this.toggleMode()}>
          切换模式
        </button>

        {/* 条件渲染不同的 slots 内容 */}
        {this.mode === 'simple' ? (
          <Card>
            <p>简单内容</p>
          </Card>
        ) : (
          <Card>
            <div fukict:slot="header">
              <h3>完整模式标题</h3>
            </div>
            <p>详细内容</p>
            <div fukict:slot="footer">
              <button>操作</button>
            </div>
          </Card>
        )}
      </div>
    );
  }
}`}
            />
            <DemoBox fukict:slot="demo">
              <DynamicSlotsDemo />
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
