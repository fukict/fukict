// 自动注册 Widget 编码范式处理器
import { registerWidgetPatterns } from './pattern-handlers';

registerWidgetPatterns();

export { Widget } from './class-widget';

export { defineWidget } from './functional-widget';

export {
  deepClone,
  deepEqual,
  isFunctionWidget,
  isClassWidget,
} from './helpers';

// 导出 Widget 层基础设施
export { WidgetList } from './widget-list';
export { extractSlots, getSlot, isEmptySlots } from './slots-extractor';
export { RefsManager, extractRefName, isDetached } from './refs-manager';
export { patchDOM } from './differ';

// 导出调度器配置
export {
  configureScheduler,
  getSchedulerConfig,
  scheduleRender,
  immediateRender,
  clearScheduledTasks,
} from './scheduler';

export type {
  WidgetProps,
  WidgeFuncInstance,
  WidgetFuncRender,
  WidgetFuncFactory,
  DOMQuery,
  DOMBatchQuery,
  ComponentType,
  RegisterableComponent,
  ComponentInstance,
  ComponentMountCallback,
} from './types';

export type { SlotsMap } from './slots-extractor';
export type { RefsMap } from './refs-manager';

export * from './jsx-runtime';

// ===== 从 @fukict/runtime 重新导出常用内容 =====
// 减少用户心智负担，避免同时引用两个包

export {
  // 核心渲染函数
  render,
  // JSX 工厂函数
  hyperscript,
  h,
  Fragment,
} from '@fukict/runtime';

export type {
  // VNode 类型
  VNode,
  VNodeChild,
  // 组件类型
  ComponentFunction,
  // Props 类型
  DOMProps,
  DOMEventProps,
  // Ref 类型
  RefCallback,
  // 渲染选项
  RenderOptions,
} from '@fukict/runtime';

// 导出包元数据
export { METADATA } from './metadata';
