import { defineWidget } from '@fukict/widget';

interface ExampleLayoutProps {
  title: string;
  description: string;
  children: any[];
}

/**
 * 示例页面统一布局
 */
export const ExampleLayout = defineWidget<ExampleLayoutProps>(
  ({ title, description, children }) => {
    return (
      <div class="example-layout min-h-screen">
        {/* Header with gradient background */}
        <div class="relative mb-8 pb-8 border-b border-gray-200">
          <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 -mx-8 -mt-6 rounded-2xl opacity-50"></div>
          <div class="relative pt-4">
            <h1 class="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {title}
            </h1>
            <p class="text-lg text-gray-600 max-w-3xl">{description}</p>
          </div>
        </div>

        {/* Content */}
        <div class="space-y-6">{children}</div>
      </div>
    );
  }
);

interface CodeBlockProps {
  title?: string;
  code: string;
  language?: string;
}

/**
 * 代码块组件 - 现代化设计
 */
export const CodeBlock = defineWidget<CodeBlockProps>(
  ({ title, code, language = 'typescript' }) => {
    return (
      <div class="code-block group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {title && (
          <div class="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 px-5 py-3 border-b border-gray-700">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span class="font-semibold text-sm">{title}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 uppercase tracking-wide">{language}</span>
              <button class="p-1.5 hover:bg-gray-700 rounded transition-colors" title="复制代码">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div class="relative bg-gray-900">
          <pre class="overflow-x-auto p-5 text-sm leading-relaxed">
            <code class={`language-${language} text-gray-100`}>{code}</code>
          </pre>
          {/* Line numbers decoration */}
          <div class="absolute top-0 left-0 bottom-0 w-12 bg-gray-800/50 border-r border-gray-700 pointer-events-none"></div>
        </div>
      </div>
    );
  }
);

interface DemoCardProps {
  title: string;
  children: any[];
}

/**
 * Demo 卡片组件 - 精美设计
 */
export const DemoCard = defineWidget<DemoCardProps>(({ title, children }) => {
  return (
    <div class="demo-card group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Decorative gradient */}
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

      <div class="p-6">
        {/* Title with icon */}
        <div class="flex items-center gap-3 mb-6">
          <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        {/* Content */}
        <div class="demo-content space-y-4">{children}</div>
      </div>

      {/* Hover effect */}
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
});
