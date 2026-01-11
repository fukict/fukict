import { Fukict, type JSX } from '@fukict/basic';

interface PageHeaderProps {
  title: string;
  description?: JSX.Element | string;
}

/**
 * 页面头部组件
 * 显示页面标题和描述
 */
export class PageHeader extends Fukict<PageHeaderProps> {
  render() {
    const { title, description } = this.props;

    return (
      <div class="mb-4 border-b border-gray-400 pb-5">
        <h1 class="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p class="mt-2 text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        )}
      </div>
    );
  }
}
