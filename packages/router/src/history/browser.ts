import { BaseHistory } from './base';

/**
 * History 模式的 History 管理器
 */
export class BrowserHistory extends BaseHistory {
  private base: string;

  constructor(base: string = '/') {
    super();
    this.base = this.normalizeBase(base);
  }

  private normalizeBase(base: string): string {
    // 确保 base 以 / 开头但不以 / 结尾（除非是根路径）
    if (!base.startsWith('/')) {
      base = '/' + base;
    }

    if (base.length > 1 && base.endsWith('/')) {
      base = base.slice(0, -1);
    }

    return base;
  }

  getCurrentPath(): string {
    // 获取完整路径（pathname + search + hash）
    let path = window.location.pathname;

    // 移除 base 前缀
    if (this.base !== '/' && path.startsWith(this.base)) {
      path = path.slice(this.base.length);
    }

    // 确保以 / 开头
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // 添加 search 和 hash
    if (window.location.search) {
      path += window.location.search;
    }

    if (window.location.hash) {
      path += window.location.hash;
    }

    return path;
  }

  push(path: string): void {
    const fullPath = this.getFullPath(path);
    window.history.pushState(null, '', fullPath);

    // 手动触发监听器
    this.notifyListeners();
  }

  replace(path: string): void {
    const fullPath = this.getFullPath(path);
    window.history.replaceState(null, '', fullPath);

    // 手动触发监听器
    this.notifyListeners();
  }

  protected startListening(): void {
    window.addEventListener('popstate', this.handlePopState);
    this.isListening = true;
  }

  protected stopListening(): void {
    window.removeEventListener('popstate', this.handlePopState);
    this.isListening = false;
  }

  private handlePopState = (): void => {
    this.notifyListeners();
  };

  private getFullPath(path: string): string {
    // 确保路径以 / 开头
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // 添加 base 前缀
    if (this.base !== '/') {
      path = this.base + path;
    }

    return path;
  }
}
