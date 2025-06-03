import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // 主要入口点
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [],
    treeshake: false,
    minify: false,
    splitting: false,
    outDir: 'dist',
  },
  {
    // JSX 运行时入口点
    entry: ['src/jsx-runtime.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: false, // 不清理，避免覆盖第一个构建
    external: [],
    treeshake: false,
    minify: false,
    splitting: false,
    outDir: 'dist',
  },
]);
