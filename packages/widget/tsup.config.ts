import { Options, defineConfig } from 'tsup';

function createConfig(entries: string[]): Options[] {
  return entries.map(entry => ({
    entry: [entry],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: false, // 不在tsup中清理，由prebuild脚本处理
    target: 'es2020',
    minify: false,
    splitting: false,
    outDir: 'dist',
  }));
}

const config = createConfig([
  'src/index.ts',
  'src/jsx-runtime.ts',
  'src/jsx-extensions.ts',
  'src/class-widget.ts',
  'src/functional-widget.ts',
  'src/adapters.ts',
  'src/types.ts',
]);

export default defineConfig(config);
