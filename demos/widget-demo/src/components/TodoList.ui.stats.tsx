import type { TodoListStats } from './TodoList.domain';

export interface StatsProps {
  stats: TodoListStats;
}

export function StatsComponent(props: StatsProps) {
  return (
    <div>
      <div class="stats-item">
        <span class="stats-label">总计:</span>
        <span class="stats-value">{props.stats.total}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">已完成:</span>
        <span class="stats-value">{props.stats.completed}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">待完成:</span>
        <span class="stats-value">{props.stats.pending}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">完成率:</span>
        <span class="stats-value">
          {props.stats.completionRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
