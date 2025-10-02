import { Widget } from './class-widget';

/**
 * 对象操作辅助函数
 * 提供深度克隆和深度比较功能
 */

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 深度比较两个对象
 */
export function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  if (obj1 instanceof Array && obj2 instanceof Array) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(key => {
    return (
      keys2.includes(key) && deepEqual((obj1 as any)[key], (obj2 as any)[key])
    );
  });
}

/**
 * 检查是否为函数组件（通过 defineWidget 创建的组件）
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
