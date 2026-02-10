import { Fukict } from '@fukict/basic';
import { PerformanceStats } from './types';

export class StatsPanel extends Fukict {
  stats: PerformanceStats = {
    title: '',
    domCount: 0,
    optCount: 0,
    optTime: 0,
  };

  updateView(stats: Partial<PerformanceStats>) {
    this.stats = Object.assign(this.stats, stats) as PerformanceStats; // Object.assign(stats);

    this.update();
  }

  render() {
    return (
      <div class="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm">
        <div class="mb-1 font-semibold text-yellow-800">{this.stats.title}</div>
        <div class="space-y-1 text-xs text-gray-600">
          <div>操作次数: {this.stats.optCount}</div>
          <div>dom 数量: {this.stats.domCount}</div>
          <div>操作耗时: {this.stats.optTime.toFixed(2)}ms</div>
        </div>
      </div>
    );
  }
}
