/// <reference types="@types/chrome" />
/// <reference path="../.wxt/wxt.d.ts" />
/**
 * Fukict DevTools Background Worker (Service Worker)
 *
 * Relays messages between content scripts and DevTools panels.
 * Maintains connection state for each tab.
 */
import { MESSAGE_SOURCE } from '~/constants';

export default defineBackground(() => {
  // Track which tabs have DevTools panel open
  const connectedPanels = new Map<number, chrome.runtime.Port>();

  // Track which tabs have Fukict detected
  const fukictTabs = new Set<number>();

  /**
   * Handle connections from DevTools panel
   */
  chrome.runtime.onConnect.addListener(port => {
    if (port.name !== 'fukict-devtools-panel') return;

    console.log('[Fukict DevTools] Panel connected');

    let tabId: number | undefined;

    port.onMessage.addListener(message => {
      console.log(
        '[Fukict DevTools] Message from panel via port:',
        message.type,
      );

      if (message.type === 'PANEL_INIT') {
        tabId = message.tabId;
        if (tabId !== undefined) {
          connectedPanels.set(tabId, port);
          console.log(`[Fukict DevTools] Panel registered for tab ${tabId}`);

          // Check if Fukict is already detected on this tab
          if (fukictTabs.has(tabId)) {
            console.log(
              `[Fukict DevTools] Fukict already detected on tab ${tabId}`,
            );
            port.postMessage({ type: 'FUKICT_DETECTED' });
          }
        }
        return;
      }

      // Forward other messages from panel to content script
      if (tabId !== undefined) {
        void chrome.tabs.sendMessage(tabId, {
          ...message,
          source: MESSAGE_SOURCE.BACKGROUND,
        });
      }
    });

    port.onDisconnect.addListener(() => {
      if (tabId !== undefined) {
        connectedPanels.delete(tabId);
      }
    });
  });

  /**
   * Handle messages from content scripts and panel
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle messages from content scripts
    if (message.source === MESSAGE_SOURCE.CONTENT) {
      const tabId = sender.tab?.id;
      if (tabId === undefined) return false;

      console.log(
        `[Fukict DevTools] Message from content script (tab ${tabId}):`,
        message.type,
      );

      // Track Fukict detection
      if (message.type === 'HOOK_READY' || message.type === 'FUKICT_DETECTED') {
        fukictTabs.add(tabId);
        console.log(`[Fukict DevTools] Fukict detected on tab ${tabId}`);
      }

      // Forward to connected panel
      const panel = connectedPanels.get(tabId);
      if (panel) {
        // Send FUKICT_DETECTED on first hook ready
        if (message.type === 'HOOK_READY') {
          console.log(`[Fukict DevTools] Sending FUKICT_DETECTED to panel`);
          panel.postMessage({ type: 'FUKICT_DETECTED' });
        }

        // Forward all messages to panel
        console.log(
          `[Fukict DevTools] Forwarding message to panel:`,
          message.type,
        );
        panel.postMessage({
          ...message,
          tabId,
        });
      } else {
        console.log(`[Fukict DevTools] No panel connected for tab ${tabId}`);
      }

      return false;
    }

    // Handle data request messages from panel
    if (
      message.type === 'GET_COMPONENT_TREE' ||
      message.type === 'GET_STORES' ||
      message.type === 'GET_ROUTER_INFO'
    ) {
      console.log(
        `[Fukict DevTools] Panel requesting ${message.type} for tab ${sender.tab?.id || chrome.devtools?.inspectedWindow?.tabId || 'unknown'}`,
      );

      const targetTabId = message.tabId || sender.tab?.id;

      if (targetTabId === undefined) {
        console.error('[Fukict DevTools] Cannot determine target tab ID');
        sendResponse({ error: 'No tab ID' });
        return false;
      }

      // Forward to content script and return response
      chrome.tabs
        .sendMessage(targetTabId, {
          ...message,
          source: MESSAGE_SOURCE.BACKGROUND,
        })
        .then(response => {
          console.log(
            `[Fukict DevTools] Got response for ${message.type}:`,
            response,
          );
          sendResponse(response);
        })
        .catch(error => {
          console.error(
            `[Fukict DevTools] Error getting ${message.type}:`,
            error,
          );
          sendResponse({ error: error.message });
        });

      return true; // Will respond asynchronously
    }

    // Handle highlight/unhighlight and inspect mode messages from panel
    if (
      message.type === 'HIGHLIGHT_COMPONENT' ||
      message.type === 'UNHIGHLIGHT_COMPONENT' ||
      message.type === 'START_INSPECT' ||
      message.type === 'STOP_INSPECT'
    ) {
      // Find which tab this panel is inspecting
      let targetTabId: number | undefined;

      for (const [tabId] of connectedPanels.entries()) {
        targetTabId = tabId;
        break;
      }

      if (targetTabId === undefined) {
        console.warn(
          '[Fukict DevTools] No connected panel found for highlight',
        );
        return false;
      }

      console.log(
        `[Fukict DevTools] Forwarding ${message.type} to tab ${targetTabId}`,
      );

      // Forward to content script
      void chrome.tabs.sendMessage(targetTabId, {
        ...message,
        source: MESSAGE_SOURCE.BACKGROUND,
      });

      return false;
    }

    // Handle INSPECT_DOM message from panel
    if (message.type === 'INSPECT_DOM') {
      let targetTabId: number | undefined;

      for (const [tabId] of connectedPanels.entries()) {
        targetTabId = tabId;
        break;
      }

      if (targetTabId === undefined) {
        console.warn('[Fukict DevTools] No connected panel found for inspect');
        sendResponse({ ok: false, error: 'No panel found' });
        return false;
      }

      console.log(
        `[Fukict DevTools] Forwarding INSPECT_DOM to tab ${targetTabId}`,
      );

      // Forward to content script
      chrome.tabs
        .sendMessage(targetTabId, {
          ...message,
          source: MESSAGE_SOURCE.BACKGROUND,
        })
        .then(response => {
          sendResponse(response);
        })
        .catch(error => {
          console.error('[Fukict DevTools] Error inspecting DOM:', error);
          sendResponse({ ok: false, error: error.message });
        });

      return true; // Async response
    }

    return false;
  });

  /**
   * Clean up when tab is closed
   */
  chrome.tabs.onRemoved.addListener(tabId => {
    connectedPanels.delete(tabId);
    fukictTabs.delete(tabId);
  });

  /**
   * Clean up when tab navigates
   */
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
      // Page is navigating, Fukict detection will be re-established
      fukictTabs.delete(tabId);
    }
  });

  console.log('[Fukict DevTools] Background worker started');
});
