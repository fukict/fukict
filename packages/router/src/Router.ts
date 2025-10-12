import { type IHistory, createHistory } from './history';
import { RouteMatcher } from './matcher';
import type {
  Location,
  NavigationGuard,
  Route,
  RouteConfig,
  RouterOptions,
} from './types';

/**
 * 路由变化监听器类型
 */
type RouteListener = () => void;

/**
 * Router 类
 */
export class Router {
  /**
   * 全局单例
   */
  private static instance: Router | null = null;

  /**
   * History 管理器
   */
  private history: IHistory;

  /**
   * 路由匹配器
   */
  private matcher: RouteMatcher;

  /**
   * 当前路由
   */
  public currentRoute: Route;

  /**
   * 路由变化监听器列表
   */
  private listeners: Set<RouteListener> = new Set();

  /**
   * 全局前置守卫
   */
  private beforeEachGuards: NavigationGuard[] = [];

  /**
   * 全局后置钩子
   */
  private afterEachHooks: Array<(to: Route, from: Route) => void> = [];

  /**
   * 路由深度（用于嵌套路由）
   */
  private depth: number;

  /**
   * 配置选项
   */
  private options: RouterOptions;

  /**
   * 构造函数
   * @param options 路由配置选项
   * @param depth 路由深度（用于嵌套路由，内部使用）
   */
  constructor(options: RouterOptions, depth: number = 0) {
    this.options = options;
    this.depth = depth;

    // 使用传入的 history 或创建新的 history 管理器
    this.history = options.history || createHistory(options.mode || 'hash', options.base);

    // 创建路由匹配器
    this.matcher = new RouteMatcher(options.routes);

    // 初始化当前路由
    const initialPath = this.history.getCurrentPath();
    const initialRoute = this.createRoute(initialPath);

    // 检查初始路由是否需要重定向
    if (initialRoute.meta.__redirect__) {
      const redirectPath = initialRoute.meta.__redirect__ as string;
      // 使用 replace 避免产生历史记录
      this.history.replace(redirectPath);
      // 重新创建路由对象
      this.currentRoute = this.createRoute(redirectPath);
    } else {
      this.currentRoute = initialRoute;
    }

    // 注册全局守卫
    if (options.beforeEach) {
      this.beforeEachGuards.push(options.beforeEach);
    }

    if (options.afterEach) {
      this.afterEachHooks.push(options.afterEach);
    }

    // 设置全局单例（仅顶层 Router）
    if (depth === 0) {
      Router.instance = this;
    }
  }

  /**
   * 获取全局 Router 实例
   */
  static getInstance(): Router | null {
    return Router.instance;
  }

  /**
   * 获取当前深度匹配的路由配置
   */
  get matched(): RouteConfig | null {
    return this.currentRoute.matched[this.depth] || null;
  }

  /**
   * 创建子路由（depth + 1）
   */
  createChild(): Router {
    const childRouter = new Router(this.options, this.depth + 1);

    // 子路由共享父路由的 currentRoute
    childRouter.currentRoute = this.currentRoute;

    return childRouter;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.listeners.clear();

    // 清除全局单例
    if (Router.instance === this) {
      Router.instance = null;
    }
  }

  /**
   * 导航到指定路径（由 RouterProvider 调用）
   * 包含守卫逻辑
   */
  async navigate(path: string): Promise<void> {
    const to = this.createRoute(path);
    const from = this.currentRoute;

    // 检查是否需要重定向
    if (to.meta.__redirect__) {
      const redirectPath = to.meta.__redirect__ as string;
      // 使用 replace 避免产生历史记录
      this.history.replace(redirectPath);
      return;
    }

    // 执行导航守卫
    let shouldNavigate = true;
    let redirectPath: string | null = null;

    for (const guard of this.beforeEachGuards) {
      await new Promise<void>(resolve => {
        guard(to, from, (path?: string | false) => {
          if (path === false) {
            shouldNavigate = false;
          } else if (typeof path === 'string') {
            shouldNavigate = false;
            redirectPath = path;
          }
          resolve();
        });
      });

      if (!shouldNavigate) {
        break;
      }
    }

    // 检查路由级守卫
    if (shouldNavigate && to.matched.length > 0) {
      const routeConfig = to.matched[to.matched.length - 1];
      if (routeConfig.beforeEnter) {
        await new Promise<void>(resolve => {
          routeConfig.beforeEnter!(to, from, (path?: string | false) => {
            if (path === false) {
              shouldNavigate = false;
            } else if (typeof path === 'string') {
              shouldNavigate = false;
              redirectPath = path;
            }
            resolve();
          });
        });
      }
    }

    // 处理重定向
    if (redirectPath) {
      this.push(redirectPath);
      return;
    }

    // 如果不允许导航，恢复原路径
    if (!shouldNavigate) {
      // 恢复 history
      this.history.replace(from.path);
      return;
    }

    // 更新当前路由
    this.currentRoute = to;

    // 通知监听器
    this.notify();

    // 执行后置钩子
    for (const hook of this.afterEachHooks) {
      hook(to, from);
    }
  }

  /**
   * 更新路由状态（由 history 监听器调用）
   * 不修改 history，只更新内部状态和执行守卫
   */
  async updateRoute(path: string): Promise<void> {
    const to = this.createRoute(path);
    const from = this.currentRoute;

    // 检查是否需要重定向
    if (to.meta.__redirect__) {
      const redirectPath = to.meta.__redirect__ as string;
      // 重定向需要修改 history
      this.replace(redirectPath);
      return;
    }

    // 执行导航守卫
    let shouldNavigate = true;
    let redirectPath: string | null = null;

    for (const guard of this.beforeEachGuards) {
      await new Promise<void>(resolve => {
        guard(to, from, (path?: string | false) => {
          if (path === false) {
            shouldNavigate = false;
          } else if (typeof path === 'string') {
            shouldNavigate = false;
            redirectPath = path;
          }
          resolve();
        });
      });

      if (!shouldNavigate) {
        break;
      }
    }

    // 检查路由级守卫
    if (shouldNavigate && to.matched.length > 0) {
      const routeConfig = to.matched[to.matched.length - 1];
      if (routeConfig.beforeEnter) {
        await new Promise<void>(resolve => {
          routeConfig.beforeEnter!(to, from, (path?: string | false) => {
            if (path === false) {
              shouldNavigate = false;
            } else if (typeof path === 'string') {
              shouldNavigate = false;
              redirectPath = path;
            }
            resolve();
          });
        });
      }
    }

    // 处理重定向（守卫返回的重定向）
    if (redirectPath) {
      this.replace(redirectPath);
      return;
    }

    // 如果不允许导航，恢复原路径
    if (!shouldNavigate) {
      // 恢复 history
      this.history.replace(from.path);
      return;
    }

    // 更新当前路由
    this.currentRoute = to;

    // 通知监听器
    this.notify();

    // 执行后置钩子
    for (const hook of this.afterEachHooks) {
      hook(to, from);
    }
  }

  /**
   * 创建路由对象
   */
  private createRoute(fullPath: string): Route {
    // 分离路径、查询参数和 hash
    const { path, query, hash } = this.parseLocation(fullPath);

    // 匹配路由
    const matches = this.matcher.match(path);

    if (matches && matches.length > 0) {
      // 使用最后一个匹配（叶子路由）的配置和参数
      const leafMatch = matches[matches.length - 1];

      // 处理 redirect（强制跳转，改变 URL）
      if (leafMatch.config.redirect) {
        return {
          path,
          query,
          hash,
          params: leafMatch.params,
          meta: { ...leafMatch.config.meta, __redirect__: leafMatch.config.redirect },
          matched: matches.map(m => m.config),
        };
      }

      // 构建 matched 数组
      const matchedConfigs = matches.map(m => m.config);

      return {
        path,
        query,
        hash,
        params: leafMatch.params,
        meta: leafMatch.config.meta || {},
        matched: matchedConfigs,
      };
    }

    // 未匹配到路由
    return {
      path,
      query,
      hash,
      params: {},
      meta: {},
      matched: [],
    };
  }

  /**
   * 解析 Location 字符串
   */
  private parseLocation(fullPath: string): {
    path: string;
    query: Record<string, string>;
    hash: string;
  } {
    const query: Record<string, string> = {};

    let path = fullPath;
    let hash = '';

    // 提取 hash
    const hashIndex = path.indexOf('#');
    if (hashIndex !== -1) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }

    // 提取查询参数
    const queryIndex = path.indexOf('?');
    if (queryIndex !== -1) {
      const queryString = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);

      // 解析查询参数
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        query[key] = value;
      });
    }

    return { path, query, hash };
  }

  /**
   * 构建完整路径
   */
  private buildPath(location: string | Location): string {
    if (typeof location === 'string') {
      return location;
    }

    let path = location.path || this.currentRoute.path;

    // 合并查询参数
    const query = location.query || this.currentRoute.query;
    const queryString = this.stringifyQuery(query);
    if (queryString) {
      path += '?' + queryString;
    }

    // 添加 hash
    const hash = location.hash || this.currentRoute.hash;
    if (hash) {
      path += hash;
    }

    return path;
  }

  /**
   * 序列化查询参数
   */
  private stringifyQuery(query: Record<string, string>): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      params.append(key, value);
    }

    return params.toString();
  }

  /**
   * 导航到指定路径（添加历史记录）
   */
  push(location: string | Location): void {
    const path = this.buildPath(location);
    this.history.push(path);
  }

  /**
   * 替换当前路由（不添加历史记录）
   */
  replace(location: string | Location): void {
    const path = this.buildPath(location);
    this.history.replace(path);
  }

  /**
   * 返回上一页
   */
  back(): void {
    this.history.back();
  }

  /**
   * 前进到下一页
   */
  forward(): void {
    this.history.forward();
  }

  /**
   * 注册前置守卫
   */
  beforeEach(guard: NavigationGuard): void {
    this.beforeEachGuards.push(guard);
  }

  /**
   * 注册后置钩子
   */
  afterEach(hook: (to: Route, from: Route) => void): void {
    this.afterEachHooks.push(hook);
  }

  /**
   * 订阅路由变化
   */
  subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);

    // 返回取消订阅函数
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 通知监听器
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
