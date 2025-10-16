/**
 * Header Component
 */
import { Fukict } from '@fukict/basic';

import { i18n } from '../i18n';

export class Header extends Fukict {
  render() {
    return (
      <header class="bg-white shadow dark:bg-gray-800">
        <div class="container mx-auto px-4">
          <div class="flex h-16 items-center justify-between">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {i18n.t('app.title')}
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {i18n.t('app.subtitle')}
              </p>
            </div>

            <div class="flex items-center gap-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>
    );
  }
}

/**
 * Language Selector Component (detached, subscribes to i18n itself)
 */
class LanguageSelector extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = i18n.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    void i18n.changeLocale(select.value);
  }

  render() {
    const currentLocale = i18n.locale;

    return (
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {i18n.t('footer.language')}:
        </span>
        <select
          value={currentLocale}
          on:change={this.handleChange}
          class="rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    );
  }
}
