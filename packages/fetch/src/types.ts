/**
 * 类型定义
 *
 * 对齐 axios 的核心类型接口，便于从 axios 迁移。
 */

// ─── Request ────────────────────────────────────────────

/** 请求配置（对应 axios 的 AxiosRequestConfig） */
export interface FetchRequestConfig extends Omit<
  RequestInit,
  'body' | 'headers'
> {
  /** 基础 URL，拼接在请求路径前 */
  baseURL?: string;
  /** 请求路径 */
  url?: string;
  /** HTTP 方法 */
  method?: string;
  /** 请求头 */
  headers?: HeadersRecord;
  /** URL 查询参数 */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** 请求体数据（对应 axios 的 data） */
  data?: unknown;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';
  /** 下载进度回调 */
  onDownloadProgress?: (progress: ProgressEvent) => void;
}

/** 请求头记录类型 */
export type HeadersRecord = Record<string, string | undefined>;

// ─── Response ───────────────────────────────────────────

/** 响应结构（对应 axios 的 AxiosResponse） */
export interface FetchResponse<T = unknown> {
  /** 响应数据 */
  data: T;
  /** HTTP 状态码 */
  status: number;
  /** 状态文本 */
  statusText: string;
  /** 响应头 */
  headers: Headers;
  /** 本次请求的配置 */
  config: FetchRequestConfig;
}

// ─── Progress ───────────────────────────────────────────

/** 进度事件 */
export interface ProgressEvent {
  /** 已传输字节数 */
  loaded: number;
  /** 总字节数（未知时为 0） */
  total: number;
  /** 进度百分比 0-100（总大小未知时为 -1） */
  percent: number;
}

// ─── Interceptors ───────────────────────────────────────

/** 拦截器成功回调 */
export type InterceptorFulfilled<T> = (value: T) => T | Promise<T>;

/** 拦截器失败回调 */
export type InterceptorRejected = (error: unknown) => unknown;

/** 拦截器配置 */
export interface Interceptor<T> {
  fulfilled: InterceptorFulfilled<T>;
  rejected?: InterceptorRejected;
}

// ─── Instance ───────────────────────────────────────────

/** 拦截器管理器接口 */
export interface InterceptorManagerInterface<T> {
  /** 添加拦截器，返回 id 用于 eject */
  use(
    fulfilled: InterceptorFulfilled<T>,
    rejected?: InterceptorRejected,
  ): number;
  /** 移除拦截器 */
  eject(id: number): void;
  /** 遍历所有活跃拦截器 */
  forEach(fn: (interceptor: Interceptor<T>) => void): void;
}

/** FetchClient 实例接口 */
export interface FetchInstance {
  /** 默认配置 */
  defaults: FetchRequestConfig;

  /** 拦截器 */
  interceptors: {
    request: InterceptorManagerInterface<FetchRequestConfig>;
    response: InterceptorManagerInterface<FetchResponse>;
  };

  /** 通用请求方法 */
  request<T = unknown>(config: FetchRequestConfig): Promise<FetchResponse<T>>;

  /** GET */
  get<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
  /** POST */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
  /** PUT */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
  /** PATCH */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
  /** DELETE */
  delete<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
  /** HEAD */
  head<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
  /** OPTIONS */
  options<T = unknown>(
    url: string,
    config?: FetchRequestConfig,
  ): Promise<FetchResponse<T>>;
}
