import type { VNode } from '@fukict/core';

/**
 * Widget 属性类型
 */
export type WidgetProps = Record<string, any>;

/**
 * 组件类型标志
 */
export type ComponentType = 'WIDGET_CLASS' | 'WIDGET_FUNCTION';

/**
 * 可注册组件的接口
 */
export interface RegisterableComponent {
  __COMPONENT_TYPE__: ComponentType;
}

/**
 * 组件实例接口 - 所有组件都应该实现的基本方法
 */
export interface ComponentInstance {
  /**
   * 当前的 DOM 元素
   */
  element: Element | null;

  /**
   * 挂载组件到指定容器（异步，支持调度渲染）
   * @param container 目标容器
   * @param immediate 是否立即渲染，默认 false（使用调度）
   */
  mount: (container: Element, immediate?: boolean) => Promise<void>;

  /**
   * 销毁组件
   */
  destroy?: () => void;

  /**
   * 卸载组件 (兼容 Widget 类)
   */
  unmount?: () => void;
}

/**
 * 组件挂载回调类型
 */
export type ComponentMountCallback<
  T extends ComponentInstance = ComponentInstance,
> = (instance: T) => void;

/**
 * 简易函数组件实例类型
 * 继承 VNode 以支持 JSX 使用
 */
export interface WidgeFuncInstance extends ComponentInstance, VNode {
  /**
   * 更新 props 并重新渲染
   */
  update: (newProps: WidgetProps) => void;

  /**
   * 销毁组件
   */
  destroy: () => void;
}

/**
 * 简易函数组件类型
 */
export type WidgetFuncRender<T extends WidgetProps> = (props: T) => VNode;

/**
 * 简易函数组件工厂类型 - 泛型函数
 */
export type WidgetFuncFactory = <T extends WidgetProps>(
  renderFn: WidgetFuncRender<T>,
) => (props?: T) => WidgeFuncInstance;

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
