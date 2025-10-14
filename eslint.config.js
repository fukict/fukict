import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // TypeScript DOM type interfaces (not runtime globals)
        CSSStyleDeclaration: 'readonly',
        HTMLElementEventMap: 'readonly',
        EventListener: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-empty': 'warn', // 允许空块，降级为警告
      'no-prototype-builtins': 'warn', // 降级为警告
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        // Enable type-aware linting
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Type-aware rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off', // Allow type assertions for clarity
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },

  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      '*.min.js',
      'coverage/**',
      '**/*.d.ts',
      '**/babel.config.js',
      '**/.babelrc.js',
      '**/webpack.config.js',
      '**/vite.config.ts',
      '**/*.cjs',
      'test-detector.js',
    ],
  },

  prettierConfig,
];
