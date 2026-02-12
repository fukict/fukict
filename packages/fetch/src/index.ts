/**
 * @fukict/fetch
 *
 * Axios-style HTTP client built on native fetch
 */

export { createFetch } from './client';
export { FetchError } from './error';
export { InterceptorManager } from './interceptors';

export type { FetchErrorCode } from './error';
export type {
  FetchInstance,
  FetchRequestConfig,
  FetchResponse,
  HeadersRecord,
  Interceptor,
  InterceptorFulfilled,
  InterceptorManagerInterface,
  InterceptorRejected,
  ProgressEvent,
} from './types';
