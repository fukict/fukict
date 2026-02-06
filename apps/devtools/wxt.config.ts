import fukict from '@fukict/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // extensionApi: 'chrome',
  manifest: {
    name: 'Fukict DevTools',
    version: '0.1.0',
    description: 'Developer tools for Fukict applications',
    permissions: ['tabs', 'activeTab'],
    web_accessible_resources: [
      {
        resources: ['hook.js'],
        matches: ['<all_urls>'],
      },
    ],
  },
  dev: {
    // Disable server-based reload in favor of extension reload
    server: {
      port: 3020,
    },
  },
  vite: () => ({
    plugins: [tailwindcss() as any, fukict()],
    base: '/',
    build: {
      // Disable CSS code splitting to avoid dynamic imports issues
      cssCodeSplit: false,
    },
  }),
});
