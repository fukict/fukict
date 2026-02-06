/**
 * Fukict DevTools Panel Entry Point
 */
import { attach } from '@fukict/basic';

import App from './App.js';

import '~/assets/main.css';

const container = document.getElementById('app');

if (container) {
  attach(<App />, container);
  console.log('[Fukict DevTools] Panel mounted');
} else {
  console.error('[Fukict DevTools] Container #app not found');
}
