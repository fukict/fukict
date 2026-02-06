/// <reference types="@types/chrome" />
/// <reference path="../.wxt/wxt.d.ts" />
/**
 * Fukict DevTools Content Script
 *
 * Bridges communication between page context (hook) and extension (background/panel).
 * Injects the hook script into the page.
 */
import { MESSAGE_SOURCE } from '~/constants';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  async main() {
    /**
     * Inject hook script into page context using WXT API
     */
    try {
      await injectScript('/hook.js', {
        keepInDom: false, // Remove script tag after injection
      });
    } catch (error) {
      // Silent fail on special pages (chrome://, chrome-extension://, etc.)
      // where script injection is not allowed
      console.warn('[Fukict DevTools] Failed to inject hook script:', error);
      return; // Exit early if injection fails
    }

    /**
     * Pending requests waiting for response from Hook
     */
    const pendingRequests = new Map<
      string,
      {
        resolve: (value: any) => void;
        reject: (error: Error) => void;
        timeout: ReturnType<typeof setTimeout>;
      }
    >();

    let requestIdCounter = 0;

    /**
     * Canvas-based highlight overlay
     */
    let highlightCanvas: HTMLCanvasElement | null = null;
    let highlightTooltip: HTMLElement | null = null;

    /**
     * Inspect picker state
     */
    let isInspecting = false;
    let lastInspectComponentId: string | null = null;

    /**
     * Show highlight overlay for component using Canvas
     */
    function showHighlight(
      bounds: { top: number; left: number; width: number; height: number },
      name?: string,
    ): void {
      console.log(
        '[Content] showHighlight called with bounds:',
        bounds,
        'name:',
        name,
      );

      removeHighlight();

      // Convert absolute coordinates to viewport coordinates
      const viewportBounds = {
        top: bounds.top - window.scrollY,
        left: bounds.left - window.scrollX,
        width: bounds.width,
        height: bounds.height,
      };

      // Clip to viewport boundaries
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const visibleLeft = Math.max(0, viewportBounds.left);
      const visibleTop = Math.max(0, viewportBounds.top);
      const visibleRight = Math.min(
        viewportWidth,
        viewportBounds.left + viewportBounds.width,
      );
      const visibleBottom = Math.min(
        viewportHeight,
        viewportBounds.top + viewportBounds.height,
      );
      const visibleWidth = visibleRight - visibleLeft;
      const visibleHeight = visibleBottom - visibleTop;

      // Skip if completely outside viewport
      if (visibleWidth <= 0 || visibleHeight <= 0) {
        console.log(
          '[Content] Component is outside viewport, skipping highlight',
        );
        return;
      }

      // Create canvas overlay
      highlightCanvas = document.createElement('canvas');
      highlightCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 2147483646;
      `;

      const dpr = window.devicePixelRatio || 1;
      highlightCanvas.width = viewportWidth * dpr;
      highlightCanvas.height = viewportHeight * dpr;

      const ctx = highlightCanvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);

      // Draw highlight rect
      ctx.fillStyle = 'rgba(111, 168, 220, 0.66)';
      ctx.fillRect(visibleLeft, visibleTop, visibleWidth, visibleHeight);

      ctx.strokeStyle = 'rgba(9, 90, 166, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(visibleLeft, visibleTop, visibleWidth, visibleHeight);

      document.body.appendChild(highlightCanvas);

      // Create tooltip with component name and dimensions
      if (name) {
        highlightTooltip = document.createElement('div');
        const w = Math.round(bounds.width);
        const h = Math.round(bounds.height);
        highlightTooltip.innerHTML = `<span style="font-weight:600">${name}</span> <span style="opacity:0.7">${w} × ${h}</span>`;
        highlightTooltip.style.cssText = `
          position: absolute;
          top: ${Math.max(0, bounds.top - 20)}px;
          left: ${bounds.left}px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 1px 5px;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          font-size: 10px;
          font-weight: 400;
          line-height: 18px;
          border-radius: 2px;
          pointer-events: none;
          z-index: 2147483647;
          white-space: nowrap;
        `;
        document.body.appendChild(highlightTooltip);
      }
    }

    /**
     * Remove highlight overlay
     */
    function removeHighlight(): void {
      if (highlightCanvas) {
        highlightCanvas.remove();
        highlightCanvas = null;
      }
      if (highlightTooltip) {
        highlightTooltip.remove();
        highlightTooltip = null;
      }
    }

    /**
     * Start inspect picker mode
     */
    function startInspect(): void {
      if (isInspecting) return;
      isInspecting = true;
      lastInspectComponentId = null;
      document.addEventListener('mousemove', handleInspectMouseMove, true);
      document.addEventListener('click', handleInspectClick, true);
      document.addEventListener('keydown', handleInspectKeyDown, true);
      // Change cursor to crosshair
      document.documentElement.style.cursor = 'crosshair';
    }

    /**
     * Stop inspect picker mode
     */
    function stopInspect(): void {
      if (!isInspecting) return;
      isInspecting = false;
      lastInspectComponentId = null;
      removeHighlight();
      document.removeEventListener('mousemove', handleInspectMouseMove, true);
      document.removeEventListener('click', handleInspectClick, true);
      document.removeEventListener('keydown', handleInspectKeyDown, true);
      document.documentElement.style.cursor = '';
    }

    /**
     * Handle mousemove during inspect mode - highlight component under cursor
     */
    function handleInspectMouseMove(e: MouseEvent): void {
      if (!isInspecting) return;
      window.postMessage(
        {
          type: 'FIND_COMPONENT_AT',
          x: e.clientX,
          y: e.clientY,
          source: MESSAGE_SOURCE.CONTENT,
        },
        '*',
      );
    }

    /**
     * Handle click during inspect mode - select component and stop
     */
    function handleInspectClick(e: MouseEvent): void {
      if (!isInspecting) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (lastInspectComponentId) {
        // Notify panel to select this component
        void browser.runtime.sendMessage({
          type: 'SELECT_COMPONENT',
          componentId: lastInspectComponentId,
          source: MESSAGE_SOURCE.CONTENT,
        });
      }

      stopInspect();
    }

    /**
     * Handle Escape key to cancel inspect mode
     */
    function handleInspectKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        stopInspect();
      }
    }

    /**
     * Set up message bridge between page and extension
     */
    function setupBridge(): void {
      // Listen for messages from page (hook)
      window.addEventListener('message', event => {
        if (event.source !== window) return;
        if (!event.data || event.data.source !== MESSAGE_SOURCE.HOOK) return;

        const message = event.data;
        console.log(
          '[Content] Received message from hook:',
          message.type,
          message,
        );

        // Handle response messages with requestId
        if (message.requestId && pendingRequests.has(message.requestId)) {
          const pending = pendingRequests.get(message.requestId)!;
          clearTimeout(pending.timeout);
          pendingRequests.delete(message.requestId);
          pending.resolve(message);
          return;
        }

        // Handle COMPONENT_BOUNDS_RESPONSE
        if (message.type === 'COMPONENT_BOUNDS_RESPONSE') {
          const { bounds, name } = message;
          if (bounds) {
            showHighlight(bounds, name);
          } else {
            removeHighlight();
          }
          return;
        }

        // Handle FIND_COMPONENT_AT_RESPONSE (inspect picker mode)
        if (message.type === 'FIND_COMPONENT_AT_RESPONSE') {
          if (!isInspecting) return;
          const { componentId, bounds, name } = message;
          lastInspectComponentId = componentId;
          if (bounds) {
            showHighlight(bounds, name);
          } else {
            removeHighlight();
          }
          return;
        }

        // Handle COMPONENT_DOM_READY - element is stored, notify panel to inspect
        if (message.type === 'COMPONENT_DOM_READY') {
          const requestId = (window as any).__FUKICT_PENDING_INSPECT_REQUEST__;
          if (requestId && pendingRequests.has(requestId)) {
            const pending = pendingRequests.get(requestId)!;
            clearTimeout(pending.timeout);
            pendingRequests.delete(requestId);
            // Resolve with success - panel will call inspect()
            pending.resolve(message);
          }
          // Forward to panel so it can call inspect()
          void browser.runtime.sendMessage({
            ...message,
            source: MESSAGE_SOURCE.CONTENT,
          });
          return;
        }

        // Forward real-time push messages to background worker
        void browser.runtime.sendMessage({
          ...message,
          source: MESSAGE_SOURCE.CONTENT,
        });
      });

      // Listen for messages from extension (background/panel)
      browser.runtime.onMessage.addListener(
        (message, _sender, sendResponse) => {
          if (message.source === MESSAGE_SOURCE.BACKGROUND) {
            // Handle data request messages
            if (
              message.type === 'GET_COMPONENT_TREE' ||
              message.type === 'GET_STORES' ||
              message.type === 'GET_ROUTER_INFO'
            ) {
              const requestId = `req-${++requestIdCounter}`;

              window.postMessage(
                {
                  ...message,
                  requestId,
                  source: MESSAGE_SOURCE.CONTENT,
                },
                '*',
              );

              const timeout = setTimeout(() => {
                pendingRequests.delete(requestId);
                sendResponse({ error: 'Request timeout' });
              }, 5000);

              pendingRequests.set(requestId, {
                resolve: (response: any) => {
                  sendResponse(response);
                },
                reject: (error: Error) => {
                  sendResponse({ error: error.message });
                },
                timeout,
              });

              return true;
            }

            if (message.type === 'START_INSPECT') {
              startInspect();
              sendResponse({ ok: true });
              return true;
            }

            if (message.type === 'STOP_INSPECT') {
              stopInspect();
              sendResponse({ ok: true });
              return true;
            }

            if (message.type === 'HIGHLIGHT_COMPONENT') {
              window.postMessage(
                {
                  type: 'GET_COMPONENT_BOUNDS',
                  componentId: message.componentId,
                  source: MESSAGE_SOURCE.CONTENT,
                },
                '*',
              );
              sendResponse({ ok: true });
              return true;
            }

            if (message.type === 'UNHIGHLIGHT_COMPONENT') {
              removeHighlight();
              sendResponse({ ok: true });
              return true;
            }

            if (message.type === 'INSPECT_DOM') {
              const requestId = `inspect-${++requestIdCounter}`;

              window.postMessage(
                {
                  type: 'GET_COMPONENT_DOM',
                  componentId: message.componentId,
                  source: MESSAGE_SOURCE.CONTENT,
                },
                '*',
              );

              const timeout = setTimeout(() => {
                pendingRequests.delete(requestId);
                sendResponse({ ok: false, error: 'Timeout waiting for DOM' });
              }, 2000);

              pendingRequests.set(requestId, {
                resolve: () => {
                  sendResponse({ ok: true });
                },
                reject: (error: Error) => {
                  sendResponse({ ok: false, error: error.message });
                },
                timeout,
              });

              // Store the requestId for COMPONENT_DOM_READY handler
              (window as any).__FUKICT_PENDING_INSPECT_REQUEST__ = requestId;

              return true;
            }
          }

          return false;
        },
      );
    }

    // Initialize bridge
    setupBridge();

    console.log('[Fukict DevTools] Content script loaded');
  },
});
