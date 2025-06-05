import type { VNode } from '@vanilla-dom/core';

/**
 * Widget 属性类型
 */
export type WidgetProps = Record<string, any>;

/**
 * 简易函数组件实例类型
 */
export interface SimpleWidgetInstance {
  /**
   * 当前的 DOM 元素
   */
  element: Element | null;

  /**
   * 更新 props 并重新渲染
   */
  update: (newProps: WidgetProps) => void;

  /**
   * 挂载组件到指定容器
   */
  mount: (container: Element) => void;

  /**
   * 销毁组件
   */
  destroy: () => void;
}

/**
 * 简易函数组件类型
 */
export type SimpleWidgetRender<T extends WidgetProps> = (props: T) => VNode;

/**
 * 简易函数组件工厂类型
 */
export type SimpleWidgetFactory<T extends WidgetProps> = (
  renderFn: SimpleWidgetRender<T>
) => (props: T) => SimpleWidgetInstance;

/**
 * DOM 元素单个查询结果
 */
export interface DOMQuery {
  /**
   * 查询到的 DOM 元素
   */
  element: Element | null;

  /**
   * 获取元素属性
   */
  get: (attr: string) => any;

  /**
   * 设置元素属性
   */
  set: (attr: string, value: any) => void;
}

/**
 * DOM 元素批量查询结果
 */
export interface DOMBatchQuery {
  /**
   * 查询到的 DOM 元素列表
   */
  elements: Element[];

  /**
   * 批量获取属性
   */
  batchGet: (attr: string) => any[];

  /**
   * 批量设置属性（支持重载）
   */
  batchSet: {
    (attr: string, value: any): void;
    (attrs: Record<string, any>): void;
  };
}
