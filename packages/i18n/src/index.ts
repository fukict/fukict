/**
 * @fukict/i18n
 *
 * Type-safe internationalization library for Fukict framework
 */
// Package metadata
import { METADATA } from './metadata.js';

export { METADATA };

export const VERSION = METADATA.version;

export { I18n } from './I18n';
export { createI18n } from './createI18n';
export type {
  I18nInstance,
  I18nListener,
  I18nOptions,
  KeyPath,
  TranslationKey,
  Unsubscribe,
} from './types';
