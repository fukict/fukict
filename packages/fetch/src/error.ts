/**
 * FetchError — 统一错误类（对应 axios 的 AxiosError）
 */

import type { FetchRequestConfig, FetchResponse } from './types';

export type FetchErrorCode =
  | 'ERR_NETWORK'
  | 'ERR_TIMEOUT'
  | 'ERR_CANCELED'
  | 'ERR_BAD_REQUEST'
  | 'ERR_BAD_RESPONSE';

export class FetchError<T = unknown> extends Error {
  /** 错误码 */
  code: FetchErrorCode;
  /** 本次请求的配置 */
  config: FetchRequestConfig;
  /** 响应（HTTP 错误时存在） */
  response?: FetchResponse<T>;

  constructor(
    message: string,
    code: FetchErrorCode,
    config: FetchRequestConfig,
    response?: FetchResponse<T>,
  ) {
    super(message);
    this.name = 'FetchError';
    this.code = code;
    this.config = config;
    this.response = response;
  }

  /** 类型守卫：判断是否为 FetchError */
  static isFetchError(error: unknown): error is FetchError {
    return error instanceof FetchError;
  }
}
