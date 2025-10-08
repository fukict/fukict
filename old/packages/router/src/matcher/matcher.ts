/**
 * 路由匹配器
 * 实现高效的路由匹配算法：静态路由 → 动态路由 → 通配符路由
 *
 * @fileoverview 路由匹配核心逻辑
 * @module @fukict/router/matcher/matcher
 */
import type { RouteDefinitions, RouteMatch, RouteRecord } from '../types';
import { PathParser } from './path-parser';

/**
 * 动态路由条目
 */
interface DynamicRoute {
  record: RouteRecord;
  regex: RegExp;
  keys: string[];
}

/**
 * 路由匹配器类
 */
export class RouteMatcher {
  // 静态路由表（最高优先级，O(1) 查找）
  private staticRoutes: Map<string, RouteRecord>;

  // 动态路由列表（按路径段数量排序）
  private dynamicRoutes: DynamicRoute[];

  // 通配符路由（最低优先级）
  private wildcardRoute: RouteRecord | null;

  // 路径解析器
  private parser: PathParser;

  // 所有路由记录（用于查找）
  private allRoutes: Map<string, RouteRecord>;

  constructor(routes: RouteDefinitions) {
    this.staticRoutes = new Map();
    this.dynamicRoutes = [];
    this.wildcardRoute = null;
    this.parser = new PathParser();
    this.allRoutes = new Map();

    this.buildRouteTables(routes);
  }

  /**
   * 匹配路径
   *
   * @param path - 要匹配的路径
   * @returns 匹配结果，如果没有匹配则返回 null
   *
   * @algorithm
   * 1. 先查找静态路由（O(1)）
   * 2. 再查找动态路由（线性扫描，但已排序）
   * 3. 最后匹配通配符路由
   */
  match(path: string): RouteMatch | null {
    // 规范化路径
    const normalizedPath = this.parser.normalizePath(path);

    // 1. 静态路由匹配（最快）
    const staticMatch = this.staticRoutes.get(normalizedPath);
    if (staticMatch) {
      return { route: staticMatch, params: {} };
    }

    // 2. 动态路由匹配
    for (const dynamicRoute of this.dynamicRoutes) {
      const match = dynamicRoute.regex.exec(normalizedPath);
      if (match) {
        const params = this.parser.extractParams(match, dynamicRoute.keys);
        return { route: dynamicRoute.record, params };
      }
    }

    // 3. 通配符路由匹配
    if (this.wildcardRoute) {
      return { route: this.wildcardRoute, params: {} };
    }

    return null;
  }

  /**
   * 根据名称获取路由记录
   *
   * @param name - 路由名称
   * @returns 路由记录，如果不存在则返回 undefined
   */
  getRouteByName(name: string): RouteRecord | undefined {
    return this.allRoutes.get(name);
  }

  /**
   * 获取所有路由记录
   */
  getAllRoutes(): RouteRecord[] {
    return Array.from(this.allRoutes.values());
  }

  /**
   * 检查是否存在指定名称的路由
   */
  hasRoute(name: string): boolean {
    return this.allRoutes.has(name);
  }

  /**
   * 构建路由表
   */
  private buildRouteTables(
    routes: RouteDefinitions,
    parent?: RouteRecord,
    parentName?: string,
  ): void {
    for (const [name, definition] of Object.entries(routes)) {
      // 构建完整的路由名称（使用点分隔，如 'runtime.hello-world'）
      const fullName = parentName ? `${parentName}.${name}` : name;

      // 构建路由路径（考虑嵌套）
      const fullPath = parent
        ? this.parser.joinPath(parent.path, definition.path)
        : this.parser.normalizePath(definition.path);

      // 创建路由记录
      const record: RouteRecord = {
        name: fullName,
        path: fullPath,
        regex: null,
        keys: [],
        component: definition.component,
        beforeEnter: definition.beforeEnter,
        parent,
        children: [],
        meta: definition.meta || {},
      };

      // 添加到所有路由集合
      this.allRoutes.set(fullName, record);

      // 根据路径类型分类存储
      if (this.parser.isStatic(fullPath)) {
        // 静态路由
        this.staticRoutes.set(fullPath, record);
      } else if (this.parser.isWildcard(fullPath)) {
        // 通配符路由
        this.wildcardRoute = record;
      } else {
        // 动态路由
        const compiled = this.parser.compilePath(fullPath);
        record.regex = compiled.regex;
        record.keys = compiled.keys;

        this.dynamicRoutes.push({
          record,
          regex: compiled.regex,
          keys: compiled.keys,
        });
      }

      // 处理子路由
      if (definition.children) {
        this.buildRouteTables(definition.children, record, fullName);
      }
    }

    // 动态路由按路径段数量排序（更具体的路径优先）
    this.dynamicRoutes.sort((a, b) => {
      // 参数数量多的优先级高
      if (a.keys.length !== b.keys.length) {
        return b.keys.length - a.keys.length;
      }

      // 路径长度长的优先级高
      return b.record.path.length - a.record.path.length;
    });
  }
}
