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
   */
  private compile(routes: RouteConfig[], parentPath: string): void {
    for (const route of routes) {
      const fullPath = this.normalizePath(parentPath + route.path);
      const compiled = this.compileRoute(route, fullPath);
      this.compiledRoutes.push(compiled);

      // 递归编译子路由
      if (route.children && route.children.length > 0) {
        const childMatcher = new RouteMatcher(route.children, fullPath);
        // 将子路由的编译结果合并到当前列表
        this.compiledRoutes.push(...childMatcher.compiledRoutes);
      }
    }
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

    return {
      config,
      segments,
      regex,
      paramNames,
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
