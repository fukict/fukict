import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import fukictPlugin from '@fukict/vite-plugin';

export default defineConfig({
  plugins: [fukictPlugin(), tailwindcss()],
});
