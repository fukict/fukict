import { defineConfig } from 'vite';
import * as babel from '@babel/core';

export default defineConfig({
  esbuild: {
    jsx: 'preserve',
  },
  plugins: [
    {
      name: 'fukict-babel',
      async transform(code, id) {
        if (!/\.(tsx?|jsx?)$/.test(id)) return;
        if (!/<[A-Za-z]/.test(code)) return;

        const result = await babel.transformAsync(code, {
          filename: id,
          presets: ['@fukict/babel-preset-widget'],
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
