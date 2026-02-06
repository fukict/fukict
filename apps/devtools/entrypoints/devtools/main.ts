/// <reference types="@types/chrome" />
/// <reference path="../../.wxt/wxt.d.ts" />
/**
 * Fukict DevTools Entry Point
 *
 * Creates the DevTools panel when Chrome DevTools is opened.
 */

// Create the Fukict panel in DevTools
chrome.devtools.panels.create(
  'Fukict', // Panel title
  '', // Icon path (empty for now)
  'panel.html', // Panel HTML page
  panel => {
    // Panel created callback
    console.log('[Fukict DevTools] Panel created', panel);
  },
);
