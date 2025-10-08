import { defineConfig } from 'vite';
import * as babel from '@babel/core';

export default defineConfig({
  esbuild: {
    jsx: 'preserve', // 禁用 esbuild 的 JSX 转换，让 Babel 处理
  },
  plugins: [
    {
      name: 'fukict-babel',
      async transform(code, id) {
        // 只处理 .tsx 和 .jsx 文件
        if (!/\.(tsx?|jsx?)$/.test(id)) return;

        // 检查是否包含 JSX
        if (!/<[A-Za-z]/.test(code)) return;

        const result = await babel.transformAsync(code, {
          filename: id,
          plugins: [
            '@babel/plugin-syntax-jsx',
            '@fukict/babel-plugin',
          ],
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
