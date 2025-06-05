import type { VNode, ComponentFunction } from '@vanilla-dom/core';
import type { WidgetProps } from './types';
import { Widget } from './widget';
import { createWidget } from './simple';

/**
 * 将高阶基类 Widget 转换为函数组件
 */
export function widgetToComponent<TProps extends WidgetProps>(
  WidgetClass: new (props: TProps) => Widget<TProps>
): ComponentFunction {
  return (props: TProps): VNode => {
    const widget = new WidgetClass(props);
    return widget.render();
  };
}

/**
 * 将简易函数组件转换为标准组件函数
 */
export function createComponent<TProps extends WidgetProps>(
  renderFn: (props: TProps) => VNode
): ComponentFunction {
  return renderFn;
}

/**
 * 混合模式：在简易函数组件中嵌入高阶基类
 */
export function embedWidget<TProps extends WidgetProps>(
  WidgetClass: new (props: TProps) => Widget<TProps>,
  props: TProps
): VNode {
  const widget = new WidgetClass(props);
  return widget.render();
}

/**
 * 批量创建组件的工厂函数
 */
export function createComponentFactory<TProps extends WidgetProps>() {
  return {
    /**
     * 创建简易函数组件
     */
    simple: (renderFn: (props: TProps) => VNode) => createWidget(renderFn),
    
    /**
     * 创建高阶基类组件
     */
    advanced: <T extends Widget<TProps>>(WidgetClass: new (props: TProps) => T) => WidgetClass,
    
    /**
     * 创建标准组件函数
     */
    component: (renderFn: (props: TProps) => VNode) => renderFn as ComponentFunction,
  };
}

/**
 * 组件类型检查工具
 */
export const is = {
  /**
   * 检查是否为简易函数组件实例
   */
  simpleWidget: (obj: any): obj is ReturnType<ReturnType<typeof createWidget>> => {
    return obj && typeof obj.update === 'function' && typeof obj.destroy === 'function';
  },
  
  /**
   * 检查是否为高阶基类实例
   */
  advancedWidget: (obj: any): obj is Widget => {
    return obj instanceof Widget;
  },
  
  /**
   * 检查是否为 VNode
   */
  vnode: (obj: any): obj is VNode => {
    return obj && typeof obj.type === 'string' && Array.isArray(obj.children);
  },
}; 