/**
 * RouteWidget 基类
 * 所有路由组件必须继承此类
 *
 * @fileoverview 路由组件基类，提供路由上下文访问
 * @module @fukict/router/route-widget
 */
import { Widget } from '@fukict/widget';

import type { Router } from './router';
import type { RouteContext } from './types';

/**
 * 路由组件基类
 * 所有路由组件必须继承此类以获得路由上下文
 *
 * @example
 * ```typescript
 * class User extends RouteWidget<{}, AppRouter> {
 *   componentDidMount() {
 *     console.log('User ID:', this.params.id);
 *   }
 *
 *   render() {
 *     return <div>User: {this.params.id}</div>;
 *   }
 * }
 * ```
 */
export abstract class RouteWidget<
  Props = {},
  R extends Router = Router,
> extends Widget<Props> {
  /**
   * 路由上下文
   * 由 RouterView 注入，包含当前路由信息和 router 实例
   */
  route!: RouteContext<R>;

  /**
   * 便捷访问 router 实例
   */
  get router(): R {
    if (!this.route) {
      throw new Error(
        '[@fukict/router] Route context not available. ' +
          'Make sure this component is rendered by RouterView.',
      );
    }
    return this.route.router;
  }

  /**
   * 便捷访问路由参数
   */
  get params(): Record<string, string> {
    if (!this.route) {
      return {};
    }
    return this.route.params;
  }

  /**
   * 便捷访问查询参数
   */
  get query(): Record<string, string> {
    if (!this.route) {
      return {};
    }
    return this.route.query;
  }

  /**
   * 便捷访问路由元信息
   */
  get meta(): Record<string, any> {
    if (!this.route) {
      return {};
    }
    return this.route.meta;
  }
}
