import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // 同时支持 CommonJS 和 ES modules
  dts: false, // 跳过类型定义文件生成
  sourcemap: false,
  clean: true,
  target: 'node16',
  minify: false,
  splitting: false,
  outDir: 'dist',
  external: [
    '@babel/core',
    '@babel/preset-typescript',
    '@babel/plugin-syntax-jsx',
    '@vanilla-dom/babel-plugin',
  ],
});
