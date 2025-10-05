import { RouteWidget } from '@fukict/router';
import { RouterLink } from '@fukict/router';
import { exampleCategories } from '../config/examples';

export class Home extends RouteWidget {
  render() {
    return (
      <div class="home-page">
        {/* Hero Section */}
        <div class="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-white mb-12 shadow-2xl">
          {/* Decorative elements */}
          <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32"></div>

          <div class="relative z-10">
            <div class="inline-flex items-center gap-3 mb-6 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
              <span class="text-2xl">⚡</span>
              <span class="font-semibold">v0.1.0</span>
            </div>

            <h1 class="text-6xl font-extrabold mb-4 leading-tight">
              Fukict Comprehensive Demo
            </h1>
            <p class="text-2xl opacity-90 mb-8 max-w-2xl">
              探索 Fukict 生态系统的完整示例集合
            </p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 hover:bg-white/25 transition-all">
                <div class="font-bold text-sm">Runtime</div>
                <div class="text-xs opacity-80 mt-1">VNode 渲染 &lt; 10KB</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 hover:bg-white/25 transition-all">
                <div class="font-bold text-sm">Widget</div>
                <div class="text-xs opacity-80 mt-1">组件编码范式</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 hover:bg-white/25 transition-all">
                <div class="font-bold text-sm">State</div>
                <div class="text-xs opacity-80 mt-1">状态管理 &lt; 2KB</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 hover:bg-white/25 transition-all">
                <div class="font-bold text-sm">Router</div>
                <div class="text-xs opacity-80 mt-1">轻量级路由</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div class="mb-16">
          <h2 class="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
            <span class="text-3xl">✨</span>
            特性亮点
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-3xl">🎯</span>
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">精确 DOM 操作</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                基于 VNode 的精确 DOM 更新，最小化 DOM 操作
              </p>
            </div>

            <div class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-3xl">📦</span>
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">极致轻量</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                Runtime &lt; 10KB，State &lt; 2KB，专为性能场景设计
              </p>
            </div>

            <div class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-3xl">🔧</span>
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">编译时优化</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                Babel 插件在构建时优化 JSX，减少运行时开销
              </p>
            </div>

            <div class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-3xl">🎨</span>
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">灵活组件</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                支持类组件和函数组件，手动控制渲染时机
              </p>
            </div>

            <div class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-3xl">🔄</span>
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">显式状态</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                纯观察者模式，无魔法，用户完全控制
              </p>
            </div>

            <div class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div class="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span class="text-3xl">🚦</span>
              </div>
              <h3 class="text-xl font-bold mb-3 text-gray-900">轻量路由</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                简洁的路由系统，支持动态路由和路由守卫
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div class="mb-12">
          <h2 class="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
            <span class="text-3xl">📚</span>
            示例分类
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exampleCategories.map((category, index) => {
              const colors = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-red-500',
                'from-indigo-500 to-purple-500',
                'from-pink-500 to-rose-500',
              ];
              const bgColors = [
                'from-blue-50 to-cyan-50',
                'from-purple-50 to-pink-50',
                'from-green-50 to-emerald-50',
                'from-orange-50 to-red-50',
                'from-indigo-50 to-purple-50',
                'from-pink-50 to-rose-50',
              ];

              return (
                <RouterLink
                  key={category.id}
                  router={this.route.router}
                  to={category.examples[0]?.path || '/'}
                  class="group block"
                >
                  <div class={`relative bg-gradient-to-br ${bgColors[index]} rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-primary-300 hover:-translate-y-1`}>
                    {/* Icon badge */}
                    <div class={`absolute top-6 right-6 w-16 h-16 bg-gradient-to-br ${colors[index]} rounded-2xl shadow-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                      <span class="text-3xl">{category.icon}</span>
                    </div>

                    <div class="pr-20">
                      <h3 class="text-2xl font-bold text-gray-900 mb-3">
                        {category.title}
                      </h3>
                      <p class="text-gray-700 mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      <div class="flex items-center gap-4">
                        <span class={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${colors[index]} text-white rounded-full text-sm font-semibold shadow-md`}>
                          <span>{category.examples.length}</span>
                          <span>个示例</span>
                        </span>
                        <span class="text-sm text-gray-500 group-hover:text-primary-600 transition-colors">
                          点击探索 →
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
