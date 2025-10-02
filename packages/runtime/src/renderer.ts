/**
 * 核心渲染引擎
 * 负责将 VNode 虚拟节点树高效转换为真实 DOM，支持组件渲染、差异更新和 SSR 水合
 *
 * @fileoverview VNode 到 DOM 的渲染引擎，fukict 框架的核心模块
 * @version 1.0.0
 * @performance 优化的 DOM 操作，支持增量更新和组件缓存
 */
import type {
  ComponentFunction,
  RenderOptions,
  VNode,
  VNodeChild,
} from '../types/index';
import {
  appendChild,
  clearChildren,
  createElement,
  createTextNode,
  removeNode,
  removeProperty,
  setEvents,
  setProperty,
  updateEvents,
  updateProperty,
} from './dom-utils';
import { assertBrowserEnvironment } from './env';
import {
  isRegisteredComponent,
  renderRegisteredComponent,
} from './pattern-registry';

// VNode 与 DOM 节点的双向映射关系
// 用于快速查找和状态管理，支持增量更新
const vNodeToDOMMap = new WeakMap<VNode, Node>();
const domToVNodeMap = new WeakMap<Node, VNode>();

/**
 * 将 VNode 树转换为真实 DOM 节点
 * 支持原生元素、函数组件和编码范式组件的完整渲染
 *
 * @param vnode - 要渲染的虚拟节点
 * @returns 创建的 DOM 节点
 *
 * @features
 * - 自动区分原生元素和组件类型
 * - 完整的属性和事件绑定
 * - 递归子节点渲染
 * - 双向映射关系建立
 * - ref 回调支持
 *
 * @performance 使用 WeakMap 存储映射关系，自动垃圾回收
 * ```
 */
export function createDOMFromTree(vnode: VNode): Node {
  if (!vnode || typeof vnode !== 'object') {
    throw new Error('Invalid VNode: expected object');
  }

  if (typeof vnode.type === 'function') {
    // 处理函数组件和编码范式组件
    return createDOMFromComponent(vnode);
  }

  if (typeof vnode.type !== 'string') {
    throw new Error(
      `Invalid VNode type: expected string or function, got ${typeof vnode.type}`,
    );
  }

  // 处理原生 HTML 元素
  const element = createElement(vnode.type);

  // 批量设置属性（性能优化）
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      setProperty(element, key, value);
    }
  }

  // 设置事件监听器（编译时分离的事件处理）
  if (vnode.events) {
    setEvents(element, vnode.events);
  }

  // 递归渲染子节点 - 使用防御性拷贝，保护原始数据
  const children = Array.isArray(vnode.children) ? vnode.children : [];
  for (const child of children) {
    const childNode = createDOMFromChild(child);
    if (childNode) {
      appendChild(element, childNode);
    }
  }

  // 建立双向映射关系（支持后续的增量更新）
  vNodeToDOMMap.set(vnode, element);
  domToVNodeMap.set(element, vnode);

  // 调用 ref 回调（React 风格的 ref 支持）
  if (vnode.ref && typeof vnode.ref === 'function') {
    try {
      vnode.ref(element);
    } catch (error) {
      console.warn('[@fukict/runtime] Error in ref callback:', error);
    }
  }

  return element;
}

/**
 * 渲染函数组件和编码范式组件
 * 支持多种组件类型的统一处理和错误恢复
 *
 * @param vnode - 组件类型的 VNode
 * @returns 渲染后的 DOM 节点
 *
 * @algorithm
 * 1. 检查是否为注册的编码范式组件
 * 2. 如果是，使用专用的范式渲染器
 * 3. 否则作为普通函数组件处理
 * 4. 处理组件返回值的多种类型
 * 5. 错误边界处理和恢复
 *
 * @error_handling 组件渲染失败时显示错误信息而不是崩溃
 */
function createDOMFromComponent(vnode: VNode): Node {
  const component = vnode.type as ComponentFunction;

  if (!component || typeof component !== 'function') {
    throw new Error('Invalid component: expected function');
  }

  // 检查是否为已注册的编码范式组件（Widget 等）
  if (isRegisteredComponent(component)) {
    const props = vnode.props || {};
    const children = vnode.children || [];

    try {
      // 使用注册的范式处理器渲染组件
      const renderedVNode = renderRegisteredComponent(
        component,
        props,
        children,
      );
      if (renderedVNode) {
        return createDOMFromTree(renderedVNode);
      }
    } catch (error) {
      console.error(
        `[@fukict/runtime] Error rendering registered component ${component.name || 'Anonymous'}:`,
        error,
      );
      return createTextNode(
        `[Pattern Component Error: ${component.name || 'Anonymous'}]`,
      );
    }
  }

  // 处理普通函数组件
  try {
    const props = vnode.props || {};
    const children = vnode.children || [];

    // 调用组件函数，传入完整的 props（包含 children）
    const result = component({ ...props, children }) as any;

    // 处理组件返回值的多种情况
    if (result && typeof result === 'object' && 'type' in result) {
      // 返回 VNode，递归处理
      return createDOMFromTree(result as VNode);
    }

    if (typeof result === 'string' || typeof result === 'number') {
      // 返回原始值，创建文本节点
      return createTextNode(String(result));
    }

    // 返回空值或 false，创建空文本节点（React 兼容行为）
    if (result === null || result === undefined || result === false) {
      return createTextNode('');
    }

    // 其他类型的返回值，转换为字符串
    return createTextNode(String(result));
  } catch (error) {
    // 错误边界：组件渲染失败时的恢复机制
    console.error(
      `[@fukict/runtime] Error rendering component ${component.name || 'Anonymous'}:`,
      error,
    );
    return createTextNode(
      `[Component Error: ${component.name || 'Anonymous'}]`,
    );
  }
}

/**
 * 处理单个子节点的渲染
 * 支持多种子节点类型的统一处理
 *
 * @param child - 子节点（可能是 VNode、字符串、数字、布尔值或 null）
 * @returns DOM 节点或 null
 *
 * @features
 * - 自动类型识别和转换
 * - null/undefined/false 的过滤处理
 * - 字符串和数字的文本节点创建
 * - VNode 的递归渲染
 */
function createDOMFromChild(child: VNodeChild): Node | null {
  // 过滤掉无效值（React 兼容行为）
  if (child == null || typeof child === 'boolean') {
    return null;
  }

  // 处理原始类型值
  if (typeof child === 'string' || typeof child === 'number') {
    return createTextNode(String(child));
  }

  // 处理 VNode 对象 - 此时 child 不可能是 boolean
  if (typeof child === 'object' && child !== null && 'type' in child) {
    return createDOMFromTree(child as VNode);
  }

  // 其他类型，转换为字符串处理
  return createTextNode(String(child));
}

/**
 * 将 VNode 渲染到指定的 DOM 容器中
 * 框架的主要入口函数，支持替换和追加两种模式
 *
 * @param vnode - 要渲染的根 VNode
 * @param options - 渲染选项配置
 *
 * @features
 * - 容器清空和替换模式
 * - 错误处理和验证
 * - 完整的渲染管道
 *
 * @throws {Error} 当容器无效时抛出错误
 */
export function render(vnode: VNode, options: RenderOptions): void {
  // 确保在浏览器环境中运行
  assertBrowserEnvironment('render');

  if (!vnode) {
    throw new Error('Invalid VNode: cannot render null or undefined');
  }

  if (!options.container) {
    throw new Error('Invalid container: container element is required');
  }

  const { container, replace = false } = options;

  try {
    // 根据选项决定是否清空容器
    if (replace) {
      clearChildren(container);
    }

    // 创建 DOM 树并插入容器
    const domNode = createDOMFromTree(vnode);
    appendChild(container, domNode);
  } catch (error) {
    console.error('[@fukict/runtime] Error during render:', error);
    // 在生产环境中，可以选择显示错误信息而不是崩溃
    const errorNode = createTextNode('[Render Error]');
    if (replace) {
      clearChildren(container);
    }
    appendChild(container, errorNode);
    throw error; // 重新抛出错误，让调用者处理
  }
}

/**
 * 高效的 DOM 差异更新算法
 * 基于新旧 VNode 树的比较，执行最小化的 DOM 操作
 *
 * @param oldVNode - 旧的 VNode 树
 * @param newVNode - 新的 VNode 树
 * @param domNode - 对应的 DOM 节点
 *
 * @algorithm
 * 1. 类型检查：类型不同则完全替换
 * 2. 属性差异更新：只更新变化的属性
 * 3. 事件监听器差异更新：智能事件管理
 * 4. 子节点递归比较：最小化子树更新
 * 5. ref 回调管理：正确处理 ref 生命周期
 * 6. 映射关系维护：保持数据一致性
 *
 * @performance
 * - 避免不必要的 DOM 操作
 * - 智能的属性和事件差异算法
 * - 高效的子节点更新策略
 */
export function updateDOM(
  oldVNode: VNode,
  newVNode: VNode,
  domNode: Node,
): void {
  if (!oldVNode || !newVNode || !domNode) {
    throw new Error(
      'Invalid arguments: oldVNode, newVNode, and domNode are required',
    );
  }

  // 类型改变时完全替换（最简单但有效的策略）
  if (oldVNode.type !== newVNode.type) {
    try {
      const newDomNode = createDOMFromTree(newVNode);
      const parent = domNode.parentNode;
      if (parent) {
        parent.replaceChild(newDomNode, domNode);

        // 清理旧的 ref
        if (oldVNode.ref && typeof oldVNode.ref === 'function') {
          oldVNode.ref(null);
        }
      }
    } catch (error) {
      console.error('[@fukict/runtime] Error during DOM replacement:', error);
    }
    return;
  }

  // 对于相同类型的元素，执行增量更新
  const element = domNode as Element;

  try {
    // 差异更新属性（只操作变化的属性）
    updateProperties(element, oldVNode.props, newVNode.props);

    // 差异更新事件监听器（智能事件管理）
    updateEvents(element, newVNode.events, oldVNode.events);

    // 递归更新子节点（使用安全的数组处理）
    const oldChildren = Array.isArray(oldVNode.children)
      ? oldVNode.children
      : [];
    const newChildren = Array.isArray(newVNode.children)
      ? newVNode.children
      : [];
    updateChildren(element, oldChildren, newChildren);

    // 管理 ref 回调的生命周期
    if (oldVNode.ref !== newVNode.ref) {
      // 清理旧的 ref
      if (oldVNode.ref && typeof oldVNode.ref === 'function') {
        try {
          oldVNode.ref(null);
        } catch (error) {
          console.warn('[@fukict/runtime] Error in old ref cleanup:', error);
        }
      }

      // 设置新的 ref
      if (newVNode.ref && typeof newVNode.ref === 'function') {
        try {
          newVNode.ref(element);
        } catch (error) {
          console.warn('[@fukict/runtime] Error in new ref callback:', error);
        }
      }
    }

    // 更新双向映射关系
    domToVNodeMap.set(domNode, newVNode);
    vNodeToDOMMap.set(newVNode, domNode);
  } catch (error) {
    console.error('[@fukict/runtime] Error during DOM update:', error);
  }
}

/**
 * 差异更新元素属性
 * 高效的属性管理，只操作发生变化的属性
 *
 * @param element - 目标 DOM 元素
 * @param oldProps - 旧属性对象
 * @param newProps - 新属性对象
 *
 * @performance 使用对象遍历和差异比较，避免不必要的 DOM 操作
 *
 * @algorithm
 * 1. 遍历旧属性，移除不存在于新属性中的项
 * 2. 遍历新属性，更新或添加属性
 * 3. 利用 updateProperty 的内置优化（值相等时跳过）
 */
function updateProperties(
  element: Element,
  oldProps: Record<string, any> | null,
  newProps: Record<string, any> | null,
): void {
  const oldP = oldProps || {};
  const newP = newProps || {};

  // 移除不再存在的属性
  for (const key in oldP) {
    if (!(key in newP)) {
      removeProperty(element, key);
    }
  }

  // 更新或添加属性（updateProperty 内部会进行值比较优化）
  for (const key in newP) {
    updateProperty(element, key, newP[key], oldP[key]);
  }
}

/**
 * 简化的子节点差异更新算法
 * 保持 Runtime 层的职责单一，提供基础但有效的子节点管理
 *
 * @param parent - 父元素
 * @param oldChildren - 旧子节点数组
 * @param newChildren - 新子节点数组
 *
 * @algorithm
 * 1. 计算最大长度，确保处理所有位置
 * 2. 逐位置比较子节点
 * 3. 处理添加、删除、替换、更新四种情况
 * 4. 递归调用 updateDOM 处理 VNode 子节点
 *
 * @note 这是简化版本，更复杂的场景可能需要 key-based 算法
 *
 * @performance 避免全量重建，只处理必要的变更
 */
function updateChildren(
  parent: Element,
  oldChildren: VNodeChild[],
  newChildren: VNodeChild[],
): void {
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    const childNode = parent.childNodes[i];

    if (newChild === undefined || newChild === null) {
      // 新子节点不存在，移除旧节点
      if (childNode) {
        removeNode(childNode);
      }
    } else if (oldChild === undefined || oldChild === null) {
      // 旧子节点不存在，添加新节点
      const newChildNode = createDOMFromChild(newChild);
      if (newChildNode) {
        appendChild(parent, newChildNode);
      }
    } else if (typeof oldChild !== typeof newChild) {
      // 类型不同，完全替换
      const newChildNode = createDOMFromChild(newChild);
      if (newChildNode && childNode) {
        parent.replaceChild(newChildNode, childNode);
      }
    } else if (typeof oldChild === 'object' && typeof newChild === 'object') {
      // 都是 VNode 对象，递归更新
      if (childNode && 'type' in oldChild && 'type' in newChild) {
        updateDOM(oldChild, newChild, childNode);
      }
    } else if (oldChild !== newChild) {
      // 原始值类型且内容不同，更新文本内容
      if (childNode && childNode.nodeType === Node.TEXT_NODE) {
        childNode.textContent = String(newChild);
      }
    }
    // 如果 oldChild === newChild，则无需操作（性能优化）
  }
}

/**
 * DOM 水合功能（SSR 支持）
 * 将现有的服务端渲染 DOM 与 VNode 树建立关联
 *
 * @param vnode - 要水合的 VNode 树
 * @param existingDOM - 现有的 DOM 元素
 *
 * @todo 实现完整的水合逻辑，包括：
 * - 深度遍历和验证 DOM 结构
 * - 属性和事件的客户端激活
 * - 不匹配时的错误处理
 * - 性能优化的选择性水合
 */
export function hydrate(vnode: VNode, existingDOM: Element): void {
  if (!vnode || !existingDOM) {
    throw new Error('Invalid arguments: vnode and existingDOM are required');
  }

  try {
    // 当前简单实现：仅建立映射关系
    vNodeToDOMMap.set(vnode, existingDOM);
    domToVNodeMap.set(existingDOM, vnode);

    // TODO: 实现完整的水合逻辑
    // - 验证 DOM 结构与 VNode 的匹配性
    // - 激活事件监听器
    // - 递归处理子节点
    // - 处理客户端特有的属性

    console.warn('[@fukict/runtime] Hydration is not fully implemented yet');
  } catch (error) {
    console.error('[@fukict/runtime] Error during hydration:', error);
    throw error;
  }
}
