import fukictPlugin from '@fukict/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [fukictPlugin(), tailwindcss()],
});
