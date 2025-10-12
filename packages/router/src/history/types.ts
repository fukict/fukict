/**
 * History 监听器类型
 */
export type HistoryListener = (path: string) => void;

/**
 * History 管理器接口
 */
export interface IHistory {
  /**
   * 获取当前路径
   */
  getCurrentPath(): string;

  /**
   * 导航到指定路径（添加历史记录）
   */
  push(path: string): void;

  /**
   * 替换当前路径（不添加历史记录）
   */
  replace(path: string): void;

  /**
   * 返回上一页
   */
  back(): void;

  /**
   * 前进到下一页
   */
  forward(): void;

  /**
   * 监听路径变化
   */
  listen(listener: HistoryListener): () => void;
}
