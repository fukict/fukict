import { RouteComponent } from '@fukict/router';

/**
 * 首页
 */
export class HomePage extends RouteComponent {
  render() {
    return (
      <div class="space-y-8">
        {/* 页面头部 */}
        <div class="border-b border-gray-200/80 pb-5">
          <h1 class="text-2xl font-semibold text-gray-900">
            Fukict Complete Examples
          </h1>
          <p class="mt-2 text-sm text-gray-600 leading-relaxed">
            探索 Fukict 框架的所有功能和最佳实践
          </p>
        </div>

        {/* 框架介绍 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">什么是 Fukict?</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Fukict 是一个轻量级的 DOM 渲染库,专注于性能关键场景。它采用编译时
            JSX 优化来减少运行时开销,通过直接 DOM
            操作实现最小抽象,并提供模块化设计和清晰的关注点分离。
          </p>
        </div>

        {/* 核心包 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">核心包</h2>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <ul class="space-y-2 text-sm text-gray-700">
              <li>
                <strong class="text-gray-900">@fukict/basic</strong> -
                核心渲染引擎
              </li>
              <li>
                <strong class="text-gray-900">@fukict/router</strong> - SPA
                路由系统
              </li>
              <li>
                <strong class="text-gray-900">@fukict/flux</strong> - 状态管理
              </li>
              <li>
                <strong class="text-gray-900">@fukict/i18n</strong> - 国际化支持
              </li>
            </ul>
          </div>
        </div>

        {/* 快速开始 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">快速开始</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            点击左侧导航栏探索各个功能模块的详细示例和文档。每个示例都包含可交互的代码演示和详细说明。
          </p>
        </div>

        {/* 学习路径 */}
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">学习路径</h2>
          <div class="bg-gray-50/50 rounded-lg p-4 border border-gray-200/60">
            <ol class="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
              <li>从 "开始" 章节了解框架基础</li>
              <li>学习 "@fukict/basic" 的核心概念</li>
              <li>掌握 "@fukict/router" 构建单页应用</li>
              <li>使用 "@fukict/flux" 管理应用状态</li>
              <li>通过 "@fukict/i18n" 实现多语言支持</li>
              <li>查看 "综合示例" 了解完整应用开发</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}
