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

// DOM 事件属性类型 - 支持 on: 前缀的事件绑定
export interface DOMEventProps {
  // 鼠标事件
  'on:click'?: (event: MouseEvent) => void;
  'on:dblclick'?: (event: MouseEvent) => void;
  'on:mousedown'?: (event: MouseEvent) => void;
  'on:mouseup'?: (event: MouseEvent) => void;
  'on:mousemove'?: (event: MouseEvent) => void;
  'on:mouseover'?: (event: MouseEvent) => void;
  'on:mouseout'?: (event: MouseEvent) => void;
  'on:mouseenter'?: (event: MouseEvent) => void;
  'on:mouseleave'?: (event: MouseEvent) => void;
  'on:contextmenu'?: (event: MouseEvent) => void;

  // 键盘事件
  'on:keydown'?: (event: KeyboardEvent) => void;
  'on:keyup'?: (event: KeyboardEvent) => void;
  'on:keypress'?: (event: KeyboardEvent) => void;

  // 表单事件
  'on:submit'?: (event: SubmitEvent) => void;
  'on:change'?: (event: Event) => void;
  'on:input'?: (event: InputEvent) => void;
  'on:focus'?: (event: FocusEvent) => void;
  'on:blur'?: (event: FocusEvent) => void;
  'on:focusin'?: (event: FocusEvent) => void;
  'on:focusout'?: (event: FocusEvent) => void;
  'on:reset'?: (event: Event) => void;
  'on:select'?: (event: Event) => void;

  // 窗口和文档事件
  'on:load'?: (event: Event) => void;
  'on:unload'?: (event: Event) => void;
  'on:beforeunload'?: (event: BeforeUnloadEvent) => void;
  'on:resize'?: (event: UIEvent) => void;
  'on:scroll'?: (event: Event) => void;

  // 拖拽事件
  'on:dragstart'?: (event: DragEvent) => void;
  'on:drag'?: (event: DragEvent) => void;
  'on:dragend'?: (event: DragEvent) => void;
  'on:dragenter'?: (event: DragEvent) => void;
  'on:dragover'?: (event: DragEvent) => void;
  'on:dragleave'?: (event: DragEvent) => void;
  'on:drop'?: (event: DragEvent) => void;

  // 触摸事件
  'on:touchstart'?: (event: TouchEvent) => void;
  'on:touchmove'?: (event: TouchEvent) => void;
  'on:touchend'?: (event: TouchEvent) => void;
  'on:touchcancel'?: (event: TouchEvent) => void;

  // 媒体事件
  'on:play'?: (event: Event) => void;
  'on:pause'?: (event: Event) => void;
  'on:ended'?: (event: Event) => void;
  'on:volumechange'?: (event: Event) => void;
  'on:timeupdate'?: (event: Event) => void;

  // 其他常用事件
  'on:error'?: (event: ErrorEvent) => void;
  'on:abort'?: (event: Event) => void;
  'on:canplay'?: (event: Event) => void;
  'on:canplaythrough'?: (event: Event) => void;
  'on:durationchange'?: (event: Event) => void;
  'on:emptied'?: (event: Event) => void;
  'on:loadeddata'?: (event: Event) => void;
  'on:loadedmetadata'?: (event: Event) => void;
  'on:loadstart'?: (event: Event) => void;
  'on:progress'?: (event: ProgressEvent) => void;
  'on:ratechange'?: (event: Event) => void;
  'on:seeked'?: (event: Event) => void;
  'on:seeking'?: (event: Event) => void;
  'on:stalled'?: (event: Event) => void;
  'on:suspend'?: (event: Event) => void;
  'on:waiting'?: (event: Event) => void;
}

// DOM 属性类型
export interface DOMProps extends DOMEventProps, Record<string, any> {
  children?: VNodeChild | VNodeChild[];
  key?: string | number;
  ref?: RefCallback;
  
  // 通用 HTML 属性
  id?: string;
  className?: string;
  class?: string;
  style?: string | Record<string, string | number>;
  title?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  hidden?: boolean;
  tabIndex?: number;
  accessKey?: string;
  contentEditable?: boolean | 'true' | 'false';
  draggable?: boolean;
  spellCheck?: boolean;
  translate?: 'yes' | 'no';
  role?: string;
  
  // Data 属性
  [dataAttribute: `data-${string}`]: string | number | boolean;
  
  // Aria 属性
  [ariaAttribute: `aria-${string}`]: string | number | boolean;
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
