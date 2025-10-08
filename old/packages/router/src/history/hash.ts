/**
 * Hash 模式历史管理
 * 使用 URL hash (#/) 实现路由，兼容性好
 *
 * @fileoverview Hash 模式历史管理实现
 * @module @fukict/router/history/hash
 */
import type { History, HistoryListener } from '../types';

/**
 * Hash 历史管理类
 */
export class HashHistory implements History {
  private listeners: Set<HistoryListener>;
  private _location: string;

  constructor() {
    this.listeners = new Set();
    this._location = this.getCurrentLocation();

    // 监听 hash 变化
    window.addEventListener('hashchange', this.onHashChange);

    // 监听 popstate（浏览器前进/后退）
    window.addEventListener('popstate', this.onHashChange);
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
    // 设置新的 hash
    window.location.hash = this.ensureHash(location);
  }

  /**
   * 替换当前位置
   */
  replace(location: string): void {
    // 构建完整 URL
    const hash = this.ensureHash(location);
    const url = window.location.href.replace(/#.*$/, '') + hash;

    // 替换当前历史记录
    window.location.replace(url);
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
    window.removeEventListener('hashchange', this.onHashChange);
    window.removeEventListener('popstate', this.onHashChange);
    this.listeners.clear();
  }

  /**
   * Hash 变化处理
   */
  private onHashChange = (): void => {
    const newLocation = this.getCurrentLocation();

    if (newLocation === this._location) {
      return;
    }

    this._location = newLocation;

    // 通知所有监听器
    this.listeners.forEach(listener => {
      listener(newLocation);
    });
  };

  /**
   * 获取当前路径（从 hash 中提取）
   */
  private getCurrentLocation(): string {
    const hash = window.location.hash;

    // 移除开头的 '#' 或 '#/'
    const path = hash.replace(/^#\/?/, '/');

    return path || '/';
  }

  /**
   * 确保路径以 '#' 开头
   */
  private ensureHash(location: string): string {
    if (location.startsWith('#')) {
      return location;
    }
    return `#${location}`;
  }
}
