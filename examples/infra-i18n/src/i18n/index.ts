/**
 * @fukict/i18n Example - i18n Instance
 */
import { createI18n } from '@fukict/i18n';

import { messages } from './messages';

/**
 * Create i18n instance with default messages
 */
export const i18n = createI18n({
  defaultLocale: 'en',
  locale: 'en',
  messages,
  fallbackLocale: 'en',
});

// Export for convenience
export { messages };
export type { Locale, Messages } from './messages';
