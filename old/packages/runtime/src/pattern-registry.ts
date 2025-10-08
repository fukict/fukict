/**
 * @fukict/runtime - 组件编码范式注册机制
 *
 * 提供组件编码范式的注册、检测和渲染基础设施
 * 专注于范式层面的抽象，不涉及具体的实例管理
 */
import type { VNode } from '../types/index';

// 组件编码范式处理器
export interface ComponentPatternHandler {
  // 检测组件是否属于此编码范式
  detect: (component: any) => boolean;

  // 渲染此编码范式的组件为 VNode
  render: (component: any, props: any, children: any[]) => VNode;
}

// 范式注册表
const patternRegistry = new Map<string, ComponentPatternHandler>();

/**
 * 注册组件编码范式
 */
export function registerComponentPattern(
  patternName: string,
  handler: ComponentPatternHandler,
): void {
  patternRegistry.set(patternName, handler);
}

/**
 * 获取所有已注册的范式
 */
export function getAllPatterns(): Array<{
  name: string;
  handler: ComponentPatternHandler;
}> {
  return Array.from(patternRegistry.entries()).map(([name, handler]) => ({
    name,
    handler,
  }));
}

/**
 * 检查组件是否属于已注册的编码范式
 */
export function isRegisteredComponent(component: any): boolean {
  for (const handler of patternRegistry.values()) {
    if (handler.detect(component)) {
      return true;
    }
  }
  return false;
}

/**
 * 获取组件所属的编码范式名称
 */
export function getComponentPattern(component: any): string | null {
  for (const [name, handler] of patternRegistry.entries()) {
    if (handler.detect(component)) {
      return name;
    }
  }
  return null;
}

/**
 * 渲染已注册编码范式的组件
 */
export function renderRegisteredComponent(
  component: any,
  props: any,
  children: any[],
): VNode | null {
  for (const handler of patternRegistry.values()) {
    if (handler.detect(component)) {
      return handler.render(component, props, children);
    }
  }
  return null;
}
