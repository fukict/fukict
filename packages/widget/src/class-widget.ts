/**
 * Widget 基类
 *
 * 提供组件生命周期、状态管理、refs、slots 等高级特性
 *
 * @fileoverview Widget 基类实现
 * @module @fukict/widget/class-widget
 */

import type { VNode } from '@fukict/runtime';
import { render } from '@fukict/runtime';

import { patchDOM } from './differ';
import { extractRefName, isDetached, type RefsMap } from './refs-manager';
import { immediateRender, scheduleRender } from './scheduler';
import { extractSlots, type SlotsMap } from './slots-extractor';
import type { DOMBatchQuery, DOMQuery, WidgetProps } from './types';

/**
 * Widget 基类
 *
 * @template TProps - Props 类型参数
 *
 * @example
 * ```tsx
 * interface MyProps {
 *   title: string;
 *   count: number;
 * }
 *
 * class MyWidget extends Widget<MyProps> {
 *   protected declare refs: {
 *     header: Header;
 *     footer: Footer;
 *   };
 *
 *   protected declare slots: {
 *     content: VNode;
 *     header?: VNode;
 *   };
 *
 *   render() {
 *     return (
 *       <div>
 *         <h1>{this.props.title}</h1>
 *         {this.slots.header}
 *         {this.slots.content}
 *       </div>
 *     );
 *   }
 * }
 * ```
 */
export class Widget<TProps extends WidgetProps = WidgetProps> {
  /**
   * 组件类型标志 - 用于 babel-plugin 自动识别
   */
  static __COMPONENT_TYPE__ = 'WIDGET_CLASS';

  // ===== Protected 字段（子类可访问）=====

  /**
   * 组件属性（只读）
   */
  protected readonly props: TProps;

  /**
   * 插槽映射
   * 子类可通过 declare 扩展类型
   */
  protected slots: SlotsMap = {};

  /**
   * 子组件引用映射
   * 子类可通过 declare 扩展类型
   */
  protected refs: RefsMap = {};

  // ===== Private 字段 =====

  /**
   * 根 DOM 元素
   */
  private root: Element | null = null;

  /**
   * 当前的 VNode 树
   */
  private vnode: VNode | null = null;

  /**
   * 是否已挂载
   */
  private _isMounted = false;

  /**
   * 构造函数
   *
   * @param initialProps - 初始属性
   */
  constructor(initialProps: TProps) {
    this.props = { ...initialProps };

    // 提取 slots（在 render() 之前）
    this.extractSlotsFromProps();
  }

  /**
   * 带生命周期处理的渲染方法
   * 自动处理 onMounted 回调
   */
  protected renderWithLifecycle(): VNode | null {
    const vnode = this.render();

    // 如果 render 返回 null，直接返回
    if (!vnode) {
      return null;
    }

    // 添加 ref 回调来处理 onMounted
    const originalRef = vnode.ref;
    vnode.ref = (element: Element | null) => {
      // 先调用原有的 ref 回调
      if (originalRef) {
        originalRef(element);
      }

      // 如果元素存在且还未挂载，调用 onMounted
      if (element && !this._isMounted) {
        this.root = element;
        this.vnode = vnode; // 设置 vnode 引用，forceUpdate 需要它
        this._isMounted = true;
        this.onMounted();
      }
    };

    return vnode;
  }

  // ===== 生命周期钩子（子类可覆盖）=====

  /**
   * 组件挂载后的生命周期钩子
   * 此时 DOM 已创建，refs 已注册
   *
   * 子类可重写此方法进行初始化操作
   */
  protected onMounted(): void {
    // 默认为空实现
  }

  /**
   * 组件卸载前的生命周期钩子
   * 此时 DOM 即将移除
   *
   * 子类可重写此方法进行清理操作
   */
  protected onUnmounting(): void {
    // 默认为空实现
  }

  /**
   * Props 更新钩子
   *
   * 默认实现：自动触发 re-render
   * 子类可重写此方法自定义更新策略
   *
   * @param oldProps - 旧 props
   * @param newProps - 新 props
   *
   * @example
   * ```tsx
   * // 模式 1：完全自动（默认）
   * // 不重写此方法
   *
   * // 模式 2：Re-render 脱围
   * protected onPropsUpdate(oldProps, newProps) {
   *   if (this.shouldRerender(oldProps, newProps)) {
   *     this.forceUpdate();
   *   } else {
   *     this.updateManually(newProps);
   *   }
   * }
   *
   * // 模式 3：完全脱围
   * // 使用 fukict:detach，父组件不会调用此方法
   * ```
   */
  protected onPropsUpdate(oldProps: TProps, newProps: TProps): void {
    // 默认实现：自动 re-render
    this.forceUpdate();
  }

  // ===== 渲染方法（子类实现）=====

  /**
   * 渲染方法
   *
   * 子类可选择性实现，返回 VNode 树
   * 默认返回 null（不渲染任何内容）
   *
   * @returns VNode 树或 null
   */
  render(): VNode | null {
    return null;
  }

  // ===== 核心方法（FINAL - 禁止覆盖）=====

  /**
   * 挂载组件到容器
   *
   * @final - 子类不得覆盖此方法
   *
   * @param container - 目标容器
   * @param immediate - 是否立即渲染，默认 false（使用调度）
   */
  async mount(container: Element, immediate = false): Promise<void> {
    if (this._isMounted) {
      console.warn('[@fukict/widget] Widget is already mounted');
      return;
    }

    const renderTask = () => {
      try {
        // 执行渲染
        const vnode = this.render();
        this.vnode = vnode;

        // 如果 vnode 不为 null，才进行渲染
        if (vnode) {
          // 渲染到 DOM
          render(vnode, { container });

          // 查找根元素（假设第一个子元素是根）
          this.root = container.firstElementChild;

          // 注册 refs
          this.registerRefsFromVNode(vnode);

          // 标记为已挂载
          this._isMounted = true;

          // 调用 onMounted 钩子
          this.onMounted();
        } else {
          // 如果没有渲染内容，直接标记为已挂载并调用 onMounted
          this._isMounted = true;
          this.onMounted();
        }
      } catch (error) {
        console.error('[@fukict/widget] Error during widget mount:', error);
        throw error;
      }
    };

    // 根据 immediate 参数选择渲染方式
    if (immediate) {
      immediateRender(renderTask);
    } else {
      return new Promise<void>((resolve, reject) => {
        scheduleRender(() => {
          try {
            renderTask();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  }

  /**
   * 卸载组件
   *
   * @final - 子类不得覆盖此方法
   */
  unmount(): void {
    if (!this._isMounted) {
      console.warn('[@fukict/widget] Widget is not mounted');
      return;
    }

    try {
      // 调用生命周期钩子
      this.onUnmounting();

      // 卸载所有子组件
      this.forEachRef((name, ref) => {
        if (typeof ref.unmount === 'function') {
          ref.unmount();
        }
      });

      // 清理 refs
      this.clearRefs();

      // 清理 DOM
      if (this.root && this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
      }

      // 重置状态
      this.root = null;
      this.vnode = null;
      this.slots = {};
      this._isMounted = false;
    } catch (error) {
      console.error('[@fukict/widget] Error during widget unmount:', error);
      throw error;
    }
  }

  // ===== 标准 API（子类可使用）=====

  /**
   * 更新组件 props
   *
   * @param newProps - 新的 props（部分更新）
   */
  update(newProps: Partial<TProps>): void {
    const oldProps = this.props;
    (this.props as any) = { ...this.props, ...newProps };

    // 重新提取 slots（如果 children 改变了）
    if ('children' in newProps) {
      this.extractSlotsFromProps();
    }

    this.onPropsUpdate(oldProps, this.props);
  }

  /**
   * 强制重新渲染
   *
   * Widget 层的 diff/patch 逻辑
   */
  protected forceUpdate(): void {
    if (!this._isMounted || !this.vnode || !this.root) {
      console.warn('[@fukict/widget] Cannot update: widget not mounted');
      return;
    }

    try {
      // 生成新的 VNode
      const newVNode = this.render();

      if (!newVNode) {
        console.warn('[@fukict/widget] render() returned null, skipping update');
        return;
      }

      // 执行 diff/patch
      patchDOM(this.vnode, newVNode, this.root);

      // 更新 vnode 引用
      this.vnode = newVNode;

      // 更新子组件（处理脱围机制）
      this.updateChildren(newVNode);
    } catch (error) {
      console.error('[@fukict/widget] Error during forceUpdate:', error);
      throw error;
    }
  }

  // ===== Refs 辅助方法 =====

  /**
   * 检查 ref 是否存在
   *
   * @param name - ref 名称
   * @returns 是否存在
   */
  protected hasRef(name: string): boolean {
    return name in this.refs;
  }

  /**
   * 删除 ref
   *
   * @param name - ref 名称
   * @returns 是否删除成功
   */
  protected deleteRef(name: string): boolean {
    if (name in this.refs) {
      delete this.refs[name];
      return true;
    }
    return false;
  }

  /**
   * 清空所有 refs
   */
  protected clearRefs(): void {
    this.refs = {};
  }

  /**
   * 遍历所有 refs
   *
   * @param callback - 回调函数
   */
  protected forEachRef(callback: (name: string, ref: Widget) => void): void {
    for (const name in this.refs) {
      callback(name, this.refs[name]);
    }
  }

  // ===== DOM 查询 API =====

  /**
   * 单个 DOM 查询
   *
   * @param selector - CSS 选择器
   * @returns 查询结果或 null
   */
  $(selector: string): DOMQuery | null {
    if (!this.root) {
      return null;
    }

    const element = this.root.querySelector(selector);
    if (!element) {
      return null;
    }

    return {
      element,
      get: (attr: string) => this.getElementAttribute(element, attr),
      set: (attr: string, value: any) =>
        this.setElementAttribute(element, attr, value),
    };
  }

  /**
   * 批量 DOM 查询
   *
   * @param selector - CSS 选择器
   * @returns 批量查询结果
   */
  $$(selector: string): DOMBatchQuery {
    if (!this.root) {
      return {
        elements: [],
        batchGet: () => [],
        batchSet: (() => {}) as any,
      };
    }

    const elements = Array.from(this.root.querySelectorAll(selector));

    return {
      elements,
      batchGet: (attr: string) =>
        elements.map(el => this.getElementAttribute(el, attr)),
      batchSet: ((attrOrAttrs: string | Record<string, any>, value?: any) => {
        if (typeof attrOrAttrs === 'string') {
          // 单属性批量设置
          elements.forEach(el =>
            this.setElementAttribute(el, attrOrAttrs, value),
          );
        } else {
          // 多属性批量设置
          const attrs = attrOrAttrs;
          elements.forEach(el => {
            Object.entries(attrs).forEach(([attr, val]) => {
              this.setElementAttribute(el, attr, val);
            });
          });
        }
      }) as DOMBatchQuery['batchSet'],
    };
  }

  // ===== Getters =====

  /**
   * 获取挂载状态
   */
  get isMounted(): boolean {
    return this._isMounted;
  }

  /**
   * 获取根 DOM 元素
   */
  get element(): Element | null {
    return this.root;
  }

  // ===== 内部辅助方法 =====

  /**
   * 从 props.children 中提取 slots
   */
  private extractSlotsFromProps(): void {
    const children = (this.props as any).children;
    this.slots = extractSlots(children);
  }

  /**
   * 从 VNode 树中注册 refs
   *
   * @param vnode - VNode 树
   */
  private registerRefsFromVNode(vnode: VNode): void {
    // 递归遍历 VNode 树
    const traverse = (node: VNode) => {
      // 检查当前节点是否有 fukict:ref
      const refName = extractRefName(node.props);
      if (refName && typeof node.type === 'function') {
        // 如果是 Widget 类组件或函数组件，且有 ref 名称
        // 注意：这里假设组件实例会通过某种方式传递
        // 实际实现可能需要配合 renderer 层的支持
        console.warn(
          '[@fukict/widget] fukict:ref detection found, but component instance registration is not yet fully implemented',
        );
      }

      // 递归遍历子节点
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
          if (child && typeof child === 'object' && 'type' in child) {
            traverse(child as VNode);
          }
        });
      }
    };

    traverse(vnode);
  }

  /**
   * 更新子组件
   *
   * 处理脱围机制
   *
   * @param vnode - 新的 VNode 树
   */
  private updateChildren(vnode: VNode): void {
    // 递归遍历 VNode 树
    const traverse = (node: VNode) => {
      // 检查是否是组件节点
      if (typeof node.type === 'function') {
        // 检查是否脱围
        const detached = isDetached(node.props);

        // 如果没有脱围，尝试更新子组件
        if (!detached) {
          // 获取 ref 名称
          const refName = extractRefName(node.props);

          // 如果有 ref 名称且 ref 存在，调用 update
          if (refName && this.hasRef(refName)) {
            const childWidget = this.refs[refName];
            if (childWidget && typeof childWidget.update === 'function') {
              // 传递新的 props 给子组件
              childWidget.update(node.props || {});
            }
          }
        }
        // 如果脱围，跳过自动更新（由子组件自己控制）
      }

      // 递归遍历子节点
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
          if (child && typeof child === 'object' && 'type' in child) {
            traverse(child as VNode);
          }
        });
      }
    };

    traverse(vnode);
  }

  /**
   * 获取元素属性的内部实现
   *
   * @param element - DOM 元素
   * @param attr - 属性名
   * @returns 属性值
   */
  private getElementAttribute(element: Element, attr: string): any {
    // 检查属性是否存在于 DOM 对象上
    if (attr in element) {
      return (element as any)[attr];
    }

    // 否则使用 getAttribute
    return element.getAttribute(attr);
  }

  /**
   * 设置元素属性的内部实现
   *
   * @param element - DOM 元素
   * @param attr - 属性名
   * @param value - 属性值
   */
  private setElementAttribute(
    element: Element,
    attr: string,
    value: any,
  ): void {
    // 检查属性是否存在于 DOM 对象上
    if (attr in element) {
      (element as any)[attr] = value;
    } else {
      // 使用 setAttribute/removeAttribute
      if (value === null || value === undefined) {
        element.removeAttribute(attr);
      } else {
        element.setAttribute(attr, String(value));
      }
    }
  }

  /**
   * 检查是否覆盖了 final 方法
   *
   * 开发环境检查，确保子类不覆盖 mount/unmount
   */
  private checkFinalMethods(): void {
    const proto = Object.getPrototypeOf(this);
    const baseProto = Widget.prototype;

    if (proto.mount !== baseProto.mount) {
      console.error(
        '[@fukict/widget] FATAL: mount() is a final method and cannot be overridden. Use onMounted() hook instead.',
      );
    }

    if (proto.unmount !== baseProto.unmount) {
      console.error(
        '[@fukict/widget] FATAL: unmount() is a final method and cannot be overridden. Use onUnmounting() hook instead.',
      );
    }
  }
}
