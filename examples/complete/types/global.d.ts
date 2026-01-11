/**
 * 全局类型扩展
 *
 * 此文件会被 tsconfig.json 自动加载，无需在每个文件中手动 import。
 * TypeScript 会自动识别 .d.ts 文件并应用其中的类型声明。
 */
import { type JSX } from '@fukict/basic';

/**
 * 扩展 @fukict/router 的 RouteMeta 接口
 *
 * 通过模块扩展（Module Augmentation），为整个项目定义统一的路由 meta 类型。
 * 这样所有组件中的 this.route.meta 都会自动获得这些字段的类型提示。
 */
declare module '@fukict/router' {
  interface RouteMeta {
    /**
     * 页面标题
     */
    title?: string;

    /**
     * 页面描述
     */
    description?: JSX.Element | string;

    /**
     * 是否在侧边栏显示
     */
    showInSidebar?: boolean;

    /**
     * 是否需要认证
     */
    requiresAuth?: boolean;
  }
}

// 必须导出空对象，确保这是一个模块文件
// 否则 TypeScript 会将其视为全局脚本，导致 declare module 不生效
export {};
