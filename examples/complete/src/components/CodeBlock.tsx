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
        <div class="overflow-x-auto rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
          <pre class="text-xs leading-relaxed text-gray-700">
            <code class={`language-${language}`}>{code}</code>
          </pre>
        </div>
      </div>
    );
  }
}
