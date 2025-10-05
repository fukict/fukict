import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard, CodeBlock } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';

class BasicCounter extends Widget {
  render() {
    return (
      <div class="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-center">
        <h3 class="text-2xl font-bold">我的第一个 Widget 类组件</h3>
        <p class="mt-2">这是一个最简单的类组件示例</p>
      </div>
    );
  }
}

export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout
      title="01. 基础类组件"
      description="创建你的第一个 Widget 类组件"
    >
      <DemoCard title="运行效果">
        <BasicCounter />
      </DemoCard>

      <CodeBlock
        title="代码示例"
        code={`import { Widget } from '@fukict/widget';

class BasicCounter extends Widget {
  render() {
    return (
      <div class="container">
        <h3>我的第一个 Widget 类组件</h3>
        <p>这是一个最简单的类组件示例</p>
      </div>
    );
  }
  }
}

// 使用组件
const counter = new BasicCounter({});
counter.mount(document.getElementById('app')!);`}
      />
    </ExampleLayout>
  );
  }
}
