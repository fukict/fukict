/**
 * Widget JSX 类型扩展
 * 为所有组件添加 onMounted 回调支持
 */

// 导入 core 的 JSX 基础类型
/// <reference path="../../core/types/jsx.d.ts" />

declare global {
  namespace JSX {
    /**
     * 扩展所有 JSX 元素的通用属性
     * 在 widget 范式中支持 onMounted 回调
     */
    interface IntrinsicAttributes {
      /**
       * Widget 组件挂载回调
       * 当 Widget 组件挂载到 DOM 后调用，传入 Widget 实例
       */
      onMounted?: (instance: any) => void;
    }
  }
}

export {};
