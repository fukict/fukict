import type { RouteConfig, RouteMatch } from './types';

/**
 * 路径段的接口
 */
interface PathSegment {
  /**
   * 是否是动态参数
   */
  isDynamic: boolean;

  /**
   * 参数名（如果是动态参数）
   */
  paramName?: string;

  /**
   * 静态值（如果是静态段）
   */
  value?: string;

  /**
   * 是否是通配符
   */
  isWildcard: boolean;
}

/**
 * 编译后的路由配置
 */
interface CompiledRoute {
  /**
   * 原始路由配置
   */
  config: RouteConfig;

  /**
   * 路径段列表
   */
  segments: PathSegment[];

  /**
   * 正则表达式（用于匹配）
   */
  regex: RegExp;

  /**
   * 参数名列表
   */
  paramNames: string[];

  /**
   * 完整路径（用于调试和排序）
   */
  fullPath: string;

  /**
   * 优先级分数（用于排序，数值越高优先级越高）
   */
  priority: number;
}

/**
 * 路由匹配器
 */
export class RouteMatcher {
  /**
   * 编译后的路由列表
   */
  private compiledRoutes: CompiledRoute[] = [];

  /**
   * 原始路由配置（保留用于构建匹配链）
   */
  private routes: RouteConfig[];

  /**
   * 构造函数
   * @param routes 路由配置列表
   * @param parentPath 父路径（用于嵌套路由）
   */
  constructor(routes: RouteConfig[], parentPath: string = '') {
    this.routes = routes;
    this.compile(routes, parentPath);
  }

  /**
   * 编译路由配置
   *
   * 支持两种路径配置方式：
   * 1. 绝对路径：以 "/" 开头，如 "/home", "/user/:id"
   * 2. 相对路径：不以 "/" 开头，会自动拼接父路径，如 "home", "user/:id"
   *
   * 特殊情况：
   * - 空字符串 "" 表示 index 路由，匹配父路径本身
   */
  private compile(routes: RouteConfig[], parentPath: string): void {
    for (const route of routes) {
      // 计算完整路径
      const fullPath = this.resolvePath(parentPath, route.path);
      const compiled = this.compileRoute(route, fullPath);
      this.compiledRoutes.push(compiled);

      // 递归编译子路由
      if (route.children && route.children.length > 0) {
        const childMatcher = new RouteMatcher(route.children, fullPath);
        // 将子路由的编译结果合并到当前列表
        this.compiledRoutes.push(...childMatcher.compiledRoutes);
      }
    }

    // 按优先级排序（只在顶层排序一次）
    if (parentPath === '') {
      this.sortByPriority();
    }
  }

  /**
   * 解析路径（支持相对路径和绝对路径）
   *
   * @param parentPath 父路径
   * @param childPath 子路径（可以是相对或绝对路径）
   * @returns 规范化后的完整路径
   */
  private resolvePath(parentPath: string, childPath: string): string {
    // 空字符串表示 index 路由，返回父路径
    if (childPath === '') {
      return this.normalizePath(parentPath || '/');
    }

    // 绝对路径（以 "/" 开头）：保持原有行为，直接拼接
    if (childPath.startsWith('/')) {
      return this.normalizePath(parentPath + childPath);
    }

    // 相对路径：拼接父路径和子路径
    const separator = parentPath.endsWith('/') ? '' : '/';
    return this.normalizePath(parentPath + separator + childPath);
  }

  /**
   * 按优先级排序编译后的路由
   *
   * 优先级规则：
   * 1. 静态路径 > 动态参数 > 通配符
   * 2. 路径段数越多优先级越高（更具体的匹配）
   * 3. 同等条件下，按定义顺序（先定义的优先）
   */
  private sortByPriority(): void {
    this.compiledRoutes.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 计算路由的优先级分数
   *
   * 优先级规则（从高到低）：
   * 1. 静态路径 > 动态参数 > 通配符
   * 2. 更长的路径 > 更短的路径（但通配符除外）
   * 3. 叶子路由 > 有子路由的父路由
   *
   * @param segments 路径段列表
   * @param config 路由配置（用于检查是否有子路由）
   */
  private calculatePriority(
    segments: PathSegment[],
    config: RouteConfig,
  ): number {
    // 检查是否包含通配符
    const hasWildcard = segments.some(s => s.isWildcard);

    // 通配符路由的基础优先级最低
    if (hasWildcard) {
      return -1000;
    }

    let priority = 0;

    // 基础分数：静态路径段数量（index 路由也算静态）
    // 即使 segments 为空（index 路由），也给基础分
    priority += 1000;

    // 每个段的类型分数
    for (const segment of segments) {
      if (segment.isDynamic) {
        // 动态参数中等优先级
        priority += 10;
      } else {
        // 静态段最高优先级
        priority += 50;
      }
    }

    // 有子路由的父路由优先级降低
    // 这样 index 子路由（没有子路由）会优先匹配
    if (config.children && config.children.length > 0) {
      priority -= 1;
    }

    return priority;
  }

  /**
   * 编译单个路由配置
   */
  private compileRoute(config: RouteConfig, fullPath: string): CompiledRoute {
    const segments: PathSegment[] = [];
    const paramNames: string[] = [];

    // 分割路径为段
    const parts = fullPath.split('/').filter(part => part !== '');

    for (const part of parts) {
      if (part === '*') {
        // 通配符
        segments.push({ isDynamic: false, isWildcard: true });
      } else if (part.startsWith(':')) {
        // 动态参数
        const paramName = part.slice(1);
        segments.push({ isDynamic: true, paramName, isWildcard: false });
        paramNames.push(paramName);
      } else {
        // 静态段
        segments.push({ isDynamic: false, value: part, isWildcard: false });
      }
    }

    // 构建正则表达式
    const regex = this.buildRegex(segments);

    // 计算优先级
    const priority = this.calculatePriority(segments, config);

    return {
      config,
      segments,
      regex,
      paramNames,
      fullPath,
      priority,
    };
  }

  /**
   * 构建路由匹配的正则表达式
   */
  private buildRegex(segments: PathSegment[]): RegExp {
    if (segments.length === 0) {
      // 根路径
      return /^\/$/;
    }

    let pattern = '^';

    for (const segment of segments) {
      pattern += '\\/';

      if (segment.isWildcard) {
        // 通配符匹配任意内容
        pattern += '.*';
      } else if (segment.isDynamic) {
        // 动态参数匹配非 / 字符
        pattern += '([^/]+)';
      } else {
        // 静态段精确匹配
        pattern += this.escapeRegex(segment.value!);
      }
    }

    // 如果最后一个段是通配符，不需要 $
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment?.isWildcard) {
      pattern += '\\/?$';
    }

    return new RegExp(pattern);
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 规范化路径
   */
  private normalizePath(path: string): string {
    // 确保路径以 / 开头
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // 移除末尾的 /（除非是根路径）
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // 移除重复的 /
    path = path.replace(/\/+/g, '/');

    return path;
  }

  /**
   * 匹配路径
   * @param path 要匹配的路径
   * @returns 匹配结果列表（从顶层到当前层级）
   */
  match(path: string): RouteMatch[] | null {
    path = this.normalizePath(path);

    for (const compiled of this.compiledRoutes) {
      const match = compiled.regex.exec(path);

      if (match) {
        // 提取参数
        const params: Record<string, string> = {};

        for (let i = 0; i < compiled.paramNames.length; i++) {
          const paramName = compiled.paramNames[i];
          const paramValue = match[i + 1];
          params[paramName] = decodeURIComponent(paramValue);
        }

        // 构建匹配结果
        const matches = this.buildMatchChain(compiled.config, path, params);

        return matches;
      }
    }

    return null;
  }

  /**
   * 构建匹配链（从顶层到当前层级）
   */
  private buildMatchChain(
    config: RouteConfig,
    path: string,
    params: Record<string, string>,
  ): RouteMatch[] {
    const matches: RouteMatch[] = [];

    // 递归查找父路由链
    const findParentChain = (
      targetConfig: RouteConfig,
      routes: RouteConfig[],
    ): RouteConfig[] | null => {
      for (const route of routes) {
        if (route === targetConfig) {
          return [route];
        }

        if (route.children && route.children.length > 0) {
          const childChain = findParentChain(targetConfig, route.children);
          if (childChain) {
            return [route, ...childChain];
          }
        }
      }

      return null;
    };

    // 从根路由开始查找匹配链
    const chain = findParentChain(config, this.routes);

    if (chain) {
      // 构建每个层级的 RouteMatch
      for (const routeConfig of chain) {
        matches.push({
          config: routeConfig,
          params,
          path,
        });
      }
    } else {
      // 如果找不到完整链，至少返回当前匹配
      matches.push({
        config,
        params,
        path,
      });
    }

    return matches;
  }

  /**
   * 根据路由名称查找路由配置
   */
  findByName(name: string): RouteConfig | null {
    for (const compiled of this.compiledRoutes) {
      if (compiled.config.name === name) {
        return compiled.config;
      }
    }
    return null;
  }

  /**
   * 生成路径（根据路由配置和参数）
   */
  buildPath(config: RouteConfig, params: Record<string, string> = {}): string {
    let path = config.path;

    // 替换动态参数
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }

    return this.normalizePath(path);
  }
}
