/**
 * 动态列表示例 - 类型定义
 */

/**
 * 优先级
 */
export type Priority = 'high' | 'medium' | 'low';

/**
 * Todo 数据项
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  tags: string[];
  dueDate: number | null;
  description: string;
  progress: number;
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  title: string;
  domCount: number;
  optCount: number;
  optTime: number;
}
