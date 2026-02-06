import { Fukict, dom } from '@fukict/basic';

import { TodoItemComponent } from './TodoItemComponent';
import type { PerformanceStats, TodoItem } from './types';

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
  private statsRef: HTMLDivElement | null = null;
  private todos: Map<string, TodoItem> = new Map();
  private todoInstances: Map<string, TodoItemComponent> = new Map();
  private todoPlaceholders: Map<string, Comment> = new Map();
  private stats: PerformanceStats = {
    totalRenders: 0,
    lastOperationTime: 0,
    operationCount: 0,
  };

  mounted() {
    // 初始化 1000 个 Todo（超大列表）
    for (let i = 1; i <= 1000; i++) {
      const todo: TodoItem = {
        id: `perf-${i}`,
        text: `高性能模式任务 ${i}`,
        completed: false,
        createdAt: Date.now() + i,
      };
      this.add(todo);
    }
    // 初始化后更新一次统计显示
    this.updateStatsDisplay();
  }

  beforeUnmount() {
    // 清理所有子组件实例
    this.todoInstances.forEach(instance => {
      instance.unmount();
    });
    this.todoInstances.clear();
    this.todoPlaceholders.clear();
  }

  /**
   * API: 添加 Todo 项
   * 外部组件可通过 this.$refs.listRef.add(todo) 调用
   */
  add(todo: TodoItem) {
    if (!this.containerRef) return;

    const start = performance.now();

    // 1. 创建 Comment 占位元素
    const placeholder = dom.createComment(`fukict:todo:${todo.id}`);

    // 2. 将占位元素添加到容器
    this.containerRef.appendChild(placeholder);

    // 3. 创建 TodoItemComponent 实例
    const instance = new TodoItemComponent({
      todo,
      onToggle: (id: string) => this.toggle(id),
      onDelete: (id: string) => this.remove(id),
    });

    // 4. 调用 mount 方法挂载（传入 placeholder）
    instance.mount(this.containerRef, placeholder);

    // 5. 保存数据和引用
    this.todos.set(todo.id, todo);
    this.todoInstances.set(todo.id, instance);
    this.todoPlaceholders.set(todo.id, placeholder);

    this.updateStats(start);
  }

  /**
   * API: 删除 Todo 项
   * 外部组件可通过 this.$refs.listRef.remove(id) 调用
   */
  remove(id: string) {
    const start = performance.now();

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
      this.todos.delete(id);
      this.todoInstances.delete(id);
      this.todoPlaceholders.delete(id);
    }

    this.updateStats(start);
  }

  /**
   * API: 更新 Todo 项（精确更新单个组件）
   * 外部组件可通过 this.$refs.listRef.updateItem(id, newData) 调用
   */
  updateItem(id: string, newTodo: TodoItem) {
    const start = performance.now();

    const instance = this.todoInstances.get(id);

    if (instance) {
      // 更新数据
      this.todos.set(id, newTodo);

      // 手动更新子组件（不触发父组件渲染）
      instance.updateTodo(newTodo);
    }

    this.updateStats(start);
  }

  /**
   * API: 切换完成状态
   */
  toggle(id: string) {
    const todo = this.todos.get(id);
    if (todo) {
      const newTodo = { ...todo, completed: !todo.completed };
      this.updateItem(id, newTodo);
    }
  }

  /**
   * API: 移动 Todo 项到指定位置
   * 外部组件可通过 this.$refs.listRef.move(fromId, toId) 调用
   */
  move(fromId: string, toIndex: number) {
    if (!this.containerRef) return;

    const start = performance.now();

    const placeholder = this.todoPlaceholders.get(fromId);
    const instance = this.todoInstances.get(fromId);

    if (!placeholder || !instance) return;

    // 获取所有占位元素（按 DOM 顺序）
    const allPlaceholders = Array.from(this.todoPlaceholders.values());
    const targetPlaceholder = allPlaceholders[toIndex];

    if (targetPlaceholder) {
      // 移动占位元素到目标位置之前
      this.containerRef.insertBefore(placeholder, targetPlaceholder);

      // 组件会自动跟随占位元素移动（因为组件的 DOM 挂载在占位元素之后）
      if (placeholder.nextSibling && instance._render) {
        const componentDom = this.getComponentDom(instance);
        if (componentDom) {
          this.containerRef.insertBefore(componentDom, targetPlaceholder);
        }
      }
    }

    this.updateStats(start);
  }

  /**
   * API: 排序
   */
  sort(compareFn: (a: TodoItem, b: TodoItem) => number) {
    if (!this.containerRef) return;

    const start = performance.now();

    // 获取排序后的 Todo 列表
    const sorted = Array.from(this.todos.values()).sort(compareFn);

    // 重新排列 DOM 节点
    sorted.forEach(todo => {
      const placeholder = this.todoPlaceholders.get(todo.id);
      const instance = this.todoInstances.get(todo.id);

      if (placeholder && instance) {
        // 移动占位元素到末尾
        this.containerRef!.appendChild(placeholder);

        // 移动组件 DOM 到占位元素之后
        const componentDom = this.getComponentDom(instance);
        if (componentDom && placeholder.nextSibling !== componentDom) {
          this.containerRef!.insertBefore(
            componentDom,
            placeholder.nextSibling,
          );
        }
      }
    });

    // 更新 Map 顺序
    const newTodos = new Map<string, TodoItem>();
    sorted.forEach(todo => newTodos.set(todo.id, todo));
    this.todos = newTodos;

    this.updateStats(start);
  }

  /**
   * API: 按时间排序
   */
  sortByDate() {
    this.sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * API: 获取所有 Todo 项
   */
  getAll(): TodoItem[] {
    return Array.from(this.todos.values());
  }

  /**
   * API: 获取单个 Todo 项
   */
  get(id: string): TodoItem | undefined {
    return this.todos.get(id);
  }

  /**
   * 获取组件的 DOM 节点
   * @private
   */
  private getComponentDom(instance: TodoItemComponent): Node | null {
    if (!instance._render) return null;

    const vnode = instance._render;

    // 根据 VNode 类型获取 DOM
    if ('__node__' in vnode && vnode.__node__) {
      if (Array.isArray(vnode.__node__)) {
        return vnode.__node__[0] || null;
      }
      return vnode.__node__ as Node;
    }

    return null;
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

  /**
   * 更新统计信息（直接操作 DOM，不依赖 update）
   */
  private updateStats(startTime: number) {
    this.stats.operationCount++;
    this.stats.lastOperationTime = performance.now() - startTime;
    this.updateStatsDisplay();
  }

  /**
   * 直接更新统计信息的 DOM 显示
   */
  private updateStatsDisplay() {
    if (!this.statsRef) return;

    const html = `
      <div class="font-semibold text-green-800 mb-1">
        ✅ 高性能模式性能统计
      </div>
      <div class="text-gray-600 space-y-1 text-xs">
        <div>父组件渲染次数: ${this.stats.totalRenders}</div>
        <div>子组件总渲染次数: ${this.getTotalChildRenders()}</div>
        <div>当前任务数: ${this.todos.size}</div>
        <div>操作总次数: ${this.stats.operationCount}</div>
        <div>
          上次操作耗时: ${this.stats.lastOperationTime.toFixed(2)}ms
        </div>
        <div class="text-green-600 font-medium pt-1 border-t border-green-200">
          使用手动实例化 + mount，只更新必要的组件
        </div>
      </div>
    `;

    this.statsRef.innerHTML = html;
  }

  render() {
    this.stats.totalRenders++;

    return (
      <div class="space-y-4">
        {/* 性能统计（通过 DOM 直接更新，不依赖 render） */}
        <div
          ref={el => (this.statsRef = el)}
          class="rounded border border-green-200 bg-green-50 p-3 text-sm"
        >
          {/* 统计内容由 updateStatsDisplay() 直接操作 DOM 更新 */}
        </div>

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
}
