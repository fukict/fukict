import {
  type ComponentPatternHandler,
  registerComponentPattern,
} from '@fukict/core';

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

/**
 * Widget 类组件范式处理器
 */
const WIDGET_CLASS_HANDLER: ComponentPatternHandler = {
  detect(value: any): boolean {
    return (
      typeof value === 'function' &&
      value.prototype &&
      // 检查原型链中是否有Widget基类
      isWidgetClass(value)
    );
  },

  render(WidgetClass: any, props: any, children: any[]) {
    // 提取 onMounted 回调
    const { onMounted, ...restProps } = props || {};

    // 创建 Widget 实例
    const instance = new WidgetClass({ ...restProps, children });

    // 如果有外部 onMounted 回调，需要与内部生命周期结合
    if (onMounted && typeof onMounted === 'function') {
      // 重写实例的 onMounted 方法，确保外部回调被调用
      const originalOnMounted = instance.onMounted.bind(instance);
      instance.onMounted = function () {
        originalOnMounted();
        onMounted(instance);
      };
    }

    // 使用带生命周期的渲染方法
    return instance.renderWithLifecycle();
  },
};

/**
 * Widget 函数组件范式处理器
 */
const WIDGET_FUNCTION_HANDLER: ComponentPatternHandler = {
  detect(value: any): boolean {
    return (
      typeof value === 'function' &&
      value.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION'
    );
  },

  render(factory: Function, props: any, children: any[]) {
    // 提取 onMounted 回调
    const { onMounted, ...restProps } = props || {};

    // 使用带生命周期的渲染函数
    const renderWithLifecycle = (factory as any).__RENDER_WITH_LIFECYCLE__;
    if (renderWithLifecycle && typeof renderWithLifecycle === 'function') {
      return renderWithLifecycle({ ...restProps, children }, onMounted);
    }

    return factory({ ...restProps, children });
  },
};

/**
 * 注册 Widget 包的组件范式处理器
 */
export function registerWidgetPatterns(): void {
  registerComponentPattern('WIDGET_CLASS', WIDGET_CLASS_HANDLER);
  registerComponentPattern('WIDGET_FUNCTION', WIDGET_FUNCTION_HANDLER);
}
