/**
 * Footer Component
 */
import { Fukict } from '@fukict/basic';

import { i18n } from '../i18n';

export class Footer extends Fukict {
  render() {
    return (
      <footer class="mt-auto border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="container mx-auto px-4 py-6">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {i18n.t('footer.copyright')}
            </p>

            <div class="flex items-center gap-6">
              <a
                href="https://github.com/fukict/fukict"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {i18n.t('footer.github')}
              </a>
              <a
                href="#"
                class="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {i18n.t('footer.docs')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}
