/**
 * Widget JSX Runtime
 * 重新导出 @vanilla-dom/core 的 JSX 运行时并扩展 onMounted 支持
 */

// 重新导出 core 的运行时函数
export { hyperscript, h, jsx, jsxs, jsxDEV, Fragment } from '@vanilla-dom/core';

// 重新导出并扩展 JSX 类型
import type { JSX as CoreJSX } from '@vanilla-dom/core';

export declare namespace JSX {
  // 继承 core 的所有 JSX 类型
  interface Element extends CoreJSX.Element {}
  interface IntrinsicElements extends CoreJSX.IntrinsicElements {}
  interface ElementAttributesProperty extends CoreJSX.ElementAttributesProperty {}
  interface ElementChildrenAttribute extends CoreJSX.ElementChildrenAttribute {}

  // 扩展 Widget 特有的属性
  interface IntrinsicAttributes {
    /**
     * Widget 组件挂载回调
     * 当 Widget 组件挂载到 DOM 后调用，传入 Widget 实例
     */
    onMounted?: (instance: any) => void;
  }
}
