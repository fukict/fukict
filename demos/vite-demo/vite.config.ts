import * as babel from '@babel/core';

import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsx: 'preserve',
  },
  plugins: [
    {
      name: 'vanilla-dom-babel',
      async transform(code, id) {
        if (!/\.(tsx?|jsx?)$/.test(id)) return;
        if (id.includes('node_modules')) return;

        if (!/<[A-Za-z]/.test(code)) return;

        const result = await babel.transformAsync(code, {
          filename: id,
          plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
          sourceMaps: true,
        });

        return {
          code: result?.code || code,
          map: result?.map,
        };
      },
    },
  ],
});
