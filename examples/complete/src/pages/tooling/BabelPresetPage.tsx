import { RouteComponent } from '@fukict/router';

/**
 * Babel Preset 页面
 */
export class BabelPresetPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-8">
        {/* 简介 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">
            什么是 @fukict/babel-preset
          </h3>
          <p class="text-sm leading-relaxed text-gray-600">
            Fukict 的 Babel 预设，用于将 JSX 编译为 Fukict 可识别的 hyperscript
            调用。 提供编译时优化，减少运行时开销。
          </p>
        </div>

        {/* 安装 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">安装</h3>
          <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
            <pre class="text-xs leading-relaxed text-gray-700">
              {`npm install -D @fukict/babel-preset @babel/core`}
            </pre>
          </div>
        </div>

        {/* 配置 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">配置</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            在项目根目录创建 babel.config.js
          </p>
          <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
            <pre class="text-xs leading-relaxed text-gray-700">
              {`// babel.config.js
module.exports = {
  presets: [
    '@fukict/babel-preset'
  ]
};`}
            </pre>
          </div>
        </div>

        {/* 工作原理 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">工作原理</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            babel-preset 将 JSX 语法转换为 hyperscript 函数调用
          </p>
          <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
            <pre class="text-xs leading-relaxed text-gray-700">
              {`// 输入 (JSX)
<div class="container">
  <h1>Hello</h1>
  <button on:click={handleClick}>Click</button>
</div>

// 输出 (编译后)
hyperscript('div', {
  class: 'container'
}, [
  hyperscript('h1', null, ['Hello']),
  hyperscript('button', {
    'on:click': handleClick
  }, ['Click'])
])`}
            </pre>
          </div>
        </div>

        {/* 关键特性 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">关键特性</h3>
          <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
            <ul class="space-y-2 text-sm text-gray-700">
              <li>
                <strong class="text-gray-900">事件分离</strong>: 自动识别 on:
                前缀的事件属性
              </li>
              <li>
                <strong class="text-gray-900">Children 数组化</strong>: 确保
                children 始终是数组（Fukict 运行时要求）
              </li>
              <li>
                <strong class="text-gray-900">自动导入</strong>: 自动导入
                hyperscript 函数
              </li>
              <li>
                <strong class="text-gray-900">类型保留</strong>: 跳过 import
                type 语句
              </li>
            </ul>
          </div>
        </div>

        {/* 与 Vite 插件的区别 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">
            Babel Preset vs Vite Plugin
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
              <h4 class="mb-2 text-sm font-medium text-gray-900">
                @fukict/babel-preset
              </h4>
              <ul class="space-y-1 text-xs text-gray-700">
                <li>适用于任何构建工具</li>
                <li>需要配置 Babel</li>
                <li>更灵活的配置选项</li>
                <li>适合 Webpack、Rollup 等</li>
              </ul>
            </div>
            <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
              <h4 class="mb-2 text-sm font-medium text-gray-900">
                @fukict/vite-plugin
              </h4>
              <ul class="space-y-1 text-xs text-gray-700">
                <li>专为 Vite 设计</li>
                <li>零配置开箱即用</li>
                <li>更好的 HMR 支持</li>
                <li>推荐用于新项目</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 高级配置 */}
        <div class="space-y-3">
          <h3 class="text-base font-medium text-gray-800">高级配置</h3>
          <div class="rounded-lg border border-gray-200/60 bg-gray-50/50 p-4">
            <pre class="text-xs leading-relaxed text-gray-700">
              {`// babel.config.js
module.exports = {
  presets: [
    ['@fukict/babel-preset', {
      // 自定义 hyperscript 函数名
      pragma: 'h',

      // 自定义导入来源
      importSource: '@fukict/basic',

      // 开发模式（更多调试信息）
      development: process.env.NODE_ENV === 'development'
    }]
  ]
};`}
            </pre>
          </div>
        </div>
      </div>
    );
  }
}
