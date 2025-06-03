import type {
  StateUpdater,
  WidgetLifecycle,
  WidgetOptions,
  WidgetProps,
  WidgetRenderFunction,
  WidgetState,
} from './types';
import { type VNode, render } from '@vanilla-dom/core';

/**
 * Widget 抽象基类
 *
 * 提供组件化开发的基础设施，包括：
 * - 生命周期管理
 * - 状态管理
 * - 自动重渲染
 * - 事件处理
 */
export abstract class Widget<
  TProps extends WidgetProps = WidgetProps,
  TState extends WidgetState = WidgetState,
> implements WidgetLifecycle
{
  /**
   * 组件属性
   */
  protected props: TProps;

  /**
   * 组件状态
   */
  protected state: TState;

  /**
   * 组件配置选项
   */
  protected options: WidgetOptions;

  /**
   * 当前渲染的 DOM 元素
   */
  protected element: Element | null = null;

  /**
   * 当前的 VNode 树
   */
  protected currentVNode: VNode | null = null;

  /**
   * 是否已挂载
   */
  protected isMounted = false;

  /**
   * 是否正在更新
   */
  protected isUpdating = false;

  constructor(
    props: TProps = {} as TProps,
    initialState: TState = {} as TState,
    options: WidgetOptions = {},
  ) {
    this.props = props;
    this.state = initialState;
    this.options = {
      autoRender: true,
      ...options,
    };
  }

  /**
   * 抽象渲染方法，必须由子类实现
   */
  abstract render(): VNode | VNode[] | string | number | null | undefined;

  /**
   * 挂载组件到指定容器
   */
  async mount(container: Element): Promise<void> {
    if (this.isMounted) {
      console.warn('Widget is already mounted');
      return;
    }

    try {
      // 执行挂载前生命周期
      await this.beforeMount?.();

      // 执行渲染
      const vnode = this.render();
      if (vnode) {
        this.currentVNode = Array.isArray(vnode) ? vnode[0] : (vnode as VNode);
        render(this.currentVNode, { container });
        this.element = container.firstElementChild;
      }

      this.isMounted = true;

      // 执行挂载后生命周期
      await this.afterMount?.();
    } catch (error) {
      console.error('Error during widget mount:', error);
      throw error;
    }
  }

  /**
   * 卸载组件
   */
  async unmount(): Promise<void> {
    if (!this.isMounted) {
      console.warn('Widget is not mounted');
      return;
    }

    try {
      // 执行卸载前生命周期
      await this.beforeUnmount?.();

      // 清理 DOM
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      // 重置状态
      this.element = null;
      this.currentVNode = null;
      this.isMounted = false;

      // 执行卸载后生命周期
      await this.afterUnmount?.();
    } catch (error) {
      console.error('Error during widget unmount:', error);
      throw error;
    }
  }

  /**
   * 更新组件状态
   */
  async setState(
    updater: Partial<TState> | StateUpdater<TState>,
  ): Promise<void> {
    if (!this.isMounted || this.isUpdating) {
      return;
    }

    const prevState = { ...this.state };
    const prevProps = { ...this.props };

    // 计算新状态
    const newState =
      typeof updater === 'function' ? updater(this.state) : updater;

    const nextState = { ...this.state, ...newState };

    // 检查是否需要更新
    if (!this.shouldUpdate(prevProps, prevState, this.props, nextState)) {
      return;
    }

    this.isUpdating = true;

    try {
      // 执行更新前生命周期
      await this.beforeUpdate?.(prevProps, prevState);

      // 更新状态
      this.state = nextState;

      // 重新渲染（如果启用自动渲染）
      if (this.options.autoRender) {
        await this.forceUpdate();
      }

      // 执行更新后生命周期
      await this.afterUpdate?.(prevProps, prevState);
    } catch (error) {
      console.error('Error during widget update:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 更新组件属性
   */
  async setProps(newProps: Partial<TProps>): Promise<void> {
    const prevProps = { ...this.props };
    const prevState = { ...this.state };
    const nextProps = { ...this.props, ...newProps };

    // 检查是否需要更新
    if (!this.shouldUpdate(prevProps, prevState, nextProps, this.state)) {
      return;
    }

    this.isUpdating = true;

    try {
      // 执行更新前生命周期
      await this.beforeUpdate?.(prevProps, prevState);

      // 更新属性
      this.props = nextProps;

      // 重新渲染（如果启用自动渲染）
      if (this.options.autoRender) {
        await this.forceUpdate();
      }

      // 执行更新后生命周期
      await this.afterUpdate?.(prevProps, prevState);
    } catch (error) {
      console.error('Error during widget props update:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 强制重新渲染
   */
  async forceUpdate(): Promise<void> {
    if (!this.isMounted || !this.element?.parentNode) {
      return;
    }

    try {
      const vnode = this.render();
      if (vnode) {
        const newVNode = Array.isArray(vnode) ? vnode[0] : (vnode as VNode);

        // 这里应该使用 core 包的 updateDOM 方法进行精确更新
        // 暂时使用简单的重新渲染
        const container = this.element.parentNode as Element;
        if (this.element) {
          container.removeChild(this.element);
        }

        render(newVNode, { container });
        this.element = container.firstElementChild;
        this.currentVNode = newVNode;
      }
    } catch (error) {
      console.error('Error during force update:', error);
      throw error;
    }
  }

  /**
   * 判断是否需要更新
   */
  protected shouldUpdate(
    prevProps: TProps,
    prevState: TState,
    nextProps: TProps,
    nextState: TState,
  ): boolean {
    // 如果有自定义的 shouldUpdate 函数，使用它
    if (this.options.shouldUpdate) {
      return this.options.shouldUpdate(
        prevProps,
        prevState,
        nextProps,
        nextState,
      );
    }

    // 简单的浅比较
    return (
      !this.shallowEqual(prevProps, nextProps) ||
      !this.shallowEqual(prevState, nextState)
    );
  }

  /**
   * 浅比较两个对象
   */
  protected shallowEqual(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }

  // 生命周期钩子的默认实现（可选重写）
  beforeMount?(): void | Promise<void>;
  afterMount?(): void | Promise<void>;
  beforeUpdate?(prevProps: TProps, prevState: TState): void | Promise<void>;
  afterUpdate?(prevProps: TProps, prevState: TState): void | Promise<void>;
  beforeUnmount?(): void | Promise<void>;
  afterUnmount?(): void | Promise<void>;
}
