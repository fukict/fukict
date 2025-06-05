import type { VNode } from '@vanilla-dom/core';
import { render, updateDOM } from '@vanilla-dom/core';
import type { 
  WidgetProps, 
  SimpleWidgetInstance, 
  SimpleWidgetRender, 
  SimpleWidgetFactory 
} from './types';

/**
 * 创建简易函数组件
 * 
 * 用于 UI 略微复杂但需要重复渲染的场景：
 * - 深度监听 props 变化
 * - props 变更必定触发更新
 * - 无配置选项，专注简单重复渲染
 * - 使用 core 包的精确更新算法
 */
export const createWidget: SimpleWidgetFactory<any> = <T extends WidgetProps>(
  renderFn: SimpleWidgetRender<T>
) => {
  return (props: T): SimpleWidgetInstance => {
    let currentElement: Element | null = null;
    let currentVNode: VNode | null = null;
    let currentProps: T = deepClone(props);
    let container: Element | null = null;

    // 初始渲染
    const initialRender = (targetContainer: Element) => {
      container = targetContainer;
      const vnode = renderFn(currentProps);
      currentVNode = vnode;
      render(vnode, { container });
      currentElement = container.firstElementChild;
    };

    // 更新渲染 - 使用精确更新算法
    const updateRender = (newProps: T) => {
      if (!container || !currentVNode || !currentElement) {
        console.warn('Widget not mounted, cannot update');
        return;
      }

      // 深度比较 props
      if (deepEqual(currentProps, newProps)) {
        return; // 没有变化，跳过更新
      }

      const prevProps = currentProps;
      currentProps = deepClone(newProps);
      
      // 生成新的 VNode
      const newVNode = renderFn(currentProps);
      
      // 使用 core 包的精确更新算法
      updateDOM(currentVNode, newVNode, currentElement);
      
      // 更新当前 VNode 引用
      currentVNode = newVNode;
    };

    // 销毁组件
    const destroy = () => {
      if (currentElement && currentElement.parentNode) {
        currentElement.parentNode.removeChild(currentElement);
      }
      currentElement = null;
      currentVNode = null;
      container = null;
    };

    // 挂载状态管理
    let isMounted = false;
    
    const instance: SimpleWidgetInstance = {
      get element() {
        return currentElement;
      },
      
      update: (newProps: WidgetProps) => {
        updateRender(newProps as T);
      },
      
      mount: (targetContainer: Element) => {
        if (isMounted) {
          console.warn('Widget is already mounted');
          return;
        }
        initialRender(targetContainer);
        isMounted = true;
      },
      
      destroy,
    };

    return instance;
  };
};

/**
 * 深度克隆对象
 */
function deepClone<T>(obj: T): T {
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
      if (obj.hasOwnProperty(key)) {
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
function deepEqual<T>(obj1: T, obj2: T): boolean {
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
    return keys2.includes(key) && deepEqual((obj1 as any)[key], (obj2 as any)[key]);
  });
} 