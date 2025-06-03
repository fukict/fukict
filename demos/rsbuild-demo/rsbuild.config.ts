import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(jsx?|tsx?)$/,
      babelLoaderOptions: {
        plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
      },
    }),
  ],
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
});
