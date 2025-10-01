/**
 * TodoList 组件统一导出
 * 按照 Fukict 分层架构最佳实践
 */

// 导出业务逻辑层
export { TodoListDomain } from './TodoList.domain';

// 导出类型定义
export type { TodoItem, TodoListProps, TodoListStats } from './TodoList.domain';

// 默认导出 UI 组件（最常用的）
export { TodoListUI as TodoList } from './TodoList.ui';
