// Ref 回调函数类型
export type RefCallback = (element: Element | null) => void;

// VNode 节点树数据结构
export interface VNode {
  type: string | ComponentFunction;
  props: Record<string, any> | null;
  events: Record<string, EventListener> | null; // 新增：编译时分离的事件监听器
  children: VNodeChild[];
  key?: string | number;
  ref?: RefCallback; // 新增：ref 回调
}

// 子节点类型
export type VNodeChild = VNode | string | number | boolean | null | undefined;

// 组件函数类型
export type ComponentFunction = (props: Record<string, any>) => VNode;

// DOM 属性类型
export interface DOMProps extends Record<string, any> {
  children?: VNodeChild | VNodeChild[];
  key?: string | number;
  ref?: RefCallback; // 新增：ref 支持
}

// 编译时事件处理器映射
export interface EventHandlers {
  [eventName: string]: EventListener;
}

// 渲染选项
export interface RenderOptions {
  container: Element;
  replace?: boolean;
}

// 更新上下文
export interface UpdateContext {
  currentNode: Element;
  parentNode: Element;
  nextSibling: Element | null;
}
