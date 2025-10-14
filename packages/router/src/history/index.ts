import type { RouterMode } from '../types';
import { BaseHistory } from './base';
import { BrowserHistory } from './browser';
import { HashHistory } from './hash';
import type { HistoryListener, IHistory } from './types';

export { BaseHistory, HashHistory, BrowserHistory };

export type { HistoryListener, IHistory };

/**
 * 创建 History 管理器
 */
export function createHistory(
  mode: RouterMode = 'hash',
  base?: string,
): IHistory {
  if (mode === 'history') {
    return new BrowserHistory(base);
  } else {
    return new HashHistory();
  }
}
