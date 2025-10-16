import { Fukict } from '@fukict/basic';

interface DemoBoxProps {
  title?: string;
}

/**
 * 演示盒子组件
 * 用于展示实际运行的组件效果
 */
export class DemoBox extends Fukict<DemoBoxProps> {
  render() {
    const { title } = this.props;

    return (
      <div class="space-y-2">
        {title && <h4 class="text-sm font-medium text-gray-700">{title}</h4>}
        <div class="rounded-lg border border-gray-200/60 bg-white p-6 shadow-sm">
          {this.slots.default}
        </div>
      </div>
    );
  }
}
