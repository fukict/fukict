import './jsx-extensions';
// 导入 JSX 类型扩展，确保组件注册相关类型定义生效
import {
  type ComponentDetector,
  registerComponentDetector,
} from '@vanilla-dom/core';
import '@vanilla-dom/core/jsx-types';

// Widget 包定义自己的检测器

/**
 * 检查是否为Widget类（包括继承链）
 */
function isWidgetClass(constructor: any): boolean {
  if (!constructor || typeof constructor !== 'function') {
    return false;
  }

  // 检查自身是否有标志
  if (constructor.__COMPONENT_TYPE__ === 'WIDGET_CLASS') {
    return true;
  }

  // 检查原型链
  let current = constructor;
  while (current && current !== Function.prototype) {
    if (current.__COMPONENT_TYPE__ === 'WIDGET_CLASS') {
      return true;
    }
    current = Object.getPrototypeOf(current);
  }

  return false;
}

const WIDGET_CLASS_DETECTOR: ComponentDetector = {
  name: 'WIDGET_CLASS',

  detect(value: any): boolean {
    return (
      typeof value === 'function' &&
      value.prototype &&
      // 检查原型链中是否有Widget基类
      isWidgetClass(value)
    );
  },

  create(WidgetClass: any, props: any) {
    return new WidgetClass(props);
  },

  getInstance(instance: any) {
    return instance; // 返回类实例
  },
};

const WIDGET_FUNCTION_DETECTOR: ComponentDetector = {
  name: 'WIDGET_FUNCTION',

  detect(value: any): boolean {
    return (
      typeof value === 'function' &&
      value.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION'
    );
  },

  create(factory: Function, props: any) {
    return factory(props);
  },

  getInstance(instance: any) {
    return instance; // 返回函数执行结果
  },
};

// Widget 包在初始化时注册自己的检测器
registerComponentDetector(WIDGET_CLASS_DETECTOR);
registerComponentDetector(WIDGET_FUNCTION_DETECTOR);

export { Widget } from './class-widget';

export { createWidget } from './functional-widget';

export {
  widgetToComponent,
  createComponent,
  embedWidget,
  createComponentFactory,
  is,
} from './adapters';

export type {
  WidgetProps,
  SimpleWidgetInstance,
  SimpleWidgetRender,
  SimpleWidgetFactory,
  DOMQuery,
  DOMBatchQuery,
  ComponentType,
  RegisterableComponent,
  ComponentInstance,
  ComponentMountCallback,
} from './types';

export * from './jsx-runtime';

// 不再重新导出 core 的函数，保持包的职责分离
// 用户应该从 @vanilla-dom/core 导入 hyperscript, render 等基础函数

export const version = '0.1.0';
