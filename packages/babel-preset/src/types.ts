/**
 * Babel preset options for Fukict
 */
export interface FukictPresetOptions {
  /**
   * Development mode
   * @default process.env.NODE_ENV !== 'production'
   */
  development?: boolean;

  /**
   * Enable TypeScript support
   * @default true
   */
  typescript?: boolean;
}

/**
 * Internal plugin options
 */
export interface PluginOptions {
  development: boolean;
}
