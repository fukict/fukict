import { Fukict } from '@fukict/basic';

import { TOTAL_COUNT } from './constants';
import { StatsPanel } from './StatsDisplay';
import { TodoItemComponent } from './TodoItemComponent';
import type { PerformanceStats, Priority, TodoItem } from './types';

/**
 * 传统列表组件（用于性能对比）
 *
 * 特点：
 * - 使用 JSX 渲染子组件
 * - 每次父组件 update() 都会重新渲染所有子组件
 * - 简单但性能差
 */
export class TraditionalList extends Fukict {
  private todos: TodoItem[] = [];

  private stats: PerformanceStats = {
    title: '传统模式',
    domCount: 0,
    optCount: 0,
    optTime: 0,
  };

  private timestart = 0;

  mounted() {
    this.setup();
  }

  /** 初始化 2000 个 Todo */
  private setup() {
    window.queueMicrotask(() => {
      this.setStart();
      const priorities: Priority[] = ['high', 'medium', 'low'];
      const tagPool = [
        '前端',
        '后端',
        '设计',
        '测试',
        'Bug',
        '优化',
        '文档',
        '紧急',
      ];
      const descPool = [
        '需要重构现有实现，提升代码可维护性和扩展性',
        '与后端团队对接 API 接口，确认数据格式和错误码',
        '编写单元测试覆盖核心逻辑，目标覆盖率 80%+',
        '优化首屏加载性能，减少不必要的资源请求',
        '设计并实现响应式布局方案，适配移动端',
      ];

      this.todos = Array.from({ length: TOTAL_COUNT }, (_, i) => {
        const tagCount = (i % 3) + 1;
        const tags: string[] = [];
        for (let t = 0; t < tagCount; t++) {
          tags.push(tagPool[(i + t) % tagPool.length]);
        }
        return {
          id: `trad-${i}`,
          text: `传统模式任务 ${i}`,
          completed: false,
          createdAt: Date.now() + i,
          priority: priorities[i % 3],
          tags,
          dueDate: i % 4 === 0 ? Date.now() + ((i % 7) - 3) * 86_400_000 : null,
          description: descPool[i % descPool.length],
          progress: (i * 13) % 101,
        };
      });

      this.update();
      this.setEnd();
    });
  }

  /** 开始计时 */
  private setStart() {
    this.timestart = performance.now();
  }

  /** 结束计时 */
  private setEnd() {
    this.stats.optTime = performance.now() - this.timestart;
    this.stats.optCount++;

    this.$refs.statsDispaly.updateView({
      ...this.stats,
      domCount: this.todos.length,
    });
  }

  /** 添加任务 */
  add() {
    const id = `trad-${Date.now()}`;
    const i = this.todos.length;
    const tagPool = [
      '前端',
      '后端',
      '设计',
      '测试',
      'Bug',
      '优化',
      '文档',
      '紧急',
    ];
    const priorities: Priority[] = ['high', 'medium', 'low'];
    const tagCount = (i % 3) + 1;
    const tags: string[] = [];
    for (let t = 0; t < tagCount; t++) {
      tags.push(tagPool[(i + t) % tagPool.length]);
    }

    this.todos.push({
      id,
      text: `传统模式新任务 ${i}`,
      completed: false,
      createdAt: Date.now(),
      priority: priorities[i % 3],
      tags,
      dueDate: i % 4 === 0 ? Date.now() + 3 * 86_400_000 : null,
      description: '新创建的任务，请填写详细描述',
      progress: 0,
    });

    this.setStart();
    this.update();
    this.setEnd();
  }

  toggle = (id: string) => {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.setStart();
      this.update();
      this.setEnd();
    }
  };

  remove = (id: string) => {
    const index = this.todos.findIndex(todo => todo.id === id);
    this.todos.splice(index, 1);

    this.setStart();
    this.update();
    this.setEnd();
  };

  changePriority = (id: string, priority: Priority) => {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.priority = priority;
      this.setStart();
      this.update();
      this.setEnd();
    }
  };

  changeProgress = (id: string, progress: number) => {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.progress = progress;
      this.setStart();
      this.update();
      this.setEnd();
    }
  };

  moveUp = (id: string) => {
    const index = this.todos.findIndex(t => t.id === id);
    if (index <= 0) return;
    [this.todos[index], this.todos[index - 1]] = [
      this.todos[index - 1],
      this.todos[index],
    ];
    this.setStart();
    this.update();
    this.setEnd();
  };

  moveDown = (id: string) => {
    const index = this.todos.findIndex(t => t.id === id);
    if (index < 0 || index >= this.todos.length - 1) return;
    [this.todos[index], this.todos[index + 1]] = [
      this.todos[index + 1],
      this.todos[index],
    ];
    this.setStart();
    this.update();
    this.setEnd();
  };

  sortByDate() {
    const sorted = Array.from(this.todos.values()).sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    this.todos = sorted;

    this.setStart();
    this.update();
    this.setEnd();
  }

  render() {
    return (
      <div class="space-y-4">
        {/* 性能统计 */}
        <StatsPanel fukict:detach fukict:ref="statsDispaly" />

        {/* Todo 列表（带滚动） */}
        <div
          class="space-y-2 overflow-y-auto"
          style="max-height: 600px; border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.5rem;"
        >
          {this.todos.map(todo => (
            <TodoItemComponent
              todo={todo}
              onToggle={this.toggle}
              onDelete={this.remove}
              onPriorityChange={this.changePriority}
              onProgressChange={this.changeProgress}
              onMoveUp={this.moveUp}
              onMoveDown={this.moveDown}
            />
          ))}
        </div>

        {this.todos.length === 0 && (
          <div class="py-8 text-center text-gray-400">暂无任务</div>
        )}
      </div>
    );
  }
}
