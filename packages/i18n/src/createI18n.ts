/**
 * @fukict/i18n - createI18n
 *
 * Factory function to create i18n instance
 */
import { I18n } from './I18n';
import type { I18nInstance, I18nOptions } from './types';

/**
 * Create i18n instance
 *
 * @example
 * ```typescript
 * const i18n = createI18n({
 *   defaultLocale: 'en',
 *   messages: {
 *     en: { hello: 'Hello' },
 *     zh: { hello: '你好' },
 *   },
 * });
 * ```
 */
export function createI18n<Messages extends Record<string, any>>(
  options: I18nOptions<Messages>,
): I18nInstance<Messages> {
  return new I18n(options);
}
