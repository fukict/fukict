/**
 * RouterView 组件
 * 渲染当前路由匹配的组件
 *
 * @fileoverview RouterView 核心组件实现
 * @module @fukict/router/components/router-view
 */
import { jsx } from '@fukict/runtime/jsx-runtime';
import { Widget } from '@fukict/widget';

import { RouteWidget } from '../route-widget';
import type { Router, IRouterView } from '../router';

/**
 * RouterView Props
 */
export interface RouterViewProps {
  /** Router 实例 */
  router: Router;
  /** 命名视图名称（用于嵌套路由，暂未实现） */
  name?: string;
}

/**
 * RouterView 组件
 * 负责渲染当前路由匹配的组件，并注入路由上下文
 */
export class RouterView extends Widget<RouterViewProps> implements IRouterView {
  private currentComponent: Widget | null = null;
  private currentRouteName: string | null = null;
  private containerElement: Element | null = null;

  // 父子关联（每个深度同时只有一个活跃的子路由）
  private parentRouterView: IRouterView | null = null;
  private childRouterView: IRouterView | null = null;

  // 监听器（仅根 RouterView 需要）
  private unwatch: (() => void) | null = null;

  protected onMounted(): void {
    const { router } = this.props;

    // 获取渲染容器
    this.containerElement = this.root;
    if (!this.containerElement) {
      return;
    }

    // 从 router 栈获取父级
    this.parentRouterView = router.getCurrentParentRouterView();

    // 如果是子 RouterView，注册到父级
    if (this.parentRouterView) {
      this.parentRouterView.registerChild(this);
    }

    // 先完成初始渲染
    this.renderRoute();

    // 只有根 RouterView 在初始渲染后监听路由变化
    if (!this.parentRouterView) {
      this.unwatch = router.afterEach(() => {
        this.checkAndUpdate();
      });
    }
  }

  protected onUnmounting(): void {
    // 从父级注销
    if (this.parentRouterView) {
      this.parentRouterView.unregisterChild(this);
      this.parentRouterView = null;
    }

    // 取消路由监听
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }

    // 清理整个组件树（自下往上）
    this.cleanup();
  }

  /**
   * 注册子 RouterView（实现 IRouterView 接口）
   */
  registerChild(child: IRouterView): void {
    this.childRouterView = child;
  }

  /**
   * 注销子 RouterView（实现 IRouterView 接口）
   */
  unregisterChild(child: IRouterView): void {
    if (this.childRouterView === child) {
      this.childRouterView = null;
    }
  }

  /**
   * 计算当前 RouterView 的深度（通过遍历 parent 链）
   */
  private calculateDepth(): number {
    let depth = 0;
    let parent = this.parentRouterView;
    while (parent) {
      depth++;
      parent = (parent as RouterView).parentRouterView;
    }
    return depth;
  }

  /**
   * 获取当前层应该渲染的路由
   */
  private getMatchedRoute() {
    const depth = this.calculateDepth();
    const currentRoute = this.props.router.getCurrentRoute();
    return currentRoute.matched[depth] || null;
  }

  /**
   * 清理：自下往上卸载组件
   * 实现 IRouterView 接口
   */
  cleanup(): void {
    console.log('Cleaning up RouterView at depth:', !this.currentComponent?.isMounted);
    // 1. 判断是否需要清理
    if (!this.currentComponent?.isMounted) {
      return;
    }

    // 2. 先递归清理子级
    if (this.childRouterView) {
      console.info('Exist children of route component:', this.currentRouteName);
      this.childRouterView.cleanup();
      this.childRouterView = null;
    }

    console.info('Unmounting route component:', this.currentRouteName);
    // 3. 卸载自己的组件
    this.currentComponent.unmount();
    this.currentComponent = null;
    this.currentRouteName = null;
  }

  /**
   * 检查并更新：判断当前层是否需要更新
   * 实现 IRouterView 接口
   */
  checkAndUpdate(): void {
    const matched = this.getMatchedRoute();

    // 1. 没有匹配的路由，清理
    if (!matched) {
      this.cleanup();
      return;
    }

    // 2. 当前层未变化，通知子级检查
    if (this.currentRouteName === matched.name) {
      if (this.childRouterView) {
        this.childRouterView.checkAndUpdate();
      }
      return;
    }

    // 3. 当前层变化，清理旧组件并重新渲染
    this.cleanup();
    this.renderRoute();
  }

  /**
   * 渲染：创建并挂载组件
   */
  private renderRoute(): void {
    if (!this.isMounted || !this.containerElement) {
      return;
    }

    const { router } = this.props;
    const matched = this.getMatchedRoute();

    // 没有匹配的路由，跳过
    if (!matched) {
      return;
    }

    const ComponentClass = matched.component;
    this.currentRouteName = matched.name;

    // 检查是否为 Widget 类
    if (!ComponentClass || !(ComponentClass.prototype instanceof Widget)) {
      throw new Error(
        `[@fukict/router] Route component must be a Widget class component. ` +
          `Route: ${matched.name || matched.path}`,
      );
    }

    // 1. 压入栈（让子 RouterView 能找到自己）
    router.pushRouterView(this);

    try {
      // 2. 创建并挂载组件
      this.currentComponent = new ComponentClass({});

      // 注入 route context（如果是 RouteWidget）
      if (this.currentComponent instanceof RouteWidget) {
        const currentRoute = router.getCurrentRoute();
        this.injectRouteContext(this.currentComponent, router, currentRoute);
      }

      this.currentComponent.mount(this.containerElement, true);
    } catch (error) {
      // 渲染失败，清理状态
      this.currentRouteName = null;
      throw error;
    } finally {
      // 3. 弹出栈
      router.popRouterView();
    }
  }

  /**
   * 注入路由上下文到组件
   */
  private injectRouteContext(
    component: RouteWidget,
    router: Router,
    route: any,
  ): void {
    component.route = {
      router,
      name: route.name,
      path: route.path,
      params: route.params,
      query: route.query,
      hash: route.hash,
      fullPath: route.fullPath,
      matched: route.matched,
      meta: route.meta,
      push: router.push.bind(router),
      replace: router.replace.bind(router),
      back: router.back.bind(router),
      forward: router.forward.bind(router),
      go: router.go.bind(router),
    };
  }

  render(): any {
    // 返回一个空的容器 div
    // 实际的路由组件会在 onMounted 和 handleRouteChange 中动态挂载
    return jsx('div', { class: 'router-view-container' }, null);
  }
}
