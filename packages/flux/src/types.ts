/**
 * Flux listener function type
 */
export type FluxListener<T> = (state: T) => void;

/**
 * Selector function type
 */
export type FluxSelector<T, S> = (state: T) => S;

/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void;

// ============================================================
// Legacy createFlux types (保持向后兼容)
// ============================================================

/**
 * createFlux configuration type
 * @deprecated 推荐使用 defineStore
 */
export interface CreateFluxConfig<T, A> {
  /**
   * Initial state
   */
  state: T;

  /**
   * Actions definition (optional)
   */
  actions?: (flux: FluxInstance<T>) => A;
}

/**
 * Flux instance interface (internal use)
 */
export interface FluxInstance<T> {
  getState(): T;
  setState(newState: Partial<T> | T): void;
  subscribe(listener: FluxListener<T>): Unsubscribe;
  subscribe<S>(
    selector: FluxSelector<T, S>,
    listener: FluxListener<S>,
  ): Unsubscribe;
}

/**
 * createFlux return type
 * @deprecated 推荐使用 defineStore
 */
export interface FluxStore<T, A> {
  /**
   * Flux instance
   */
  flux: FluxInstance<T>;

  /**
   * Actions object
   */
  actions: A;

  /**
   * Get current state (shortcut method)
   */
  getState(): T;

  /**
   * Update state (shortcut method)
   */
  setState(newState: Partial<T> | T): void;

  /**
   * Subscribe to state changes (shortcut method)
   */
  subscribe(listener: FluxListener<T>): Unsubscribe;
  subscribe<S>(
    selector: FluxSelector<T, S>,
    listener: FluxListener<S>,
  ): Unsubscribe;
}

// ============================================================
// New defineStore types
// ============================================================

/**
 * 同步 Action 函数类型
 *
 * 接收当前 state 和可选参数，返回 Partial<State>
 */
export type SyncAction<T, Args extends unknown[] = []> = (
  state: T,
  ...args: Args
) => Partial<T>;

/**
 * 同步 Actions 集合
 */
export type SyncActions<T> = {
  [key: string]: SyncAction<T, any[]>;
};

/**
 * Action 上下文（用于异步 actions）
 */
export interface ActionContext<T> {
  /**
   * 获取当前状态
   */
  getState(): T;

  /**
   * 更新状态（可多次调用）
   */
  setState(partial: Partial<T>): void;
}

/**
 * 异步 Action 函数类型
 *
 * 接收 context 和可选参数，通过 ctx.setState 更新状态
 */
export type AsyncAction<T, Args extends unknown[] = []> = (
  ctx: ActionContext<T>,
  ...args: Args
) => Promise<void>;

/**
 * 异步 Actions 集合
 */
export type AsyncActions<T> = {
  [key: string]: AsyncAction<T, any[]>;
};

/**
 * defineStore 配置类型
 */
export interface DefineStoreConfig<
  T extends object,
  A extends SyncActions<T> = {},
  AA extends AsyncActions<T> = {},
> {
  /**
   * 初始状态
   */
  state: T;

  /**
   * 同步 Actions
   *
   * @example
   * ```typescript
   * actions: {
   *   increment: (state) => ({ count: state.count + 1 }),
   *   add: (state, amount: number) => ({ count: state.count + amount }),
   * }
   * ```
   */
  actions?: A;

  /**
   * 异步 Actions
   *
   * @example
   * ```typescript
   * asyncActions: {
   *   async fetchUser(ctx, id: string) {
   *     ctx.setState({ loading: true });
   *     const user = await api.getUser(id);
   *     ctx.setState({ user, loading: false });
   *   },
   * }
   * ```
   */
  asyncActions?: AA;
}

/**
 * 包装后的同步 Action 类型（移除 state 参数）
 */
export type WrappedSyncAction<T, A> = A extends (
  state: T,
  ...args: infer Args
) => Partial<T>
  ? (...args: Args) => void
  : never;

/**
 * 包装后的异步 Action 类型（移除 ctx 参数）
 */
export type WrappedAsyncAction<T, A> = A extends (
  ctx: ActionContext<T>,
  ...args: infer Args
) => Promise<void>
  ? (...args: Args) => Promise<void>
  : never;

/**
 * Store 实例类型
 */
export interface Store<
  T extends object,
  A extends SyncActions<T> = {},
  AA extends AsyncActions<T> = {},
> {
  /**
   * 当前状态（只读）
   */
  readonly state: T;

  /**
   * 同步 Actions
   */
  actions: {
    [K in keyof A]: WrappedSyncAction<T, A[K]>;
  };

  /**
   * 异步 Actions
   */
  asyncActions: {
    [K in keyof AA]: WrappedAsyncAction<T, AA[K]>;
  };

  /**
   * 订阅状态变化
   */
  subscribe(listener: FluxListener<T>): Unsubscribe;
  subscribe<S>(
    selector: FluxSelector<T, S>,
    listener: FluxListener<S>,
  ): Unsubscribe;

  /**
   * 获取状态快照
   */
  getState(): T;

  /**
   * 直接设置状态（高级用法，一般推荐使用 actions）
   */
  setState(partial: Partial<T>): void;
}
