import { Widget } from './class-widget';

/**
 * 检查是否为函数组件（通过 createWidget 创建的组件）
 */
export function isFunctionWidget(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'function' &&
    obj.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION'
  );
}

/**
 * 检查是否为类组件（Widget 类或其实例）
 */
export function isClassWidget(obj: any): boolean {
  // 检查是否为 Widget 类
  if (
    typeof obj === 'function' &&
    obj.prototype &&
    obj.prototype instanceof Widget
  ) {
    return true;
  }
  
  // 检查是否为 Widget 实例
  return obj instanceof Widget;
}
