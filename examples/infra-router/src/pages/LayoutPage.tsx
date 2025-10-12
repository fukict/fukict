import type { VNode } from '@fukict/basic';
import { Link, RouteComponent, RouterView } from '@fukict/router';

/**
 * Layout 页面 - 应用布局根组件
 *
 * 包含全局导航和页脚，所有页面都在此布局内渲染
 */
export class LayoutPage extends RouteComponent {
  render(): VNode {
    return (
      <div class="min-h-screen flex flex-col bg-gray-50">
        {/* Header Navigation */}
        <header class="bg-white shadow-sm border-b sticky top-0 z-10">
          <div class="container mx-auto px-4">
            <div class="flex items-center justify-between h-16">
              {/* Logo */}
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">F</span>
                </div>
                <h1 class="text-xl font-bold text-gray-900">Fukict Router</h1>
              </div>

              {/* Navigation Links */}
              <nav class="flex items-center gap-1">
                <Link
                  to="/home"
                  class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
                >
                  About
                </Link>
                <Link
                  to="/user/123"
                  class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  activeClass="bg-blue-50 text-blue-600 font-semibold"
                >
                  User
                </Link>
                <Link
                  to="/search?q=fukict"
                  // class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  activeClass="bg-blue-50 text-blue-600 font-semibold"
                >
                  Search
                </Link>
                <Link
                  to="/dashboard/overview"
                  class="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  activeClass="bg-blue-50 text-blue-600 font-semibold"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main class="flex-1 container mx-auto px-4 py-8">
          <div class="bg-white rounded-lg shadow-sm border p-8">
            <RouterView router={this.router} />
          </div>
        </main>

        {/* Footer */}
        <footer class="bg-white border-t mt-auto">
          <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between text-sm text-gray-600">
              <p>
                Built with{' '}
                <a
                  href="https://github.com/yourusername/fukict"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  Fukict Framework
                </a>
              </p>
              <p>
                Current Route:{' '}
                <code class="px-2 py-1 bg-gray-100 rounded text-xs">
                  {this.route.path}
                </code>
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}
