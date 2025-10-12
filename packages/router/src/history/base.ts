import type { HistoryListener, IHistory } from './types';

/**
 * History 基类（抽象公共逻辑）
 */
export abstract class BaseHistory implements IHistory {
  protected listeners: Set<HistoryListener> = new Set();
  protected isListening: boolean = false;

  /**
   * 获取当前路径（由子类实现）
   */
  abstract getCurrentPath(): string;

  /**
   * 导航到指定路径（添加历史记录）（由子类实现）
   */
  abstract push(path: string): void;

  /**
   * 替换当前路径（不添加历史记录）（由子类实现）
   */
  abstract replace(path: string): void;

  /**
   * 返回上一页
   */
  back(): void {
    window.history.back();
  }

  /**
   * 前进到下一页
   */
  forward(): void {
    window.history.forward();
  }

  /**
   * 监听路径变化
   */
  listen(listener: HistoryListener): () => void {
    this.listeners.add(listener);

    // 首次监听时启动事件监听
    if (!this.isListening) {
      this.startListening();
    }

    // 返回取消监听函数
    return () => {
      this.listeners.delete(listener);

      // 如果没有监听器了，停止事件监听
      if (this.listeners.size === 0) {
        this.stopListening();
      }
    };
  }

  /**
   * 启动事件监听（由子类实现）
   */
  protected abstract startListening(): void;

  /**
   * 停止事件监听（由子类实现）
   */
  protected abstract stopListening(): void;

  /**
   * 通知所有监听器
   */
  protected notifyListeners(): void {
    const path = this.getCurrentPath();

    for (const listener of this.listeners) {
      listener(path);
    }
  }
}
