/**
 * FetchClient — 基于原生 fetch 的 HTTP 客户端
 *
 * API 对齐 axios，支持拦截器、超时、统一错误处理。
 *
 * @example
 * ```ts
 * import { createFetch } from '@fukict/fetch';
 *
 * const http = createFetch({ baseURL: '/api', timeout: 10000 });
 *
 * http.interceptors.request.use(config => {
 *   config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
 *   return config;
 * });
 *
 * const { data } = await http.get<User[]>('/users');
 * ```
 */

import { FetchError } from './error';
import type { FetchErrorCode } from './error';
import { appendParams, mergeConfig, resolveURL } from './helpers';
import { InterceptorManager } from './interceptors';
import type {
  FetchInstance,
  FetchRequestConfig,
  FetchResponse,
  ProgressEvent,
} from './types';

class FetchClient implements FetchInstance {
  defaults: FetchRequestConfig;

  interceptors = {
    request: new InterceptorManager<FetchRequestConfig>(),
    response: new InterceptorManager<FetchResponse>(),
  };

  constructor(defaults: FetchRequestConfig = {}) {
    this.defaults = defaults;
  }

  async request<T = unknown>(
    config: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    let mergedConfig = mergeConfig(this.defaults, config);

    // ── 请求拦截器链 ──
    // 按注册顺序执行，任意拦截器可修改 config 或抛出错误
    const requestChain: Array<{
      fulfilled: (
        c: FetchRequestConfig,
      ) => FetchRequestConfig | Promise<FetchRequestConfig>;
      rejected?: (e: unknown) => unknown;
    }> = [];
    this.interceptors.request.forEach(i => requestChain.push(i));

    for (const { fulfilled, rejected } of requestChain) {
      try {
        mergedConfig = await fulfilled(mergedConfig);
      } catch (error) {
        if (rejected) {
          mergedConfig = (await rejected(error)) as FetchRequestConfig;
        } else {
          throw error;
        }
      }
    }

    // ── 发起请求 ──
    let response: FetchResponse<T>;
    try {
      response = await this._dispatchRequest<T>(mergedConfig);
    } catch (error) {
      // 让响应拦截器的 rejected 有机会处理错误
      let handled = false;
      const responseChain: Array<{
        rejected?: (e: unknown) => unknown;
      }> = [];
      this.interceptors.response.forEach(i => responseChain.push(i));

      for (const { rejected } of responseChain) {
        if (rejected) {
          response = (await rejected(error)) as FetchResponse<T>;
          handled = true;
          break;
        }
      }
      if (!handled) throw error;
    }

    // ── 响应拦截器链 ──
    const responseChain: Array<{
      fulfilled: (r: FetchResponse) => FetchResponse | Promise<FetchResponse>;
      rejected?: (e: unknown) => unknown;
    }> = [];
    this.interceptors.response.forEach(i => responseChain.push(i));

    for (const { fulfilled, rejected } of responseChain) {
      try {
        response = (await fulfilled(response!)) as FetchResponse<T>;
      } catch (error) {
        if (rejected) {
          response = (await rejected(error)) as FetchResponse<T>;
        } else {
          throw error;
        }
      }
    }

    return response!;
  }

  get<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  post<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  put<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  patch<T = unknown>(url: string, data?: unknown, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  delete<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  head<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  options<T = unknown>(url: string, config?: FetchRequestConfig) {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }

  // ──────────────────────────────────────────────
  // 内部：真正发出 fetch 请求
  // ──────────────────────────────────────────────

  private async _dispatchRequest<T>(
    config: FetchRequestConfig,
  ): Promise<FetchResponse<T>> {
    const {
      baseURL,
      url = '',
      method = 'GET',
      headers: configHeaders,
      params,
      data,
      timeout,
      responseType = 'json',
      onDownloadProgress,
      signal: externalSignal,
      ...restInit
    } = config;

    // URL 拼接
    let finalURL = resolveURL(baseURL, url);
    finalURL = appendParams(finalURL, params);

    // Headers
    const headers = new Headers();
    if (configHeaders) {
      for (const [key, value] of Object.entries(configHeaders)) {
        if (value !== undefined) headers.set(key, value);
      }
    }

    // Body 处理
    let body: BodyInit | undefined;
    if (data !== undefined && data !== null) {
      if (
        data instanceof FormData ||
        data instanceof Blob ||
        data instanceof ArrayBuffer ||
        data instanceof URLSearchParams ||
        typeof data === 'string'
      ) {
        body = data as BodyInit;
      } else {
        body = JSON.stringify(data);
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
      }
    }

    // 超时 + 取消控制
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort(externalSignal.reason);
      } else {
        externalSignal.addEventListener(
          'abort',
          () => controller.abort(externalSignal.reason),
          { once: true },
        );
      }
    }

    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => controller.abort('timeout'), timeout);
    }

    try {
      const response = await fetch(finalURL, {
        ...restInit,
        method: method.toUpperCase(),
        headers,
        body,
        signal: controller.signal,
      });

      // HTTP 错误
      if (!response.ok) {
        let errorData: T | undefined;
        try {
          errorData = await response.clone().json();
        } catch {
          // 忽略解析失败
        }
        const errorCode: FetchErrorCode =
          response.status >= 400 && response.status < 500
            ? 'ERR_BAD_REQUEST'
            : 'ERR_BAD_RESPONSE';
        const errResponse: FetchResponse<T> = {
          data: errorData as T,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config,
        };
        throw new FetchError(
          `Request failed with status ${response.status}`,
          errorCode,
          config,
          errResponse,
        );
      }

      // 解析响应体
      const parsedData = await this._parseResponse<T>(
        response,
        responseType,
        onDownloadProgress,
      );

      return {
        data: parsedData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config,
      };
    } catch (error) {
      if (error instanceof FetchError) throw error;

      // 取消 / 超时
      if (error instanceof DOMException && error.name === 'AbortError') {
        const isTimeout = timeout && timeout > 0;
        throw new FetchError(
          isTimeout ? `timeout of ${timeout}ms exceeded` : 'Request aborted',
          isTimeout ? 'ERR_TIMEOUT' : 'ERR_CANCELED',
          config,
        );
      }

      // 网络错误
      if (error instanceof TypeError) {
        throw new FetchError(
          `Network Error: ${error.message}`,
          'ERR_NETWORK',
          config,
        );
      }

      throw error;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  private async _parseResponse<T>(
    response: Response,
    responseType: string,
    onDownloadProgress?: (progress: ProgressEvent) => void,
  ): Promise<T> {
    // stream 模式：直接返回 ReadableStream
    if (responseType === 'stream') {
      return response.body as unknown as T;
    }

    // 带下载进度回调时，通过 ReadableStream 逐块读取
    if (onDownloadProgress && response.body) {
      const total = Number(response.headers.get('Content-Length')) || 0;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        onDownloadProgress({
          loaded,
          total,
          percent: total > 0 ? Math.round((loaded / total) * 100) : -1,
        });
      }

      // 合并 chunks 并按 responseType 解析
      const merged = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }

      if (responseType === 'blob') return new Blob([merged]) as unknown as T;
      if (responseType === 'arraybuffer') return merged.buffer as unknown as T;
      const text = new TextDecoder().decode(merged);
      if (responseType === 'json') {
        try {
          return JSON.parse(text);
        } catch {
          return text as unknown as T;
        }
      }
      return text as unknown as T;
    }

    // 常规解析
    switch (responseType) {
      case 'blob':
        return response.blob() as Promise<unknown> as Promise<T>;
      case 'arraybuffer':
        return response.arrayBuffer() as Promise<unknown> as Promise<T>;
      case 'text':
        return response.text() as Promise<unknown> as Promise<T>;
      case 'json':
      default: {
        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          return response.json();
        }
        return response.text() as Promise<unknown> as Promise<T>;
      }
    }
  }
}

/**
 * 创建 HTTP 客户端实例（对应 axios.create()）
 *
 * @param config - 默认配置，会与每次请求的配置合并
 */
export function createFetch(config: FetchRequestConfig = {}): FetchInstance {
  return new FetchClient(config);
}
