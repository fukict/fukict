/**
 * Widget 列表管理辅助类
 *
 * 用于脱围组件内部的精细列表管理，提供高效的增删改操作
 *
 * @fileoverview Widget 列表管理工具
 * @module @fukict/widget/widget-list
 */

import type { Widget } from './class-widget';

/**
 * Widget 列表管理器
 *
 * 适用场景：
 * - 脱围组件需要手动管理子组件列表
 * - 高频更新的复杂列表
 * - 需要精确控制列表更新粒度
 *
 * @example
 * ```tsx
 * class OptimizedList extends Widget {
 *   private list = new WidgetList<TodoItem>();
 *
 *   protected onMounted() {
 *     this.list.attachTo(this.$('.list')!.element);
 *   }
 *
 *   addItem(data: TodoData) {
 *     this.list.add(new TodoItem(data));
 *   }
 * }
 * ```
 */
export class WidgetList<T extends Widget = Widget> {
  /**
   * Widget 实例数组
   */
  private items: T[] = [];

  /**
   * DOM 容器
   */
  private container: Element | null = null;

  /**
   * 绑定到 DOM 容器
   *
   * @param container - 目标容器元素
   */
  attachTo(container: Element): void {
    this.container = container;
  }

  /**
   * 添加 widget 到列表
   *
   * @param widget - Widget 实例（需要 new Widget()）
   * @param index - 可选，插入位置，默认追加到末尾
   */
  async add(widget: T, index?: number): Promise<void> {
    if (!this.container) {
      throw new Error('[@fukict/widget] WidgetList not attached to container');
    }

    // 确定插入位置
    const insertIndex = index !== undefined ? index : this.items.length;

    // 插入到数组
    this.items.splice(insertIndex, 0, widget);

    // 挂载到 DOM
    // 创建临时容器用于挂载
    const tempContainer = document.createElement('div');
    await widget.mount(tempContainer, true);

    // 获取挂载后的元素
    const element = widget.element;
    if (!element) {
      throw new Error('[@fukict/widget] Widget mount failed, no element');
    }

    // 插入到正确位置
    const referenceNode = this.container.children[insertIndex];
    if (referenceNode) {
      this.container.insertBefore(element, referenceNode);
    } else {
      this.container.appendChild(element);
    }
  }

  /**
   * 移除指定索引的 widget
   *
   * @param index - 要移除的索引
   * @returns 被移除的 widget 实例
   */
  remove(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) {
      console.warn(`[@fukict/widget] Invalid index: ${index}`);
      return undefined;
    }

    const widget = this.items[index];

    // 卸载组件
    widget.unmount();

    // 从数组中移除
    this.items.splice(index, 1);

    return widget;
  }

  /**
   * 更新指定索引的 widget
   *
   * @param index - 要更新的索引
   * @param newProps - 新的 props
   */
  update(index: number, newProps: any): void {
    if (index < 0 || index >= this.items.length) {
      console.warn(`[@fukict/widget] Invalid index: ${index}`);
      return;
    }

    const widget = this.items[index];

    // 调用 widget 的 update 方法（如果存在）
    if (typeof (widget as any).update === 'function') {
      (widget as any).update(newProps);
    } else {
      console.warn('[@fukict/widget] Widget does not have update method');
    }
  }

  /**
   * 批量移动 widgets
   *
   * @param operations - 移动操作数组
   *
   * @example
   * ```typescript
   * list.move([
   *   { from: 0, to: 2 },
   *   { from: 3, to: 1 }
   * ]);
   * ```
   */
  move(operations: Array<{ from: number; to: number }>): void {
    if (!this.container) {
      throw new Error('[@fukict/widget] WidgetList not attached to container');
    }

    // 执行移动操作
    for (const { from, to } of operations) {
      if (from < 0 || from >= this.items.length || to < 0 || to >= this.items.length) {
        console.warn(`[@fukict/widget] Invalid move operation: from=${from}, to=${to}`);
        continue;
      }

      // 移动数组中的元素
      const widget = this.items[from];
      this.items.splice(from, 1);
      this.items.splice(to, 0, widget);

      // 移动 DOM 元素
      const element = widget.element;
      if (!element) continue;

      const referenceNode = this.container.children[to];
      if (referenceNode && referenceNode !== element) {
        this.container.insertBefore(element, referenceNode);
      } else if (!referenceNode) {
        this.container.appendChild(element);
      }
    }
  }

  /**
   * 获取指定索引的 widget
   *
   * @param index - 索引
   * @returns Widget 实例
   */
  getItem(index: number): T | undefined {
    return this.items[index];
  }

  /**
   * 清空所有 widgets
   */
  clear(): void {
    // 卸载所有组件
    for (const widget of this.items) {
      widget.unmount();
    }

    // 清空数组
    this.items = [];
  }

  /**
   * 列表长度
   */
  get length(): number {
    return this.items.length;
  }
}
