/**
 * @fukict/i18n - I18n Class
 *
 * Core i18n class implementation
 */
import type {
  I18nInstance,
  I18nListener,
  I18nOptions,
  Unsubscribe,
} from './types';

/**
 * I18n class
 */
export class I18n<Messages extends Record<string, any>>
  implements I18nInstance<Messages>
{
  /**
   * Current locale
   */
  private currentLocale: string;

  /**
   * Translation messages
   */
  private messages: Messages;

  /**
   * Configuration options
   */
  private options: I18nOptions<Messages>;

  /**
   * Subscribers
   */
  private listeners: Set<I18nListener> = new Set();

  /**
   * Loading locales (track loading state)
   */
  private loadingLocales = new Set<string>();

  /**
   * Loaded locales (track loaded state)
   */
  private loadedLocales = new Set<string>();

  /**
   * Translation cache
   */
  private translationCache = new Map<string, string>();

  /**
   * Constructor
   */
  constructor(options: I18nOptions<Messages>) {
    this.options = options;
    this.currentLocale = options.locale || options.defaultLocale;
    this.messages = options.messages;

    // Mark initially provided locales as loaded
    for (const locale of Object.keys(options.messages)) {
      this.loadedLocales.add(locale);
    }
  }

  /**
   * Get current locale
   */
  get locale(): string {
    return this.currentLocale;
  }

  /**
   * Translate text
   */
  t(key: string, params?: Record<string, any>): string {
    // Check cache
    const cacheKey = `${this.currentLocale}:${key as string}:${JSON.stringify(params || {})}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    // Get translation
    const result = this.translate(key, params);

    // Cache result
    this.translationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Internal translate function
   */
  private translate(key: string, params?: Record<string, any>): string {
    // Try current locale
    let text = this.getTextByKey(key, this.currentLocale);

    // Try fallback locale
    if (text === undefined && this.options.fallbackLocale) {
      text = this.getTextByKey(key, this.options.fallbackLocale);
    }

    // Handle missing translation
    if (text === undefined) {
      return this.handleMissing(key, this.currentLocale);
    }

    // Handle plural forms
    if (params && 'count' in params && typeof text === 'object') {
      text = this.getPluralForm(text, params.count as number);
    }

    // Handle interpolation
    if (params && typeof text === 'string') {
      text = this.interpolate(text, params);
    }

    return text as string;
  }

  /**
   * Get text by key from locale
   */
  private getTextByKey(key: string, locale: string): any {
    const messages = this.messages[locale];
    if (!messages) return undefined;

    // Support dot notation: 'user.name'
    const keys = key.split('.');
    let current: any = messages;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Get plural form based on count
   */
  private getPluralForm(pluralObj: any, count: number): string {
    // Use Intl.PluralRules to determine plural category
    const rules = new Intl.PluralRules(this.currentLocale);
    const category = rules.select(count);

    // Try to get the plural form
    if (category in pluralObj) {
      return pluralObj[category];
    }

    // Fallback to 'other'
    if ('other' in pluralObj) {
      return pluralObj.other;
    }

    // Return empty if no match
    return '';
  }

  /**
   * Interpolate variables in text
   */
  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return key in params ? String(params[key]) : match;
    });
  }

  /**
   * Handle missing translation
   */
  private handleMissing(key: string, locale: string): string {
    const handler = this.options.missingHandler;

    if (typeof handler === 'function') {
      return handler(key, locale);
    }

    if (handler === 'fallback' && this.options.fallbackLocale) {
      const fallbackText = this.getTextByKey(key, this.options.fallbackLocale);
      if (fallbackText !== undefined) {
        return fallbackText;
      }
    }

    // Default: return key
    return key;
  }

  /**
   * Change locale
   */
  async changeLocale(locale: string): Promise<void> {
    // Already current locale
    if (locale === this.currentLocale) {
      return;
    }

    // If already loaded, just switch
    if (this.loadedLocales.has(locale)) {
      this.currentLocale = locale;
      this.notify();
      return;
    }

    // If loading, wait for it
    if (this.loadingLocales.has(locale)) {
      await this.waitForLocale(locale);
      return;
    }

    // Load new locale
    if (this.options.loadMessages) {
      this.loadingLocales.add(locale);
      try {
        const messages = await this.options.loadMessages(locale);
        this.addMessages(locale, messages);
        this.loadedLocales.add(locale);
        this.currentLocale = locale;
        this.notify();
      } catch (error) {
        console.error(`Failed to load locale ${locale}:`, error);
        throw error;
      } finally {
        this.loadingLocales.delete(locale);
      }
    } else {
      // No lazy loading, just switch (might have missing translations)
      this.currentLocale = locale;
      this.notify();
    }
  }

  /**
   * Wait for locale to finish loading
   */
  private async waitForLocale(locale: string): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (!this.loadingLocales.has(locale)) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  /**
   * Subscribe to locale changes
   */
  subscribe(listener: I18nListener): Unsubscribe {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all subscribers
   */
  private notify(): void {
    // Clear cache on locale change
    this.translationCache.clear();

    // Notify subscribers
    this.listeners.forEach(listener => {
      listener();
    });
  }

  /**
   * Get current locale messages
   */
  getMessages(): Messages[keyof Messages] {
    return this.messages[this.currentLocale];
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): string[] {
    return Object.keys(this.messages);
  }

  /**
   * Add messages for a locale
   */
  addMessages(locale: string, messages: Messages[keyof Messages]): void {
    (this.messages as any)[locale] = messages;
    this.loadedLocales.add(locale);
  }

  /**
   * Format number
   */
  n(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(value);
  }

  /**
   * Format date
   */
  d(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(value);
  }

  /**
   * Format relative time
   */
  rt(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return new Intl.RelativeTimeFormat(this.currentLocale).format(value, unit);
  }
}
