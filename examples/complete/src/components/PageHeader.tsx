import { Fukict } from '@fukict/basic';

interface PageHeaderProps {
  title: string;
  description?: string;
}

/**
 * 页面头部组件
 * 显示页面标题和描述
 */
export class PageHeader extends Fukict<PageHeaderProps> {
  render() {
    const { title, description } = this.props;

    return (
      <div class="border-b border-gray-400 pb-5 mb-4">
        <h1 class="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  }
}
