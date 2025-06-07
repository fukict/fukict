/**
 * JSX 类型扩展 - 为 @vanilla-dom/widget 添加组件注册支持
 */


declare global {
  namespace JSX {
    /**
     * 扩展所有 JSX 元素的通用属性
     * 这会让所有元素（包括自定义组件）都支持 onMount
     */
    interface IntrinsicAttributes {
      /**
       * 组件挂载回调 - 支持所有组件实例类型
       */
      onMount?: (instance: any) => void;
    }
  }
}

// 确保此文件被视为模块
export {};
