/**
 * 动态列表示例 - 类型定义
 */

/**
 * Todo 数据项
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  totalRenders: number;
  lastOperationTime: number;
  operationCount: number;
}
