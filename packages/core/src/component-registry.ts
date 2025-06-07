/**
 * @vanilla-dom/core - 组件注册机制
 *
 * 基于标志识别的组件范式注册系统
 * 提供通用的组件检测和注册基础设施，不包含任何特定库的概念
 */

// 组件实例统一接口
export interface ComponentInstance {
  mount(container: Element): void | Promise<void>;
  update?(props: any): void;
  destroy?(): void;
  element?: Element | null;
}

// 标志检测器接口
export interface ComponentDetector {
  name: string;

  // 检测组件是否有此标志
  detect(value: any): boolean;

  // 创建组件实例
  create(componentValue: any, props: any): ComponentInstance;

  // 获取实例引用（支持不同范式的实例返回）
  getInstance?(instance: ComponentInstance): any;
}

// 注册中心
const detectorRegistry = new Map<string, ComponentDetector>();

// 注册标志检测器
export function registerComponentDetector(detector: ComponentDetector): void {
  detectorRegistry.set(detector.name, detector);
}

// 获取所有检测器
export function getAllDetectors(): ComponentDetector[] {
  return Array.from(detectorRegistry.values());
}

// 检查组件是否已注册（仅检查，不创建实例）
export function isComponentRegistered(componentValue: any): boolean {
  for (const detector of detectorRegistry.values()) {
    if (detector.detect(componentValue)) {
      return true;
    }
  }
  return false;
}

// 创建组件实例
export function createComponentInstance(
  componentValue: any,
  props: any,
): ComponentInstance | null {
  for (const detector of detectorRegistry.values()) {
    if (detector.detect(componentValue)) {
      return detector.create(componentValue, props);
    }
  }
  return null;
}

// 获取组件实例引用
export function getComponentReference(
  componentValue: any,
  instance: ComponentInstance,
): any {
  for (const detector of detectorRegistry.values()) {
    if (detector.detect(componentValue)) {
      return detector.getInstance ? detector.getInstance(instance) : instance;
    }
  }
  return instance;
}
