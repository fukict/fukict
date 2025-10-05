/**
 * @fukict/state - 类型定义
 */

/**
 * 状态变更监听器
 */
export type Listener<T extends object> = (
  state: Readonly<T>,
  prevState: Readonly<T>,
  changedKeys: (keyof T)[],
) => void;

/**
 * 派生选择器函数
 */
export type SelectorFn<T, R> = (state: Readonly<T>) => R;

/**
 * 持久化配置
 */
export interface PersistOptions {
  /**
   * 存储键名
   */
  key: string;

  /**
   * 存储对象 (localStorage 或 sessionStorage)
   */
  storage: Storage;

  /**
   * 包含的字段（白名单）
   */
  include?: string[];

  /**
   * 排除的字段（黑名单）
   */
  exclude?: string[];
}

/**
 * 中间件函数
 */
export type Middleware<T extends object = any> = (
  context: MiddlewareContext<T>,
) => void;

/**
 * 中间件上下文
 */
export interface MiddlewareContext<T extends object> {
  /**
   * 状态键名
   */
  key: keyof T;

  /**
   * 新值
   */
  value: T[keyof T];

  /**
   * 旧值
   */
  prevValue: T[keyof T];

  /**
   * 完整状态（新）
   */
  state: Readonly<T>;

  /**
   * 完整状态（旧）
   */
  prevState: Readonly<T>;
}

/**
 * 状态容器配置选项
 */
export interface StateOptions<T extends object = any> {
  /**
   * 持久化配置
   */
  persist?: PersistOptions;

  /**
   * 中间件列表
   */
  middleware?: Middleware<T>[];
}

/**
 * 派生选择器
 */
export interface Selector<T> {
  /**
   * 当前值（只读）
   */
  readonly value: T;

  /**
   * 订阅值变更
   */
  subscribe(listener: (value: T) => void): () => void;
}

/**
 * 状态容器接口
 */
export interface State<T extends object> {
  /**
   * 获取单个字段的值
   */
  get<K extends keyof T>(key: K): T[K];

  /**
   * 设置单个字段的值
   */
  set<K extends keyof T>(key: K, value: T[K]): void;

  /**
   * 获取完整状态对象（只读）
   */
  getState(): Readonly<T>;

  /**
   * 批量更新状态（部分更新）
   */
  setState(partial: Partial<T>): void;

  /**
   * 订阅状态变更
   */
  subscribe(listener: Listener<T>): () => void;

  /**
   * 批量操作（减少通知次数）
   */
  batch(fn: () => void): void;

  /**
   * 创建派生选择器
   */
  select<R>(selector: SelectorFn<T, R>): Selector<R>;

  /**
   * 重置到初始状态
   */
  reset(): void;

  /**
   * 销毁状态容器（清理资源）
   */
  destroy(): void;
}
