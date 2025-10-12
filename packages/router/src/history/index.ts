import type { RouterMode } from '../types';

export type { HistoryListener, IHistory } from './types';
export { BaseHistory } from './base';
export { HashHistory } from './hash';
export { BrowserHistory } from './browser';

/**
 * 创建 History 管理器
 */
export function createHistory(
  mode: RouterMode = 'hash',
  base?: string,
): import('./types').IHistory {
  if (mode === 'history') {
    const { BrowserHistory } = require('./browser');
    return new BrowserHistory(base);
  } else {
    const { HashHistory } = require('./hash');
    return new HashHistory();
  }
}
