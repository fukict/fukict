import autoDefineFukict from './auto-define-fukict.js';
import displayName from './display-name.js';
import jsxTransform from './jsx-transform.js';
import type { FukictPresetOptions } from './types.js';

/**
 * Fukict Babel Preset
 * Zero-config preset with JSX transform and auto component wrapping
 */
export default function fukictPreset(
  _api: any,
  options: FukictPresetOptions = {},
) {
  const {
    development = process.env.NODE_ENV !== 'production',
    typescript = true, // Enable TypeScript support by default
  } = options;

  const pluginOptions = {
    development,
  };

  const presets: any[] = [];
  const plugins: any[] = [
    // 0. Enable JSX syntax parsing
    '@babel/plugin-syntax-jsx',

    // 1. Auto wrap components with defineFukict (must run before JSX transform)
    [autoDefineFukict, pluginOptions],

    // 2. Transform JSX to hyperscript
    [jsxTransform, pluginOptions],

    // 3. Inject displayName in development mode
    [displayName, pluginOptions],
  ];

  // Add TypeScript support if enabled
  if (typescript) {
    presets.push([
      '@babel/preset-typescript',
      {
        // Allow JSX in .tsx files
        isTSX: true,
        // Treat all files as modules
        allExtensions: true,
      },
    ]);
  }

  return {
    presets,
    plugins,
  };
}
