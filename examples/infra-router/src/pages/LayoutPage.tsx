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
      <div class="flex min-h-screen flex-col bg-gray-50">
        {/* Header Navigation */}
        <header class="sticky top-0 z-10 border-b bg-white shadow-sm">
          <div class="container mx-auto px-4">
            <div class="flex h-16 items-center justify-between">
              {/* Logo */}
              <div class="flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <span class="text-lg font-bold text-white">F</span>
                </div>
                <h1 class="text-xl font-bold text-gray-900">Fukict Router</h1>
              </div>

              {/* Navigation Links */}
              <nav class="flex items-center gap-1">
                <Link
                  to="/"
                  class="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  class="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  exactActiveClass="bg-blue-100 text-blue-600 font-semibold"
                >
                  About
                </Link>
                <Link
                  to="/user/123"
                  class="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  activeClass="bg-blue-50 text-blue-600 font-semibold"
                >
                  User
                </Link>
                <Link
                  to="/search?q=fukict"
                  class="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  activeClass="bg-blue-50 text-blue-600 font-semibold"
                >
                  Search
                </Link>
                <Link
                  to="/dashboard"
                  class="rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  activeClass="bg-blue-50 text-blue-600 font-semibold"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main class="container mx-auto flex-1 px-4 py-8">
          <div class="rounded-lg border bg-white p-8 shadow-sm">
            <RouterView router={this.router} />
          </div>
        </main>

        {/* Footer */}
        <footer class="mt-auto border-t bg-white">
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
                <code class="rounded bg-gray-100 px-2 py-1 text-xs">
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
