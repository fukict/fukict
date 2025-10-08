/**
 * 环境检测工具
 * @fukict/runtime 仅支持浏览器环境
 */

export const isBrowser =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof document.createElement === 'function';

/**
 * 检查当前环境是否支持 DOM API
 * @throws {Error} 如果不在浏览器环境中
 */
export function assertBrowserEnvironment(functionName: string): void {
  if (!isBrowser) {
    throw new Error(
      `@fukict/runtime: ${functionName}() requires a browser environment. ` +
        `DOM APIs are not available.`,
    );
  }
}
