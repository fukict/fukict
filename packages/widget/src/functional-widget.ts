import type { VNode } from '@fukict/core';
import { render, updateDOM } from '@fukict/core';

import { deepClone, deepEqual } from './helpers';
import { immediateRender, scheduleRender } from './scheduler';
import type {
  WidgeFuncInstance,
  WidgetFuncFactory,
  WidgetFuncRender,
  WidgetProps,
} from './types';

/**
 * 创建简易函数组件
 *
 * 用于 UI 略微复杂但需要重复渲染的场景：
 * - 深度监听 props 变化
 * - props 变更必定触发更新
 * - 无配置选项，专注简单重复渲染
 * - 使用 core 包的精确更新算法
 * - 自动支持组件注册机制
 *
 * @example
 * ```tsx
 * const Counter = createWidget<{ count: number }>(({ count }) => (
 *   <div>Count: {count}</div>
 * ));
 * ```
 */
export const createWidget: WidgetFuncFactory = <T extends WidgetProps>(
  renderFn: WidgetFuncRender<T>,
) => {
  const factory = (props: T = {} as T): WidgeFuncInstance => {
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
        console.warn('[@fukict/widget] Widget not mounted, cannot update');
        return;
      }

      // 深度比较 props
      if (deepEqual(currentProps, newProps)) {
        return; // 没有变化，跳过更新
      }

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

    const instance: WidgeFuncInstance = {
      // VNode 属性
      type: renderFn,
      props: currentProps,
      events: null,
      children: [],

      // ComponentInstance 属性
      get element() {
        return currentElement;
      },

      update: (newProps: WidgetProps) => {
        updateRender(newProps as T);
      },

      mount: async (
        targetContainer: Element,
        immediate = false,
      ): Promise<void> => {
        if (isMounted) {
          console.warn('[@fukict/widget] Widget is already mounted');
          return;
        }

        const mountTask = () => {
          initialRender(targetContainer);
          isMounted = true;
        };

        if (immediate) {
          immediateRender(mountTask);
        } else {
          return new Promise<void>((resolve, reject) => {
            scheduleRender(() => {
              try {
                mountTask();
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      },

      destroy,
    };

    return instance;
  };

  // 创建带生命周期的渲染函数（用于 JSX 渲染）
  const renderWithLifecycle = (
    props: any,
    onMountedCallback?: (instance: any) => void,
  ) => {
    const vnode = renderFn(props);

    // 如果有 onMounted 回调，通过 ref 处理（仅在 JSX 渲染时生效）
    if (onMountedCallback) {
      const originalRef = vnode.ref;
      let isMounted = false; // 确保 onMounted 只调用一次

      vnode.ref = (element: Element | null) => {
        // 先调用原有的 ref 回调
        if (originalRef) {
          originalRef(element);
        }

        if (isMounted) {
          console.warn('[@fukict/widget] Widget is already mounted');
          return;
        }

        // 只在第一次挂载时调用 onMounted
        if (element) {
          isMounted = true;
          // 创建一个简单的实例对象传给回调
          const instance = factory(props);
          onMountedCallback(instance);
        }
      };
    }

    return vnode;
  };

  // 添加组件类型标志 - 用于 babel-plugin 自动识别
  (factory as any).__COMPONENT_TYPE__ = 'WIDGET_FUNCTION';

  // 暴露带生命周期的渲染函数
  (factory as any).__RENDER_WITH_LIFECYCLE__ = renderWithLifecycle;

  return factory;
};
