import { Fukict } from '@fukict/basic';
import { Link, Router } from '@fukict/router';

import { type SidebarItem, getSidebarItems } from '../routes';

/**
 * 侧边栏组件
 * 二级导航: 分组 + 页面列表
 */
export class Sidebar extends Fukict<{ router: Router }> {
  private sidebarItems: SidebarItem[] = [];
  private expandedGroups: Set<string> = new Set();

  constructor(props: { router: Router }) {
    super(props);
    this.sidebarItems = getSidebarItems();

    // 默认展开所有有子项的分组
    this.sidebarItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        this.expandedGroups.add(item.path);
      }
    });
  }

  private toggleGroup(path: string): void {
    if (this.expandedGroups.has(path)) {
      this.expandedGroups.delete(path);
    } else {
      this.expandedGroups.add(path);
    }
    this.update();
  }

  private isActive(path: string): boolean {
    return this.props.router.currentRoute.path.startsWith(path);
  }

  render() {
    return (
      <aside class="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-300 bg-gray-300">
        <div class="p-5">
          {/* Logo */}
          <div class="mb-8 px-2">
            <h1 class="text-base font-semibold text-gray-900">Fukict</h1>
            <p class="mt-0.5 text-xs text-gray-500">Complete Examples</p>
          </div>

          {/* Navigation */}
          <nav class="space-y-1.5">
            {this.sidebarItems.map(item => {
              // 有子项的分组
              if (item.children && item.children.length > 0) {
                const isExpanded = this.expandedGroups.has(item.path);

                return (
                  <div class="mb-4">
                    {/* 分组标题 */}
                    <button
                      class="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:text-gray-900"
                      on:click={() => this.toggleGroup(item.path)}
                    >
                      <span class="tracking-wide">{item.title}</span>
                      <svg
                        class={`h-3.5 w-3.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* 子项列表 */}
                    {isExpanded && (
                      <div class="mt-1 space-y-0.5 pl-2">
                        {item.children.map(child => (
                          <Link
                            to={`${item.path}${child.path}`}
                            activeClass={
                              this.isActive(`${item.path}${child.path}`)
                                ? 'bg-gray-200 text-gray-900 font-medium'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                            }
                            class={`block rounded px-2 py-1.5 text-xs transition-all`}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // 无子项的单独页面
              return (
                <Link
                  to={item.path}
                  activeClass={
                    this.isActive(item.path)
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                  }
                  class={`block rounded px-2 py-1.5 text-xs font-medium transition-all`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    );
  }
}
