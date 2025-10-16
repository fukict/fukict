import autoDefineFukict from './auto-define-fukict';
import displayName from './display-name';
import jsxTransform from './jsx-transform';
import type { FukictPresetOptions } from './types';

/**
 * Fukict Babel Preset
 * Zero-config preset with JSX transform and auto component wrapping
 */
function fukictPreset(_api: any, options: FukictPresetOptions = {}) {
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

// CommonJS export for Babel 7 compatibility
module.exports = fukictPreset;
// Also export as default for dual compatibility
(module.exports as { default?: typeof fukictPreset }).default = fukictPreset;
