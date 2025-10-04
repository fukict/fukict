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
import type { Router } from '../router';

/**
 * RouterView Props
 */
export interface RouterViewProps {
  /** Router 实例 */
  router: Router;
  /** 命名视图名称（用于嵌套路由） */
  name?: string;
}

/**
 * RouterView 组件
 * 负责渲染当前路由匹配的组件，并注入路由上下文
 */
export class RouterView extends Widget<RouterViewProps> {
  private currentComponent: Widget | null = null;
  private unwatch: (() => void) | null = null;
  private containerElement: Element | null = null;

  protected onMounted(): void {
    console.log('[@fukict/router] RouterView onMounted');
    // 获取渲染容器
    this.containerElement = this.root;
    if (!this.containerElement) {
      console.error('[@fukict/router] RouterView container not found');
      return;
    }

    console.log(
      '[@fukict/router] RouterView container:',
      this.containerElement,
    );

    const { router } = this.props;

    // 监听路由变化
    this.unwatch = router.afterEach(() => {
      console.log('[@fukict/router] Route changed');
      this.handleRouteChange();
    });

    // 初始渲染
    this.handleRouteChange();
  }

  protected onUnmounting(): void {
    // 卸载当前路由组件
    if (this.currentComponent && this.currentComponent.isMounted) {
      this.currentComponent.unmount();
      this.currentComponent = null;
    }

    // 取消路由监听
    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }
  }

  /**
   * 处理路由变化
   */
  private handleRouteChange(): void {
    console.log('[@fukict/router] handleRouteChange called');
    if (!this.containerElement) {
      console.error('[@fukict/router] No container element');
      return;
    }

    const { router } = this.props;
    const currentRoute = router.getCurrentRoute();
    console.log('[@fukict/router] Current route:', currentRoute);
    const matched = currentRoute.matched[0]; // 简化处理，取第一个匹配

    // 卸载旧组件
    if (this.currentComponent && this.currentComponent.isMounted) {
      console.log('[@fukict/router] Unmounting old component');
      this.currentComponent.unmount();
      this.currentComponent = null;
    }

    // 清空容器
    this.containerElement.innerHTML = '';

    if (!matched) {
      // 没有匹配的路由，不渲染任何内容
      console.warn('[@fukict/router] No matched route');
      return;
    }

    console.log('[@fukict/router] Matched route:', matched);
    const ComponentClass = matched.component;

    // 检查是否为 Widget 类
    if (!ComponentClass || !(ComponentClass.prototype instanceof Widget)) {
      throw new Error(
        `[@fukict/router] Route component must be a Widget class component. ` +
          `Route: ${currentRoute.name || currentRoute.path}`,
      );
    }

    // 创建新组件实例
    console.log('[@fukict/router] Creating component instance');
    this.currentComponent = new ComponentClass({});

    // 注入 route context（如果是 RouteWidget）
    if (this.currentComponent instanceof RouteWidget) {
      console.log('[@fukict/router] Injecting route context');
      this.injectRouteContext(this.currentComponent, router, currentRoute);
    }

    // 挂载新组件
    console.log('[@fukict/router] Mounting component to container');
    this.currentComponent.mount(this.containerElement, true);
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
