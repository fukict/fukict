/**
 * Router 核心类
 * 路由系统的中心管理器，负责路由匹配、导航控制和守卫执行
 *
 * @fileoverview Router 核心实现
 * @module @fukict/router/router
 */
import { HTML5History, HashHistory } from './history';
import { RouteMatcher } from './matcher';
import { PathParser } from './matcher/path-parser';
import type {
  History,
  NavigationGuard,
  NavigationHook,
  RouteDefinitions,
  RouteLocation,
  RouteLocationRaw,
  RouteRecord,
  RouterOptions,
} from './types';

/**
 * RouterView 接口（用于栈管理，避免循环依赖）
 */
export interface IRouterView {
  checkAndUpdate(): void;
  registerChild(child: IRouterView): void;
  unregisterChild(child: IRouterView): void;
  /**
   * 清理当前 RouterView 及其所有子路由的组件
   */
  cleanup(): void;
}

/**
 * Router 类
 */
export class Router<Routes extends RouteDefinitions = RouteDefinitions> {
  private matcher: RouteMatcher;
  private parser: PathParser;
  private history: History;
  private currentRoute: RouteLocation;
  private beforeEachGuards: NavigationGuard[];
  private afterEachHooks: NavigationHook[];
  private isReady: boolean;
  private unlisten: (() => void) | null;

  // RouterView 渲染栈
  private routerViewStack: IRouterView[] = [];

  constructor(options: RouterOptions & { routes: Routes }) {
    const { mode = 'hash', routes, base = '', beforeEach, afterEach } = options;

    // 初始化匹配器
    this.matcher = new RouteMatcher(routes);
    this.parser = new PathParser();

    // 初始化历史管理
    this.history =
      mode === 'history' ? new HTML5History(base) : new HashHistory();

    // 初始化守卫
    this.beforeEachGuards = beforeEach ? [beforeEach] : [];
    this.afterEachHooks = afterEach ? [afterEach] : [];

    // 初始化状态
    this.isReady = false;
    this.unlisten = null;

    // 初始化当前路由
    this.currentRoute = this.createRouteLocation(this.history.location);
  }

  /**
   * 启动路由器
   * 开始监听历史变化并执行初始导航
   */
  start(): void {
    if (this.isReady) {
      console.warn('[@fukict/router] Router is already started');
      return;
    }

    // 开始监听历史变化
    this.unlisten = this.history.listen(location => {
      this.handleLocationChange(location);
    });

    this.isReady = true;

    // 执行初始导航（触发守卫和钩子）
    this.handleLocationChange(this.history.location);
  }

  /**
   * 获取当前路由
   */
  getCurrentRoute(): RouteLocation {
    return this.currentRoute;
  }

  /**
   * 命名路由导航
   */
  async push(
    name: keyof Routes,
    params?: Record<string, any>,
    query?: Record<string, any>,
  ): Promise<void>;

  /**
   * 对象导航
   */
  async push(location: RouteLocationRaw): Promise<void>;

  /**
   * 实现
   */
  async push(...args: any[]): Promise<void> {
    const location = this.normalizeLocation(...args);
    await this.navigate(location, false);
  }

  /**
   * 命名路由替换
   */
  async replace(
    name: keyof Routes,
    params?: Record<string, any>,
    query?: Record<string, any>,
  ): Promise<void>;

  /**
   * 对象替换
   */
  async replace(location: RouteLocationRaw): Promise<void>;

  /**
   * 实现
   */
  async replace(...args: any[]): Promise<void> {
    const location = this.normalizeLocation(...args);
    await this.navigate(location, true);
  }

  /**
   * 前进/后退
   */
  go(delta: number): void {
    this.history.go(delta);
  }

  /**
   * 后退
   */
  back(): void {
    this.go(-1);
  }

  /**
   * 前进
   */
  forward(): void {
    this.go(1);
  }

  /**
   * 注册全局前置守卫
   */
  beforeEach(guard: NavigationGuard): () => void {
    this.beforeEachGuards.push(guard);

    // 返回取消注册函数
    return () => {
      const index = this.beforeEachGuards.indexOf(guard);
      if (index > -1) {
        this.beforeEachGuards.splice(index, 1);
      }
    };
  }

  /**
   * 注册全局后置钩子
   */
  afterEach(hook: NavigationHook): () => void {
    this.afterEachHooks.push(hook);

    // 返回取消注册函数
    return () => {
      const index = this.afterEachHooks.indexOf(hook);
      if (index > -1) {
        this.afterEachHooks.splice(index, 1);
      }
    };
  }

  /**
   * 解析路由位置
   */
  resolve(
    name: keyof Routes,
    params?: Record<string, any>,
  ): RouteLocation | null {
    const route = this.matcher.getRouteByName(name as string);
    if (!route) {
      return null;
    }

    // 构建路径
    let path = route.path;
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, String(value));
      }
    }

    return this.createRouteLocation(path);
  }

  /**
   * 检查是否存在路由
   */
  hasRoute(name: string): boolean {
    return this.matcher.hasRoute(name);
  }

  /**
   * 获取所有路由
   */
  getRoutes() {
    return this.matcher.getAllRoutes();
  }

  /**
   * 获取当前父 RouterView
   */
  getCurrentParentRouterView(): IRouterView | null {
    return this.routerViewStack[this.routerViewStack.length - 1] ?? null;
  }

  /**
   * 获取下一层的 depth
   */
  getNextDepth(): number {
    return this.routerViewStack.length;
  }

  /**
   * 将 RouterView 压入渲染栈
   */
  pushRouterView(view: IRouterView): void {
    this.routerViewStack.push(view);
  }

  /**
   * 从渲染栈弹出 RouterView
   */
  popRouterView(): void {
    this.routerViewStack.pop();
  }

  /**
   * 销毁路由器
   */
  destroy(): void {
    // 停止监听
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }

    this.history.destroy();
    this.beforeEachGuards = [];
    this.afterEachHooks = [];
    this.isReady = false;
  }

  /**
   * 处理位置变化
   */
  private async handleLocationChange(location: string): Promise<void> {
    const to = this.createRouteLocation(location);
    const from = this.currentRoute;

    // 执行守卫
    const canNavigate = await this.runGuards(to, from);

    if (!canNavigate) {
      // 导航被取消，恢复历史状态
      return;
    }

    // 更新当前路由
    this.currentRoute = to;

    // 执行后置钩子
    await this.runHooks(to, from);
  }

  /**
   * 导航到指定位置
   */
  private async navigate(
    location: RouteLocationRaw,
    replace: boolean,
  ): Promise<void> {
    const to = this.resolveLocation(location);
    const from = this.currentRoute;

    // 如果是相同路由，不进行导航
    if (to.fullPath === from.fullPath) {
      return;
    }

    // 执行守卫
    const canNavigate = await this.runGuards(to, from);

    if (!canNavigate) {
      return;
    }

    // 更新历史记录
    if (replace) {
      this.history.replace(to.fullPath);
    } else {
      this.history.push(to.fullPath);
    }

    // 更新当前路由
    this.currentRoute = to;

    // 执行后置钩子
    await this.runHooks(to, from);
  }

  /**
   * 执行导航守卫
   */
  private async runGuards(
    to: RouteLocation,
    from: RouteLocation,
  ): Promise<boolean> {
    // 1. 执行路由独享守卫
    if (to.matched[0]?.beforeEnter) {
      const result = await to.matched[0].beforeEnter(to, from);

      if (result === false) {
        return false;
      }

      if (typeof result === 'object') {
        // 重定向
        await this.push(result);
        return false;
      }
    }

    // 2. 执行全局前置守卫
    for (const guard of this.beforeEachGuards) {
      const result = await guard(to, from);

      if (result === false) {
        return false;
      }

      if (typeof result === 'object') {
        // 重定向
        await this.push(result);
        return false;
      }
    }

    return true;
  }

  /**
   * 执行后置钩子
   */
  private async runHooks(
    to: RouteLocation,
    from: RouteLocation,
  ): Promise<void> {
    for (const hook of this.afterEachHooks) {
      await hook(to, from);
    }
  }

  /**
   * 创建路由位置对象
   */
  private createRouteLocation(fullPath: string): RouteLocation {
    // 分离路径、查询和 hash
    const [pathWithQuery, hash = ''] = fullPath.split('#');
    const [path, search = ''] = pathWithQuery.split('?');

    // 解析查询参数
    const query = this.parser.parseQuery(search);

    // 匹配路由
    const match = this.matcher.match(path);

    if (!match) {
      // 没有匹配的路由，返回 404 路由
      return {
        name: '',
        path,
        params: {},
        query,
        hash: hash ? `#${hash}` : '',
        fullPath,
        matched: [],
        meta: {},
      };
    }

    // 构建完整的路由链（从根到叶子）
    const matched: RouteRecord[] = [];
    let current: RouteRecord | undefined = match.route;
    while (current) {
      matched.unshift(current); // 在数组开头插入
      current = current.parent;
    }

    return {
      name: match.route.name,
      path,
      params: match.params,
      query,
      hash: hash ? `#${hash}` : '',
      fullPath,
      matched,
      meta: match.route.meta,
    };
  }

  /**
   * 解析路由位置
   */
  private resolveLocation(location: RouteLocationRaw): RouteLocation {
    if (typeof location === 'string') {
      return this.createRouteLocation(location);
    }

    if ('name' in location) {
      // 命名路由
      const route = this.matcher.getRouteByName(location.name);
      if (!route) {
        throw new Error(`[@fukict/router] Route not found: ${location.name}`);
      }

      // 构建路径
      let path = route.path;
      if (location.params) {
        for (const [key, value] of Object.entries(location.params)) {
          path = path.replace(`:${key}`, String(value));
        }
      }

      // 添加查询和 hash
      const query = this.parser.stringifyQuery(location.query || {});
      const hash = location.hash || '';

      const fullPath = path + query + hash;
      return this.createRouteLocation(fullPath);
    }

    // 路径路由
    const query = this.parser.stringifyQuery(location.query || {});
    const hash = location.hash || '';
    const fullPath = location.path + query + hash;

    return this.createRouteLocation(fullPath);
  }

  /**
   * 规范化 location 参数
   */
  private normalizeLocation(...args: any[]): RouteLocationRaw {
    if (args.length === 1) {
      return args[0];
    }

    // (name, params, query) 形式
    const [name, params, query] = args;
    return { name, params, query };
  }
}

/**
 * 创建路由实例的工厂函数
 */
export function createRouter<Routes extends RouteDefinitions>(
  options: RouterOptions & { routes: Routes },
): Router<Routes> {
  return new Router(options);
}

/**
 * 定义路由的辅助函数（用于类型推导）
 */
export function defineRoutes<T extends RouteDefinitions>(routes: T): T {
  return routes;
}
