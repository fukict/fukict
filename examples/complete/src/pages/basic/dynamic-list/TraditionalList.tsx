import { Fukict } from '@fukict/basic';

import { TodoItemComponent } from './TodoItemComponent';
import type { PerformanceStats, TodoItem } from './types';

/**
 * 传统列表组件（用于性能对比）
 *
 * 特点：
 * - 使用 JSX 渲染子组件
 * - 每次父组件 update() 都会重新渲染所有子组件
 * - 简单但性能差
 */
export class TraditionalList extends Fukict {
  private todos: Map<string, TodoItem> = new Map();
  private stats: PerformanceStats = {
    totalRenders: 0,
    lastOperationTime: 0,
    operationCount: 0,
  };

  mounted() {
    // 初始化 1000 个 Todo（超大列表）
    for (let i = 1; i <= 1000; i++) {
      const id = `trad-${i}`;
      this.todos.set(id, {
        id,
        text: `传统模式任务 ${i}`,
        completed: false,
        createdAt: Date.now() + i,
      });
    }
  }

  add() {
    const id = `trad-${Date.now()}`;
    this.todos.set(id, {
      id,
      text: `传统模式新任务 ${this.todos.size + 1}`,
      completed: false,
      createdAt: Date.now(),
    });

    // 统计 this.update() 的耗时（包含 JS 计算和渲染）
    this.stats.operationCount++;
    const start = performance.now();
    this.update(); // update 是同步的
    this.stats.lastOperationTime = performance.now() - start;
  }

  remove(id: string) {
    this.todos.delete(id);

    // 统计 this.update() 的耗时
    this.stats.operationCount++;
    const start = performance.now();
    this.update();
    this.stats.lastOperationTime = performance.now() - start;
  }

  toggle(id: string) {
    const todo = this.todos.get(id);
    if (todo) {
      todo.completed = !todo.completed;

      // 统计 this.update() 的耗时
      this.stats.operationCount++;
      const start = performance.now();
      this.update();
      this.stats.lastOperationTime = performance.now() - start;
    }
  }

  sortByDate() {
    const sorted = Array.from(this.todos.values()).sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    this.todos.clear();
    sorted.forEach(todo => this.todos.set(todo.id, todo));

    // 统计 this.update() 的耗时
    this.stats.operationCount++;
    const start = performance.now();
    this.update();
    this.stats.lastOperationTime = performance.now() - start;
  }

  render() {
    this.stats.totalRenders++;

    const todoArray = Array.from(this.todos.values());

    return (
      <div class="space-y-4">
        {/* 性能统计 */}
        <div class="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm">
          <div class="mb-1 font-semibold text-yellow-800">
            ⚠️ 传统模式性能统计
          </div>
          <div class="space-y-1 text-xs text-gray-600">
            <div>父组件渲染次数: {this.stats.totalRenders}</div>
            <div>当前任务数: {todoArray.length}</div>
            <div>操作总次数: {this.stats.operationCount}</div>
            <div>上次操作耗时: {this.stats.lastOperationTime.toFixed(2)}ms</div>
            <div class="border-t border-yellow-200 pt-1 font-medium text-red-600">
              每次操作都会重新渲染所有 {todoArray.length} 个子组件
            </div>
          </div>
        </div>

        {/* Todo 列表（带滚动） */}
        <div
          class="space-y-2 overflow-y-auto"
          style="max-height: 600px; border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.5rem;"
        >
          {todoArray.map(todo => (
            <TodoItemComponent
              todo={todo}
              onToggle={id => this.toggle(id)}
              onDelete={id => this.remove(id)}
            />
          ))}
        </div>

        {todoArray.length === 0 && (
          <div class="py-8 text-center text-gray-400">暂无任务</div>
        )}
      </div>
    );
  }
}
