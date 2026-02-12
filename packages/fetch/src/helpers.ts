/**
 * 辅助工具函数
 */

import type { FetchRequestConfig, HeadersRecord } from './types';

/** 序列化查询参数并追加到 URL */
export function appendParams(
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  if (!qs) return url;

  return url + (url.includes('?') ? '&' : '?') + qs;
}

/** 拼接 baseURL 和路径 */
export function resolveURL(base: string | undefined, path: string): string {
  if (!base) return path;
  if (/^https?:\/\//.test(path)) return path;
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

/** 合并两个 headers 记录 */
export function mergeHeaders(
  target: HeadersRecord | undefined,
  source: HeadersRecord | undefined,
): HeadersRecord {
  const result: HeadersRecord = {};
  if (target) {
    for (const [k, v] of Object.entries(target)) {
      if (v !== undefined) result[k] = v;
    }
  }
  if (source) {
    for (const [k, v] of Object.entries(source)) {
      if (v !== undefined) result[k] = v;
    }
  }
  return result;
}

/** 合并默认配置与请求配置 */
export function mergeConfig(
  defaults: FetchRequestConfig,
  config: FetchRequestConfig,
): FetchRequestConfig {
  return {
    ...defaults,
    ...config,
    headers: mergeHeaders(defaults.headers, config.headers),
  };
}
