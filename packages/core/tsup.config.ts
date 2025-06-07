import { Options, defineConfig } from 'tsup';

function createConfig(entries: string[]): Options[] {
  return entries.map((entry, index) => ({
    entry: [entry],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    minify: false,
    splitting: false,
    outDir: 'dist',
  }));
}

const config = createConfig([
  'src/index.ts',
  'src/component-registry.ts',
  'src/jsx-runtime.ts',
  'src/jsx-types.ts',
  'src/renderer.ts',
  'src/types.ts',
  'src/dom-utils.ts',
]);

export default defineConfig(config);
