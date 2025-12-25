import { Fukict, type VNode } from '@fukict/basic';

import type { Router } from './Router';
import type {
  Location,
  Route,
  RouteConfig,
  RouteMatch,
  RouteMeta,
  RouteProps,
} from './types';

/**
 * 路由组件基类
 *
 * 提供路由相关的上下文和工具方法
 *
 * @template TParams - 路由参数类型（如 { id: string }）
 * @template TQuery - 查询参数类型（如 { q?: string; page?: string }）
 *
 * @example
 * ```typescript
 * // 定义路由参数类型
 * interface UserParams { id: string }
 * interface UserQuery { tab?: string }
 *
 * class UserPage extends RouteComponent<UserParams, UserQuery> {
 *   render() {
 *     const { id } = this.params;    // ✅ TypeScript 知道 id 存在
 *     const { tab } = this.query;    // ✅ TypeScript 知道 tab 可选
 *   }
 * }
 * ```
 */
export abstract class RouteComponent<
  TParams = Record<string, string>,
  TQuery = Record<string, string>,
> extends Fukict<RouteProps> {
  /**
   * Router 实例
   */
  get router(): Router {
    return this.props.router;
  }

  /**
   * 当前匹配的路由配置
   */
  get matched(): RouteConfig | null {
    return this.router.matched as RouteMatch;
  }

  /**
   * 当前路由对象
   */
  get route(): Route {
    return this.router.currentRoute;
  }

  /**
   * 路由参数（如 { id: '123' }）
   *
   * 类型由泛型 TParams 定义，提供完整的类型提示
   */
  get params(): TParams {
    return this.route.params as TParams;
  }

  /**
   * 查询参数（如 { page: '1' }）
   *
   * 类型由泛型 TQuery 定义，提供完整的类型提示
   */
  get query(): TQuery {
    return this.route.query as TQuery;
  }

  /**
   * 路由元信息
   */
  get meta(): RouteMeta {
    return this.route.meta;
  }

  /**
   * 导航到指定路径（添加历史记录）
   */
  push(location: string | Location): void {
    this.router.push(location);
  }

  /**
   * 替换当前路由（不添加历史记录）
   */
  replace(location: string | Location): void {
    this.router.replace(location);
  }

  /**
   * 返回上一页
   */
  back(): void {
    this.router.back();
  }

  /**
   * 前进到下一页
   */
  forward(): void {
    this.router.forward();
  }

  /**
   * 更新查询参数（保留其他参数）
   */
  updateQuery(query: Partial<TQuery>): void {
    this.push({
      path: this.route.path,
      query: {
        ...this.route.query,
        ...query,
      },
      hash: this.route.hash,
    });
  }

  /**
   * 更新路由参数
   */
  updateParams(params: Partial<TParams>): void {
    const matched = this.matched;
    if (!matched) {
      return;
    }

    // 使用新参数构建路径
    let path = matched.path;
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        path = path.replace(`:${key}`, value);
      }
    }

    this.push({
      path,
      query: this.route.query,
      hash: this.route.hash,
    });
  }

  /**
   * 路由参数变化时的钩子
   * 子类可以重写此方法
   */
  routeParamsChanged?(newParams: TParams, oldParams: TParams): void;

  /**
   * 查询参数变化时的钩子
   * 子类可以重写此方法
   */
  routeQueryChanged?(newQuery: TQuery, oldQuery: TQuery): void;

  /**
   * 重写 update 方法，添加参数变化检测
   */
  update(props: RouteProps): void {
    const oldParams = this.params;
    const oldQuery = this.query;

    // 调用父类的 update
    super.update(props);

    // 检测参数变化
    const newParams = this.params;
    const newQuery = this.query;

    // 检测路由参数变化
    if (this.routeParamsChanged && !this.isParamsEqual(oldParams, newParams)) {
      this.routeParamsChanged(newParams, oldParams);
    }

    // 检测查询参数变化
    if (this.routeQueryChanged && !this.isQueryEqual(oldQuery, newQuery)) {
      this.routeQueryChanged(newQuery, oldQuery);
    }
  }

  /**
   * 比较两个参数对象是否相等
   */
  private isParamsEqual(params1: TParams, params2: TParams): boolean {
    const obj1 = params1 as Record<string, unknown>;
    const obj2 = params2 as Record<string, unknown>;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 比较两个查询参数对象是否相等
   */
  private isQueryEqual(query1: TQuery, query2: TQuery): boolean {
    const obj1 = query1 as Record<string, unknown>;
    const obj2 = query2 as Record<string, unknown>;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 渲染方法（子类必须实现）
   */
  abstract render(): VNode;
}
