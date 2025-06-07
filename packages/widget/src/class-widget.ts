import type { DOMBatchQuery, DOMQuery, WidgetProps } from './types';
import type { VNode } from '@vanilla-dom/core';
import { render } from '@vanilla-dom/core';

/**
 * 高阶 Widget 基类
 *
 * 用于单个复杂组件封装场景：
 * - 只在初始化时接收 props
 * - 后期不允许 props 变更触发重渲染
 * - 提供简洁的 DOM 查询和操作接口
 * - 手动控制渲染时机
 * - 自动支持组件注册机制
 */
export abstract class Widget<TProps extends WidgetProps = WidgetProps> {
  /**
   * 组件类型标志 - 用于 babel-plugin 自动识别
   * 所有继承自 Widget 的类都会自动获得此标志
   */
  static __COMPONENT_TYPE__ = 'WIDGET_CLASS';

  /**
   * 初始属性（只读）
   */
  protected readonly props: TProps;

  /**
   * 根 DOM 元素
   */
  protected root: Element | null = null;

  /**
   * 当前的 VNode 树
   */
  protected vnode: VNode | null = null;

  /**
   * 是否已挂载
   */
  private _isMounted = false;

  constructor(initialProps: TProps) {
    this.props = { ...initialProps };
  }

  /**
   * 抽象渲染方法，必须由子类实现
   */
  abstract render(): VNode;

  /**
   * 组件挂载后的生命周期钩子
   * 子类可重写此方法进行初始化操作
   */
  protected onMounted(): void {
    // 默认为空实现，子类可重写
  }

  /**
   * 组件卸载前的生命周期钩子
   * 子类可重写此方法进行清理操作
   */
  protected onUnmounting(): void {
    // 默认为空实现，子类可重写
  }

  /**
   * 挂载组件到指定容器
   */
  mount(container: Element): void {
    if (this._isMounted) {
      console.warn('[@vanilla-dom/widget] Widget is already mounted');
      return;
    }

    try {
      // 执行渲染
      const vnode = this.render();
      this.vnode = vnode;

      // 渲染到容器
      render(vnode, { container });
      this.root = container.firstElementChild;

      this._isMounted = true;

      // 调用生命周期钩子
      this.onMounted();
    } catch (error) {
      console.error('[@vanilla-dom/widget] Error during widget mount:', error);
      throw error;
    }
  }

  /**
   * 卸载组件
   */
  unmount(): void {
    if (!this._isMounted) {
      console.warn('[@vanilla-dom/widget] Widget is not mounted');
      return;
    }

    try {
      // 调用生命周期钩子
      this.onUnmounting();

      // 清理 DOM
      if (this.root && this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
      }

      // 重置状态
      this.root = null;
      this.vnode = null;
      this._isMounted = false;
    } catch (error) {
      console.error('[@vanilla-dom/widget] Error during widget unmount:', error);
      throw error;
    }
  }

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

  /**
   * 获取根 DOM 元素 (兼容旧 API)
   */
  getRoot(): Element {
    if (!this.root) {
      throw new Error('Widget is not mounted or root element not found');
    }
    return this.root;
  }

  /**
   * 单个 DOM 查询
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

  /**
   * 获取元素属性的内部实现
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
}
