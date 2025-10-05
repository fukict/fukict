import { Widget } from '@fukict/widget';
import type { Router } from '@fukict/router';
import { RouterLink } from '@fukict/router';
import { exampleCategories } from '../config/examples';

interface SidebarProps {
  router: Router;
}

export class Sidebar extends Widget<SidebarProps> {
  private _collapsed: Record<string, boolean> = {
    runtime: false,
    'widget-class': false,
    'widget-function': false,
    state: false,
    router: false,
    comprehensive: false,
  };

  set collapsed(value: Record<string, boolean>) {
    this._collapsed = value;
    this.updateCollapsedUI();
  }

  get collapsed() {
    return this._collapsed;
  }

  toggleCategory(categoryId: string) {
    this.collapsed = {
      ...this._collapsed,
      [categoryId]: !this._collapsed[categoryId],
    };
  }

  private updateCollapsedUI() {
    exampleCategories.forEach((category) => {
      const categoryEl = this.$(`[data-category="${category.id}"]`)?.element;

      if (categoryEl) {
        const isCollapsed = this._collapsed[category.id];

        if (isCollapsed) {
          categoryEl.classList.add('collapsed');
        } else {
          categoryEl.classList.remove('collapsed');
        }
      }
    });
  }

  render() {
    const { router } = this.props;

    return (
      <aside class="w-72 bg-white border-r border-gray-200 h-screen overflow-hidden sticky top-0 flex flex-col">
        {/* Logo Header */}
        <div class="flex-none border-b border-gray-200">
          <RouterLink router={router} to="/" class="block px-6 py-5 hover:bg-gray-50">
            <h1 class="text-lg font-bold text-gray-900">Fukict Demo</h1>
            <p class="text-xs text-gray-500 mt-1">示例集合</p>
          </RouterLink>
        </div>

        {/* Navigation */}
        <nav class="flex-1 overflow-y-auto py-2">
          {exampleCategories.map((category) => {
            const isCollapsed = this._collapsed[category.id];

            return (
              <div
                key={category.id}
                class={`mb-2 ${isCollapsed ? 'collapsed' : ''}`}
                data-category={category.id}
              >
                {/* Category Header - Clickable */}
                <button
                  class="w-full px-6 py-2.5 flex items-center justify-between hover:bg-gray-50 text-left"
                  on:click={() => this.toggleCategory(category.id)}
                >
                  <h3 class="text-sm font-semibold text-gray-900">{category.title}</h3>
                  <span class="text-sm text-gray-400 category-icon"></span>
                </button>

                {/* Examples List */}
                <ul class="category-list mt-3 px-3 space-y-1.5">
                  {category.examples.map((example) => (
                    <li key={example.id}>
                      <RouterLink
                        router={router}
                        to={example.path}
                        class="block px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                        activeClass="bg-primary-50 text-primary-700 font-medium border-l-3 border-primary-600"
                      >
                        {example.title}
                      </RouterLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div class="flex-none border-t border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>v0.1.0</span>
            <a
              href="https://github.com/fukict/fukict"
              target="_blank"
              class="text-primary-600 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </aside>
    );
  }
}

