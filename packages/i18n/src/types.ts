/**
 * @fukict/i18n - Types
 *
 * Type definitions for i18n library
 */

/**
 * Listener function type
 */
export type I18nListener = () => void;

/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void;

/**
 * Recursively extract key paths from nested object
 */
export type KeyPath<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? Prefix extends ''
          ? K
          : `${Prefix}.${K}`
        : KeyPath<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>;
    }[keyof T & string]
  : never;

/**
 * Extract translation key type from messages
 */
export type TranslationKey<Messages> =
  Messages extends Record<string, infer Msg> ? KeyPath<Msg> : never;

/**
 * I18n configuration options
 */
export interface I18nOptions<Messages extends Record<string, any>> {
  /**
   * Default locale
   */
  defaultLocale: string;

  /**
   * Current locale (optional, defaults to defaultLocale)
   */
  locale?: string;

  /**
   * Translation messages
   */
  messages: Messages;

  /**
   * Missing translation handler
   * - 'key': return the key itself (default)
   * - 'fallback': use fallbackLocale
   * - function: custom handler
   */
  missingHandler?:
    | 'key'
    | 'fallback'
    | ((key: string, locale: string) => string);

  /**
   * Fallback locale (when translation is missing)
   */
  fallbackLocale?: string;

  /**
   * Lazy load messages function
   */
  loadMessages?: (locale: string) => Promise<Messages[keyof Messages]>;
}

/**
 * I18n instance interface
 */
export interface I18nInstance<Messages extends Record<string, any>> {
  /**
   * Current locale (readonly)
   */
  readonly locale: string;

  /**
   * Translate text
   */
  t(key: string, params?: Record<string, any>): string;

  /**
   * Change locale
   */
  changeLocale(locale: string): Promise<void>;

  /**
   * Subscribe to locale changes
   */
  subscribe(listener: I18nListener): Unsubscribe;

  /**
   * Get current locale messages
   */
  getMessages(): Messages[keyof Messages];

  /**
   * Get available locales
   */
  getAvailableLocales(): string[];

  /**
   * Add messages for a locale
   */
  addMessages(locale: string, messages: Messages[keyof Messages]): void;

  /**
   * Format number
   */
  n(value: number, options?: Intl.NumberFormatOptions): string;

  /**
   * Format date
   */
  d(value: Date | number, options?: Intl.DateTimeFormatOptions): string;

  /**
   * Format relative time
   */
  rt(value: number, unit: Intl.RelativeTimeFormatUnit): string;
}
