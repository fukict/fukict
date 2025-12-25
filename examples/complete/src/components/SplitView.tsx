import { Fukict, type VNode } from '@fukict/basic';

interface SplitViewProps {
  leftTitle?: string;
  rightTitle?: string;
  children?: VNode[];
}

/**
 * 左右分栏视图组件
 * 用于展示代码示例和演示效果的并排布局
 *
 * 使用方式:
 * <SplitView leftTitle="代码" rightTitle="演示">
 *   <CodeBlock code="..." />
 *   <DemoBox>...</DemoBox>
 * </SplitView>
 */
export class SplitView extends Fukict<SplitViewProps> {
  render() {
    const { leftTitle = '代码示例', rightTitle = '运行效果' } = this.props;

    return (
      <div class="grid grid-cols-2 gap-6">
        {/* 左侧 - 代码示例 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">{leftTitle}</h3>
          {this.$slots.code}
        </div>

        {/* 右侧 - 演示效果 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">{rightTitle}</h3>
          {this.$slots.demo}
        </div>
      </div>
    );
  }
}
