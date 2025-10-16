/**
 * @fukict/vite-plugin
 *
 * Vite plugin for Fukict framework
 */
import { transformSync } from '@babel/core';

import type { Plugin } from 'vite';

/**
 * Plugin options
 */
export interface FukictPluginOptions {
  /**
   * Include patterns (minimatch)
   * @default [/\.[jt]sx$/]
   */
  include?: RegExp | RegExp[];

  /**
   * Exclude patterns (minimatch)
   * @default [/node_modules/]
   */
  exclude?: RegExp | RegExp[];

  /**
   * Babel preset options
   */
  babel?: {
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
  };
}

/**
 * Default include patterns
 */
const DEFAULT_INCLUDE = /\.[jt]sx$/;

/**
 * Default exclude patterns
 */
const DEFAULT_EXCLUDE = /node_modules/;

/**
 * Check if file matches pattern
 */
function matchPattern(
  id: string,
  patterns: RegExp | RegExp[] | undefined,
  defaultPattern: RegExp,
): boolean {
  if (!patterns) {
    return defaultPattern.test(id);
  }

  const patternList = Array.isArray(patterns) ? patterns : [patterns];
  return patternList.some(pattern => pattern.test(id));
}

/**
 * Fukict Vite Plugin
 *
 * Transforms JSX and TypeScript using @fukict/babel-preset
 *
 * @example
 * ```ts
 * import { defineConfig } from 'vite';
 * import fukict from '@fukict/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [fukict()],
 * });
 * ```
 */
export default function fukict(options: FukictPluginOptions = {}): Plugin {
  const {
    include = DEFAULT_INCLUDE,
    exclude = DEFAULT_EXCLUDE,
    babel = {},
  } = options;

  const {
    development = process.env.NODE_ENV !== 'production',
    typescript = true,
  } = babel;

  return {
    name: '@fukict/vite-plugin',
    enforce: 'pre',

    transform(code, id) {
      // Check exclude patterns first
      if (matchPattern(id, exclude, DEFAULT_EXCLUDE)) {
        return null;
      }

      // Check include patterns
      if (!matchPattern(id, include, DEFAULT_INCLUDE)) {
        return null;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const result = transformSync(code, {
          presets: [
            [
              '@fukict/babel-preset',
              {
                development,
                typescript,
              },
            ],
          ],
          filename: id,
          sourceMaps: true,
          configFile: false,
          babelrc: false,
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!result || !result.code) {
          return null;
        }

        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          code: result.code,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          map: result.map,
        };
      } catch (error: unknown) {
        console.error(`[fukict] Transform error in ${id}:`);
        console.error(error);
        this.error({
          message: `Failed to transform ${id}: ${error instanceof Error ? error.message : String(error)}`,
          cause: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },

    config() {
      return {
        esbuild: {
          // Disable esbuild's JSX transform
          jsx: 'preserve',
        },
      };
    },
  };
}
