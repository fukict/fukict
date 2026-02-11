import { Fukict, dom } from '@fukict/basic';

import { TOTAL_COUNT } from './constants';
import { StatsPanel } from './StatsDisplay';
import { TodoItemComponent } from './TodoItemComponent';
import type { PerformanceStats, Priority, TodoItem } from './types';

/**
 * 高性能列表组件
 *
 * 核心特性：
 * 1. 手动创建 Comment 占位元素
 * 2. 通过 new TodoItemComponent(props) 直接实例化子组件
 * 3. 调用 instance.mount(container, placeholder) 手动挂载
 * 4. 暴露 APIs 给外部组件调用（增/删/改/查/移动）
 */
export class HighPerformanceList extends Fukict {
  private containerRef: HTMLDivElement | null = null;
  private todos: TodoItem[] = [];
  private todoInstances: Map<string, TodoItemComponent> = new Map();
  private todoPlaceholders: Map<string, Comment> = new Map();

  private stats: PerformanceStats = {
    title: '高性能模式',
    domCount: 0,
    optCount: 0,
    optTime: 0,
  };

  private timestart = 0;

  mounted() {
    this.setup();
  }

  beforeUnmount() {
    // 清理所有子组件实例
    this.todoInstances.forEach(instance => {
      instance.unmount();
    });
    this.todoInstances.clear();
    this.todoPlaceholders.clear();
  }

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

      for (let i = 1; i <= TOTAL_COUNT; i++) {
        const tagCount = (i % 3) + 1;
        const tags: string[] = [];
        for (let t = 0; t < tagCount; t++) {
          tags.push(tagPool[(i + t) % tagPool.length]);
        }

        const todo: TodoItem = {
          id: `perf-${i}`,
          text: `高性能模式任务 ${i}`,
          completed: false,
          createdAt: Date.now() + i,
          priority: priorities[i % 3],
          tags,
          dueDate: i % 4 === 0 ? Date.now() + ((i % 7) - 3) * 86_400_000 : null,
          description: descPool[i % descPool.length],
          progress: (i * 13) % 101,
        };
        this.add(todo);
      }
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

  /**
   * API: 添加 Todo 项
   * 外部组件可通过 this.$refs.listRef.add(todo) 调用
   */
  private add(todo: TodoItem) {
    if (!this.containerRef) return;

    // 1. 创建 Comment 占位元素
    const placeholder = dom.createComment(`fukict:todo:${todo.id}`);

    // 2. 将占位元素添加到容器
    this.containerRef.appendChild(placeholder);

    // 3. 创建 TodoItemComponent 实例
    const instance = new TodoItemComponent({
      todo,
      onToggle: (id: string) => this.toggle(id),
      onDelete: (id: string) => this.remove(id),
      onPriorityChange: (id: string, priority: Priority) =>
        this.changePriority(id, priority),
      onProgressChange: (id: string, progress: number) =>
        this.changeProgress(id, progress),
      onMoveUp: (id: string) => this.moveUp(id),
      onMoveDown: (id: string) => this.moveDown(id),
    });

    // 4. 调用 mount 方法挂载（传入 placeholder）
    instance.mount(this.containerRef, placeholder);

    // 5. 保存数据和引用
    this.todos.push(todo);
    this.todoInstances.set(todo.id, instance);
    this.todoPlaceholders.set(todo.id, placeholder);
  }

  /**
   * API: 删除 Todo 项
   * 外部组件可通过 this.$refs.listRef.remove(id) 调用
   */
  private remove(id: string) {
    this.setStart();

    const instance = this.todoInstances.get(id);
    const placeholder = this.todoPlaceholders.get(id);

    if (instance && placeholder) {
      // 卸载组件
      instance.unmount();

      // 从 DOM 中移除占位元素
      if (placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }

      // 清理引用
      const todoIndex = this.todos.findIndex(todo => todo.id === id);
      this.todos.splice(todoIndex, 1);
      this.todoInstances.delete(id);
      this.todoPlaceholders.delete(id);
    }

    this.setEnd();
  }

  /**
   * API: 更新 Todo 项（精确更新单个组件）
   * 外部组件可通过 this.$refs.listRef.updateItem(id, newData) 调用
   */
  private updateItem(id: string, newTodo: TodoItem) {
    this.setStart();

    const instance = this.todoInstances.get(id);

    if (instance) {
      // 更新数据
      const todoIndex = this.todos.findIndex(todo => todo.id === id);

      if (todoIndex >= 0) {
        this.todos[todoIndex] = { ...newTodo };
      }

      // 手动更新子组件（不触发父组件渲染）
      instance.updateTodo(newTodo);
    }

    this.setEnd();
  }

  /**
   * API: 切换完成状态
   */
  private toggle(id: string) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      const newTodo = { ...todo, completed: !todo.completed };
      this.updateItem(id, newTodo);
    }
  }

  /**
   * API: 切换优先级
   */
  private changePriority(id: string, priority: Priority) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      this.updateItem(id, { ...todo, priority });
    }
  }

  /**
   * API: 更新进度
   */
  private changeProgress(id: string, progress: number) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      this.updateItem(id, { ...todo, progress });
    }
  }

  /**
   * API: 上移
   *
   * 把当前元素插到上方元素之前，不触发任何组件重渲染
   */
  private moveUp(id: string) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index <= 0 || !this.containerRef) return;

    const elCurrent = this.todoInstances
      .get(this.todos[index].id)
      ?.getElement();
    const elAbove = this.todoInstances
      .get(this.todos[index - 1].id)
      ?.getElement();
    if (!elCurrent || !elAbove) return;

    this.setStart();
    this.containerRef.insertBefore(elCurrent, elAbove);
    [this.todos[index], this.todos[index - 1]] = [
      this.todos[index - 1],
      this.todos[index],
    ];
    this.setEnd();
  }

  /**
   * API: 下移
   *
   * 把下方元素插到当前元素之前，不触发任何组件重渲染
   */
  private moveDown(id: string) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index < 0 || index >= this.todos.length - 1 || !this.containerRef)
      return;

    const elCurrent = this.todoInstances
      .get(this.todos[index].id)
      ?.getElement();
    const elBelow = this.todoInstances
      .get(this.todos[index + 1].id)
      ?.getElement();
    if (!elCurrent || !elBelow) return;

    this.setStart();
    this.containerRef.insertBefore(elBelow, elCurrent);
    [this.todos[index], this.todos[index + 1]] = [
      this.todos[index + 1],
      this.todos[index],
    ];
    this.setEnd();
  }

  /**
   * API: 排序
   *
   * 通过 instance.getElement() 获取真实 DOM，
   * 使用 DocumentFragment 批量移动，只触发 1 次 reflow
   */
  private sort(compareFn: (a: TodoItem, b: TodoItem) => number) {
    if (!this.containerRef) return;

    const sorted = [...this.todos].sort(compareFn);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < sorted.length; i++) {
      const el = this.todoInstances.get(sorted[i].id)?.getElement();
      if (el) {
        fragment.appendChild(el);
      }
    }

    this.containerRef.appendChild(fragment);
    this.todos = sorted;
  }

  /**
   * 获取所有子组件的总渲染次数
   */
  getTotalChildRenders() {
    let total = 0;
    this.todoInstances.forEach(instance => {
      if (typeof instance.getRenderCount === 'function') {
        total += instance.getRenderCount();
      }
    });
    return total;
  }

  render() {
    return (
      <div class="space-y-4">
        {/* 性能统计 */}
        <StatsPanel fukict:detach fukict:ref="statsDispaly" />

        {/* Todo 容器（带滚动，子组件通过 add() API 手动添加） */}
        <div
          ref={el => (this.containerRef = el)}
          class="space-y-2 overflow-y-auto"
          style="max-height: 600px; border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 0.5rem;"
        >
          {/* 子组件通过 new TodoItemComponent() + mount() 手动添加 */}
          {/* 注意：render 只执行一次，后续所有操作都是纯手动 DOM 操作 */}
        </div>
      </div>
    );
  }

  // ================= 暴露 API =================

  /**
   * API: 按时间排序
   */
  public sortByDate() {
    this.setStart();
    this.sort((a, b) => a.createdAt - b.createdAt);
    this.setEnd();
  }

  /**
   * API: 添加 Todo 项
   */
  public addItem(todo: TodoItem) {
    this.setStart();
    this.add(todo);
    this.setEnd();
  }

  /**
   * API: 获取所有 Todo 项
   */
  getAll(): TodoItem[] {
    return this.todos;
  }
}
