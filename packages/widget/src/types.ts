import type { VNode } from '@vanilla-dom/core';

/**
 * Widget 状态类型
 */
export type WidgetState = Record<string, any>;

/**
 * Widget 属性类型
 */
export type WidgetProps = Record<string, any>;

/**
 * Widget 生命周期钩子函数类型
 */
export interface WidgetLifecycle {
  /**
   * 组件挂载前调用
   */
  beforeMount?(): void | Promise<void>;

  /**
   * 组件挂载后调用
   */
  afterMount?(): void | Promise<void>;

  /**
   * 组件更新前调用
   */
  beforeUpdate?(
    prevProps: WidgetProps,
    prevState: WidgetState,
  ): void | Promise<void>;

  /**
   * 组件更新后调用
   */
  afterUpdate?(
    prevProps: WidgetProps,
    prevState: WidgetState,
  ): void | Promise<void>;

  /**
   * 组件卸载前调用
   */
  beforeUnmount?(): void | Promise<void>;

  /**
   * 组件卸载后调用
   */
  afterUnmount?(): void | Promise<void>;
}

/**
 * Widget 渲染函数类型
 */
export type WidgetRenderFunction = () =>
  | VNode
  | VNode[]
  | string
  | number
  | null
  | undefined;

/**
 * Widget 状态更新函数类型
 */
export type StateUpdater<T extends WidgetState> = (
  prevState: T,
) => Partial<T> | T;

/**
 * Widget 配置选项
 */
export interface WidgetOptions {
  /**
   * 是否自动重渲染（当状态变化时）
   * @default true
   */
  autoRender?: boolean;

  /**
   * 自定义状态比较函数
   */
  shouldUpdate?(
    prevProps: WidgetProps,
    prevState: WidgetState,
    nextProps: WidgetProps,
    nextState: WidgetState,
  ): boolean;
}
