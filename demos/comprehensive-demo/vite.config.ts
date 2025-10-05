import { defineConfig } from 'vite';
import * as babel from '@babel/core';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  esbuild: {
    jsx: 'preserve',
  },
  plugins: [
    tailwindcss(),
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

        if (!result) return;

        return {
          code: result.code || '',
          map: result.map,
        };
      },
    },
  ],
  server: {
    port: 5174,
    open: true,
  },
});
