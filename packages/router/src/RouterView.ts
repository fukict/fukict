import { Fukict, type VNode, VNodeType, h } from '@fukict/basic';

import type { Router } from './Router';
import type { RouteConfig, RouterViewProps } from './types';

/**
 * RouterView 组件
 *
 * 负责渲染当前匹配的路由组件
 * 完全依赖框架的 diff 机制，通过 RouterProvider 的 update 触发更新
 */
export class RouterView extends Fukict<RouterViewProps> {
  /**
   * 子路由实例（如果有嵌套路由）
   */
  private childRouter: Router | null = null;

  /**
   * 组件卸载前
   */
  beforeUnmount(): void {
    // 清理子路由
    this.childRouter = null;
  }

  /**
   * 获取子路由（如果有嵌套路由）
   */
  private getRouterForChild(matched: RouteConfig): Router {
    if (matched.children && matched.children.length > 0) {
      // 有嵌套路由，创建子路由
      if (!this.childRouter) {
        this.childRouter = this.props.router.createChild();
      }
      // 每次都更新 childRouter 的 currentRoute，确保始终引用最新的父路由状态
      this.childRouter.currentRoute = this.props.router.currentRoute;
      return this.childRouter;
    }

    // 无嵌套路由，返回当前 router
    return this.props.router;
  }

  /**
   * 渲染方法
   */
  render(): VNode {
    const matched = this.props.router.matched;

    // 没有匹配的路由，渲染 fallback
    if (!matched || !matched.component) {
      return this.props.fallback || h('div', { class: 'router-view' }, []);
    }

    const RouteComp = matched.component;
    const childRouter = this.getRouterForChild(matched);

    return {
      type: 'div',
      __type__: VNodeType.Element,
      props: {
        class: 'router-view',
      },
      children: [
        {
          type: RouteComp,
          __type__: VNodeType.ClassComponent,
          props: {
            router: childRouter,
          },
          children: [],
        },
      ],
    };
  }
}
