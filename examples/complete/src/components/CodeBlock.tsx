import { Fukict } from '@fukict/basic';

interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string;
}

/**
 * 代码块组件
 * 用于展示代码示例
 */
export class CodeBlock extends Fukict<CodeBlockProps> {
  render() {
    const { code, title, language = 'typescript' } = this.props;

    return (
      <div class="space-y-2">
        {title && <h4 class="text-sm font-medium text-gray-700">{title}</h4>}
        <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60 overflow-x-auto">
          <pre class="text-xs text-gray-700 leading-relaxed">
            <code class={`language-${language}`}>{code}</code>
          </pre>
        </div>
      </div>
    );
  }
}
