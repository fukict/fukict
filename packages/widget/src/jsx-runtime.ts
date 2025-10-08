// 重新导出并扩展 JSX 类型
import type { JSX as RuntimeJSX } from '@fukict/runtime';

/**
 * Widget JSX Runtime
 * 重新导出 @fukict/runtime 的 JSX 运行时并扩展 onMounted 支持
 */

// 重新导出 runtime 的运行时函数
export { hyperscript, h, jsx, jsxs, jsxDEV, Fragment } from '@fukict/runtime';

export declare namespace JSX {
  // 继承 runtime 的所有 JSX 类型
  interface Element extends RuntimeJSX.Element {}
  interface IntrinsicElements extends RuntimeJSX.IntrinsicElements {}
  interface ElementAttributesProperty
    extends RuntimeJSX.ElementAttributesProperty {}
  interface ElementChildrenAttribute
    extends RuntimeJSX.ElementChildrenAttribute {}

  // 扩展 Widget 特有的属性
  interface IntrinsicAttributes {
    /**
     * Widget 组件挂载回调
     * 当 Widget 组件挂载到 DOM 后调用，传入 Widget 实例
     */
    onMounted?: (instance: any) => void;

    /**
     * 子节点
     * 所有 Widget 组件都支持 children
     */
    children?: RuntimeJSX.Element | RuntimeJSX.Element[];

    /**
     * Fukict 框架属性
     */
    'fukict:slot'?: string; // 具名插槽
    'fukict:ref'?: string; // 组件引用
    'fukict:detach'?: boolean; // 脱围标记
  }
}
