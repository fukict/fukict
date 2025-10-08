/**
 * @fukict/router 核心类型定义
 *
 * @fileoverview 路由系统的完整类型定义
 * @module @fukict/router/types
 */
import type { Widget } from '@fukict/widget';

/**
 * Widget 构造函数类型
 */
export type WidgetConstructor = new (props: any) => Widget<any>;

/**
 * 路由定义
 */
export interface RouteDefinition {
  /** 路径模式 (如 '/user/:id') */
  path: string;
  /** 路由组件 (必须是 Widget 类) */
  component: WidgetConstructor;
  /** 参数类型声明 (用于类型推导) */
  params?: Record<string, any>;
  /** 查询参数类型声明 (用于类型推导) */
  query?: Record<string, any>;
  /** 路由独享守卫 */
  beforeEnter?: NavigationGuard;
  /** 子路由 */
  children?: RouteDefinitions;
  /** 路由元信息 */
  meta?: Record<string, any>;
}

/**
 * 路由定义集合 (命名路由)
 */
export type RouteDefinitions = Record<string, RouteDefinition>;

/**
 * 路由记录 (内部使用)
 */
export interface RouteRecord {
  name: string;
  path: string;
  regex: RegExp | null;
  keys: string[];
  component: WidgetConstructor;
  beforeEnter?: NavigationGuard;
  parent?: RouteRecord;
  children: RouteRecord[];
  meta: Record<string, any>;
}

/**
 * 路由匹配结果
 */
export interface RouteMatch {
  route: RouteRecord;
  params: Record<string, string>;
}

/**
 * 路由位置信息
 */
export interface RouteLocation {
  /** 路由名称 */
  name: string;
  /** 路径 */
  path: string;
  /** 路径参数 */
  params: Record<string, string>;
  /** 查询参数 */
  query: Record<string, string>;
  /** Hash */
  hash: string;
  /** 完整路径 (包含 query 和 hash) */
  fullPath: string;
  /** 匹配的路由记录链 */
  matched: RouteRecord[];
  /** 元信息 */
  meta: Record<string, any>;
}

/**
 * 路由位置原始值 (用于导航)
 */
export type RouteLocationRaw =
  | string
  | {
      name: string;
      params?: Record<string, any>;
      query?: Record<string, any>;
      hash?: string;
    }
  | {
      path: string;
      query?: Record<string, any>;
      hash?: string;
    };

/**
 * 导航守卫返回值
 */
export type NavigationGuardReturn =
  | void
  | boolean
  | RouteLocationRaw
  | Promise<void | boolean | RouteLocationRaw>;

/**
 * 导航守卫函数
 */
export type NavigationGuard = (
  to: RouteLocation,
  from: RouteLocation,
) => NavigationGuardReturn;

/**
 * 导航后置钩子
 */
export type NavigationHook = (
  to: RouteLocation,
  from: RouteLocation,
) => void | Promise<void>;

/**
 * 滚动行为
 */
export interface ScrollPosition {
  left?: number;
  top?: number;
  el?: string | Element;
  behavior?: ScrollBehavior;
}

export type ScrollBehavior = (
  to: RouteLocation,
  from: RouteLocation,
  savedPosition: ScrollPosition | null,
) => ScrollPosition | null | Promise<ScrollPosition | null>;

/**
 * Router 配置选项
 */
export interface RouterOptions {
  /** 路由模式 */
  mode?: 'hash' | 'history';
  /** 路由定义 */
  routes: RouteDefinitions;
  /** 基础路径 */
  base?: string;
  /** 全局前置守卫 */
  beforeEach?: NavigationGuard;
  /** 全局后置钩子 */
  afterEach?: NavigationHook;
  /** 滚动行为 */
  scrollBehavior?: ScrollBehavior;
}

/**
 * 历史记录监听器
 */
export type HistoryListener = (location: string) => void;

/**
 * 历史管理抽象接口
 */
export interface History {
  /** 当前位置 */
  readonly location: string;

  /** 推入新位置 */
  push(location: string): void;

  /** 替换当前位置 */
  replace(location: string): void;

  /** 前进/后退 */
  go(delta: number): void;

  /** 监听位置变化 */
  listen(listener: HistoryListener): () => void;

  /** 销毁 */
  destroy(): void;
}

/**
 * 路由上下文 (注入到 RouteWidget)
 */
export interface RouteContext<R = any> {
  /** Router 实例 */
  router: R;

  /** 当前路由信息 */
  name: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  fullPath: string;
  matched: RouteRecord[];
  meta: Record<string, any>;

  /** 便捷导航方法 */
  push: (
    name: string,
    params?: Record<string, any>,
    query?: Record<string, any>,
  ) => Promise<void>;
  replace: (
    name: string,
    params?: Record<string, any>,
    query?: Record<string, any>,
  ) => Promise<void>;
  back: () => void;
  forward: () => void;
  go: (delta: number) => void;
}

/**
 * 类型推导辅助 - 提取参数类型
 */
export type InferParams<T> = T extends { params: infer P } ? P : {};

/**
 * 类型推导辅助 - 提取查询参数类型
 */
export type InferQuery<T> = T extends { query: infer Q } ? Q : {};
