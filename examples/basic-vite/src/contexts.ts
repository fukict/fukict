/**
 * Context definitions for the application
 *
 * This file contains shared context keys and type definitions.
 * Symbol keys are recommended for production to avoid naming collisions.
 */

// Theme context
export const THEME_CONTEXT = Symbol('theme');

export interface ThemeContext {
  mode: 'light' | 'dark';
  primaryColor: string;
  backgroundColor: string;
}

// User context
export const USER_CONTEXT = Symbol('user');

export interface UserContext {
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  email: string;
}

// Language context
export const LANGUAGE_CONTEXT = Symbol('language');

export interface LanguageContext {
  locale: string;
  direction: 'ltr' | 'rtl';
}
