import { Fukict, type VNode } from '@fukict/basic';

import type { Router } from './Router';
import type { Location, Route, RouteConfig, RouteProps } from './types';

/**
 * 路由组件基类
 *
 * 提供路由相关的上下文和工具方法
 */
export abstract class RouteComponent extends Fukict<RouteProps> {
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
    return this.router.matched;
  }

  /**
   * 当前路由对象
   */
  get route(): Route {
    return this.router.currentRoute;
  }

  /**
   * 路由参数（如 { id: '123' }）
   */
  get params(): Record<string, string> {
    return this.route.params;
  }

  /**
   * 查询参数（如 { page: '1' }）
   */
  get query(): Record<string, string> {
    return this.route.query;
  }

  /**
   * 路由元信息
   */
  get meta(): Record<string, any> {
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
  updateQuery(query: Record<string, string>): void {
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
  updateParams(params: Record<string, string>): void {
    const matched = this.matched;
    if (!matched) {
      return;
    }

    // 使用新参数构建路径
    let path = matched.path;
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
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
  routeParamsChanged?(
    newParams: Record<string, string>,
    oldParams: Record<string, string>,
  ): void;

  /**
   * 查询参数变化时的钩子
   * 子类可以重写此方法
   */
  routeQueryChanged?(
    newQuery: Record<string, string>,
    oldQuery: Record<string, string>,
  ): void;

  /**
   * 重写 update 方法，添加参数变化检测
   */
  update(props?: Partial<RouteProps>): void {
    const oldParams = this.params;
    const oldQuery = this.query;

    // 调用父类的 update
    super.update(props as any);

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
  private isParamsEqual(
    params1: Record<string, string>,
    params2: Record<string, string>,
  ): boolean {
    const keys1 = Object.keys(params1);
    const keys2 = Object.keys(params2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (params1[key] !== params2[key]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 比较两个查询参数对象是否相等
   */
  private isQueryEqual(
    query1: Record<string, string>,
    query2: Record<string, string>,
  ): boolean {
    const keys1 = Object.keys(query1);
    const keys2 = Object.keys(query2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (query1[key] !== query2[key]) {
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
