/**
 * HomePage Component
 */
import { Fukict } from '@fukict/basic';

import { i18n } from '../i18n';

export class HomePage extends Fukict {
  private name = 'Alice';
  private itemCount = 5;

  handleNameChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.name = input.value;
    this.update();
  };

  handleItemCountChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.itemCount = parseInt(input.value) || 0;
    this.update();
  };

  render() {
    return (
      <div class="mx-auto max-w-4xl space-y-8">
        {/* Welcome Section */}
        <section class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {i18n.t('home.welcome')}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            {i18n.t('home.description')}
          </p>
        </section>

        {/* Features Section */}
        <section class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h3 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {i18n.t('home.features.title')}
          </h3>
          <ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <li class="flex items-start gap-3">
              <span class="text-xl text-blue-600 dark:text-blue-400">✓</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('home.features.typeSafe')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl text-blue-600 dark:text-blue-400">✓</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('home.features.reactive')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl text-blue-600 dark:text-blue-400">✓</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('home.features.formatting')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-xl text-blue-600 dark:text-blue-400">✓</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('home.features.plurals')}
              </span>
            </li>
          </ul>
        </section>

        {/* Interactive Demo Section */}
        <section class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h3 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {i18n.t('demo.title')}
          </h3>

          <div class="space-y-6">
            {/* Greeting Demo */}
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {i18n.t('demo.nameLabel')}
              </label>
              <input
                type="text"
                value={this.name}
                on:input={this.handleNameChange}
                placeholder={i18n.t('demo.namePlaceholder')}
                class="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="text-xl text-gray-800 dark:text-gray-200">
                {i18n.t('demo.greeting', { name: this.name })}
              </p>
            </div>

            {/* Plural Demo */}
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {i18n.t('demo.itemsLabel')}
              </label>
              <input
                type="number"
                value={String(this.itemCount)}
                on:input={this.handleItemCountChange}
                min="0"
                class="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="text-xl text-gray-800 dark:text-gray-200">
                {i18n.t('demo.items', { count: this.itemCount })}
              </p>
            </div>

            {/* Formatting Demo */}
            <div class="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                Formatting Examples
              </h4>

              <div class="space-y-2">
                <p class="text-gray-700 dark:text-gray-300">
                  {i18n.t('demo.number', {
                    value: i18n.n(1234567.89),
                  })}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  {i18n.t('demo.currency', {
                    value: i18n.n(1234.56, {
                      style: 'currency',
                      currency: 'USD',
                    }),
                  })}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  {i18n.t('demo.date', {
                    value: i18n.d(new Date(), { dateStyle: 'long' }),
                  })}
                </p>
                <p class="text-gray-700 dark:text-gray-300">
                  {i18n.t('demo.relativeTime', {
                    value: i18n.rt(-2, 'day'),
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h3 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            {i18n.t('about.title')}
          </h3>
          <p class="mb-6 text-gray-600 dark:text-gray-300">
            {i18n.t('about.description')}
          </p>

          <h4 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {i18n.t('about.features.title')}
          </h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('about.features.item1')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('about.features.item2')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('about.features.item3')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('about.features.item4')}
              </span>
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
              <span class="text-gray-700 dark:text-gray-300">
                {i18n.t('about.features.item5')}
              </span>
            </li>
          </ul>
        </section>
      </div>
    );
  }
}
