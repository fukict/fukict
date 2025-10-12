import { BaseHistory } from './base';

/**
 * Hash 模式的 History 管理器
 */
export class HashHistory extends BaseHistory {
  constructor() {
    super();
    // 确保初始有 hash
    if (!window.location.hash) {
      window.location.hash = '#/';
    }
  }

  getCurrentPath(): string {
    // 获取 hash 部分（去掉 #）
    const hash = window.location.hash.slice(1);
    return hash || '/';
  }

  push(path: string): void {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    window.location.hash = path;

    // 手动触发监听器（因为 Link 调用了 e.preventDefault()）
    // window.location.hash 的赋值会触发 hashchange 事件
    // 但为了确保在所有情况下都能正常工作，这里也手动通知
    // hashchange 事件会再次触发，但 notifyListeners 是幂等的，不会有问题
    this.notifyListeners();
  }

  replace(path: string): void {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    const url = new URL(window.location.href);
    url.hash = path;
    window.history.replaceState(null, '', url.toString());

    // 手动触发监听器
    this.notifyListeners();
  }

  protected startListening(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    this.isListening = true;
  }

  protected stopListening(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
    this.isListening = false;
  }

  private handleHashChange = (): void => {
    this.notifyListeners();
  };
}
