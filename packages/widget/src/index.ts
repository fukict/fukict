// 自动注册 Widget 编码范式处理器
import { registerWidgetPatterns } from './pattern-handlers';

registerWidgetPatterns();

export { Widget } from './class-widget';

export { createWidget } from './functional-widget';

export {
  deepClone,
  deepEqual,
  isFunctionWidget,
  isClassWidget,
} from './helpers';

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

export * from './jsx-runtime';

// 不再重新导出 runtime 的函数，保持包的职责分离
// 用户应该从 @fukict/runtime 导入 hyperscript, render 等基础函数

// 导出包元数据
export { METADATA } from './metadata';
