/**
 * HTML5 History API 模式历史管理
 * 使用 History API 实现路由，URL 更美观但需要服务器配置
 *
 * @fileoverview History API 模式历史管理实现
 * @module @fukict/router/history/history
 */
import type { History, HistoryListener } from '../types';

/**
 * HTML5 History 管理类
 */
export class HTML5History implements History {
  private listeners: Set<HistoryListener>;
  private _location: string;
  private base: string;

  constructor(base: string = '') {
    this.listeners = new Set();
    this.base = this.normalizeBase(base);
    this._location = this.getCurrentLocation();

    // 监听 popstate（浏览器前进/后退）
    window.addEventListener('popstate', this.onPopState);

    // 拦截链接点击
    this.setupLinkInterceptor();
  }

  /**
   * 获取当前位置
   */
  get location(): string {
    return this._location;
  }

  /**
   * 推入新位置
   */
  push(location: string): void {
    const url = this.buildURL(location);

    // 使用 pushState 添加历史记录
    window.history.pushState({}, '', url);

    // 更新位置并通知监听器
    this.updateLocation(location);
  }

  /**
   * 替换当前位置
   */
  replace(location: string): void {
    const url = this.buildURL(location);

    // 使用 replaceState 替换当前历史记录
    window.history.replaceState({}, '', url);

    // 更新位置并通知监听器
    this.updateLocation(location);
  }

  /**
   * 前进/后退
   */
  go(delta: number): void {
    window.history.go(delta);
  }

  /**
   * 监听位置变化
   */
  listen(listener: HistoryListener): () => void {
    this.listeners.add(listener);

    // 返回取消监听函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 销毁
   */
  destroy(): void {
    window.removeEventListener('popstate', this.onPopState);
    this.listeners.clear();
  }

  /**
   * PopState 事件处理
   */
  private onPopState = (): void => {
    const newLocation = this.getCurrentLocation();
    this.updateLocation(newLocation);
  };

  /**
   * 更新位置并通知监听器
   */
  private updateLocation(location: string): void {
    if (location === this._location) {
      return;
    }

    this._location = location;

    // 通知所有监听器
    this.listeners.forEach(listener => {
      listener(location);
    });
  }

  /**
   * 获取当前路径
   */
  private getCurrentLocation(): string {
    const { pathname, search, hash } = window.location;

    // 移除 base 路径
    let path = pathname;
    if (this.base && path.startsWith(this.base)) {
      path = path.slice(this.base.length);
    }

    // 确保以 '/' 开头
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    return path + search + hash;
  }

  /**
   * 构建完整 URL
   */
  private buildURL(location: string): string {
    // 如果是完整 URL，直接返回
    if (location.startsWith('http')) {
      return location;
    }

    return this.base + location;
  }

  /**
   * 规范化 base 路径
   */
  private normalizeBase(base: string): string {
    if (!base) {
      return '';
    }

    // 确保以 '/' 开头，不以 '/' 结尾
    let normalized = base;

    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }

    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * 设置链接拦截器
   * 拦截页面内部链接点击，使用 pushState 而非页面跳转
   */
  private setupLinkInterceptor(): void {
    document.addEventListener('click', e => {
      const target = e.target as HTMLElement;

      // 查找最近的 <a> 标签
      const link = target.closest('a');

      if (!link) {
        return;
      }

      // 只处理内部链接
      if (
        link.target ||
        link.hasAttribute('download') ||
        link.rel === 'external' ||
        link.protocol !== window.location.protocol ||
        link.host !== window.location.host
      ) {
        return;
      }

      // 阻止默认跳转
      e.preventDefault();

      // 使用 pushState 导航
      const href = link.getAttribute('href');
      if (href) {
        this.push(href);
      }
    });
  }
}
