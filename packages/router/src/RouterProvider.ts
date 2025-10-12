import { Fukict, type VNode, h } from '@fukict/basic';

import { Router } from './Router';
import { RouterView } from './RouterView';
import { type IHistory, createHistory } from './history';
import type { RouterProviderProps } from './types';

/**
 * RouterProvider 组件
 *
 * 顶层路由组件，负责：
 * 1. 创建 Router 实例
 * 2. 创建 History 实例并监听 URL 变化
 * 3. URL 变化时：
 *    - 调用 router.updateRoute() 更新 Router 内部状态
 *    - 调用 this.update() 触发自己重新渲染
 * 4. 通过 props 传递 router 给子组件，依赖框架的 diff 机制
 */
export class RouterProvider extends Fukict<RouterProviderProps> {
  /**
   * Router 实例
   */
  private router: Router | null = null;

  /**
   * History 实例
   */
  private history: IHistory | null = null;

  /**
   * 取消 history 监听函数
   */
  private unlisten: (() => void) | null = null;

  constructor(props: RouterProviderProps) {
    super(props);

    // 创建 History 实例
    this.history = createHistory(this.props.mode || 'hash', this.props.base);

    // 创建 Router 实例，传入 history
    this.router = new Router({
      routes: this.props.routes,
      mode: this.props.mode || 'hash',
      base: this.props.base,
      beforeEach: this.props.beforeEach,
      afterEach: this.props.afterEach,
      history: this.history, // 传入 history 实例
    });
  }
  /**
   * 组件挂载时
   */
  mounted(): void {
    if (!this.history) return;

    // 监听 history 变化
    this.unlisten = this.history.listen((path: string) => {
      if (!this.router) return;

      // 调用 updateRoute 更新路由状态（不会再修改 history）
      this.router.updateRoute(path).then(() => {
        // 路由更新完成后，触发重新渲染
        this.update();
      });
    });
  }

  /**
   * 组件卸载前
   */
  beforeUnmount(): void {
    // 取消 history 监听
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }

    // 销毁 Router 实例
    if (this.router) {
      this.router.destroy();
      this.router = null;
    }

    // 清空 History 实例
    this.history = null;
  }

  /**
   * 渲染方法
   */
  render(): VNode {
    if (!this.router) {
      // Router 未初始化，渲染空 div
      return h('div', { class: 'router-provider' }, []);
    }

    // 依赖框架的 diff 机制，router 作为 props 传递给 RouterView
    return h('div', { class: 'router-provider' }, [
      h(
        RouterView,
        {
          router: this.router,
          fallback: this.props.fallback,
        },
        [],
      ),
    ]);
  }
}
