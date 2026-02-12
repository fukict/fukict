import fukictPlugin from '@fukict/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import { viteMockPlugin } from './vite-mock-plugin';

export default defineConfig({
  plugins: [fukictPlugin(), tailwindcss(), viteMockPlugin()],
});
