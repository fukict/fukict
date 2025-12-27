/**
 * Web Component JSX 类型扩展示例
 *
 * 本文件展示如何扩展 Fukict 的 JSX 类型以支持自定义 Web Component
 *
 * 核心原理：
 * 1. TypeScript 的 declaration merging（声明合并）
 * 2. 通过 `declare module` 扩展 @fukict/basic 的 JSX namespace
 * 3. 在 IntrinsicElements 中添加自定义元素类型
 */
import type { HTMLAttributes } from '@fukict/basic';

// ============================================================================
// 1. 定义 Web Component 的属性接口
// ============================================================================

/**
 * my-counter 组件的属性
 */
export interface MyCounterAttributes {
  /** 初始计数值 */
  value?: number;
  /** 步进值 */
  step?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 计数变化回调 - 使用 Event 类型，在处理器中进行类型断言 */
  'on:change'?: (event: Event) => void;
}

/**
 * my-alert 组件的属性
 */
export interface MyAlertAttributes {
  /** 提示类型 */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** 标题 */
  title?: string;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭回调 */
  'on:close'?: (event: CustomEvent) => void;
}

/**
 * my-tabs 组件的属性
 */
export interface MyTabsAttributes {
  /** 当前激活的 tab */
  'active-key'?: string;
  /** tab 变化回调 */
  'on:change'?: (event: CustomEvent<{ key: string }>) => void;
}

// ============================================================================
// 2. 扩展 Fukict JSX 类型（核心）
// ============================================================================

/**
 * 通过 declaration merging 扩展 @fukict/basic 的 JSX namespace
 *
 * 这样就可以在 JSX 中使用自定义元素，并获得完整的类型检查：
 * - 属性自动补全
 * - 类型错误提示
 * - 事件类型推断
 */
declare module '@fukict/basic' {
  namespace JSX {
    interface IntrinsicElements {
      // 自定义 Web Component 元素
      // 使用 HTMLAttributes 作为基础，添加自定义属性
      'my-counter': HTMLAttributes<HTMLElement> & MyCounterAttributes;
      'my-alert': HTMLAttributes<HTMLElement> & MyAlertAttributes;
      'my-tabs': HTMLAttributes<HTMLElement> & MyTabsAttributes;
    }
  }
}

// ============================================================================
// 3. 导出类型供外部使用
// ============================================================================

export type { HTMLAttributes };
