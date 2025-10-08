/**
 * 路径解析器
 * 负责将路径模式编译为正则表达式，用于路由匹配
 *
 * @fileoverview 路径模式解析和参数提取
 * @module @fukict/router/matcher/path-parser
 */

/**
 * 编译后的路径
 */
export interface CompiledPath {
  /** 匹配正则表达式 */
  regex: RegExp;
  /** 参数名列表 */
  keys: string[];
}

/**
 * 路径解析器类
 */
export class PathParser {
  /**
   * 将路径模式编译为正则表达式
   *
   * @param path - 路径模式 (如 '/user/:id/post/:postId')
   * @returns 编译后的路径对象
   *
   * @example
   * ```typescript
   * const parser = new PathParser();
   * const compiled = parser.compilePath('/user/:id');
   * // compiled.regex: /^\/user\/([^/]+)$/
   * // compiled.keys: ['id']
   * ```
   */
  compilePath(path: string): CompiledPath {
    const keys: string[] = [];

    // 处理通配符路由
    if (path === '*') {
      return {
        regex: /.*/,
        keys: [],
      };
    }

    // 转义特殊字符
    const regexPattern = path
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      // 将 :paramName 替换为捕获组
      .replace(/:([^/]+)/g, (match, key) => {
        keys.push(key);
        return '([^/]+)';
      })
      // 支持可选参数 :id?
      .replace(/\\\(([^)]+)\\\)\?/g, '(?:$1)?');

    // 添加开始和结束锚点
    const regex = new RegExp(`^${regexPattern}$`);

    return { regex, keys };
  }

  /**
   * 从匹配结果中提取参数
   *
   * @param match - 正则匹配结果
   * @param keys - 参数名列表
   * @returns 参数对象
   *
   * @example
   * ```typescript
   * const match = regex.exec('/user/123');
   * const params = parser.extractParams(match, ['id']);
   * // params: { id: '123' }
   * ```
   */
  extractParams(
    match: RegExpExecArray,
    keys: string[],
  ): Record<string, string> {
    const params: Record<string, string> = {};

    for (let i = 0; i < keys.length; i++) {
      const value = match[i + 1];
      params[keys[i]] = value ? decodeURIComponent(value) : '';
    }

    return params;
  }

  /**
   * 解析查询字符串
   *
   * @param search - 查询字符串 (如 '?foo=bar&baz=qux')
   * @returns 查询参数对象
   *
   * @example
   * ```typescript
   * const query = parser.parseQuery('?foo=bar&baz=qux');
   * // query: { foo: 'bar', baz: 'qux' }
   * ```
   */
  parseQuery(search: string): Record<string, string> {
    const query: Record<string, string> = {};

    if (!search || search === '?') {
      return query;
    }

    // 移除开头的 '?'
    const queryString = search.startsWith('?') ? search.slice(1) : search;

    // 解析键值对
    queryString.split('&').forEach(pair => {
      const [key, value = ''] = pair.split('=');
      if (key) {
        query[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });

    return query;
  }

  /**
   * 序列化查询参数
   *
   * @param query - 查询参数对象
   * @returns 查询字符串 (如 '?foo=bar&baz=qux')
   *
   * @example
   * ```typescript
   * const search = parser.stringifyQuery({ foo: 'bar', baz: 'qux' });
   * // search: '?foo=bar&baz=qux'
   * ```
   */
  stringifyQuery(query: Record<string, any>): string {
    const pairs: string[] = [];

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        pairs.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        );
      }
    }

    return pairs.length > 0 ? `?${pairs.join('&')}` : '';
  }

  /**
   * 判断路径是否为静态路径（不含参数）
   *
   * @param path - 路径模式
   * @returns 是否为静态路径
   */
  isStatic(path: string): boolean {
    return !path.includes(':') && path !== '*';
  }

  /**
   * 判断路径是否为通配符路径
   *
   * @param path - 路径模式
   * @returns 是否为通配符
   */
  isWildcard(path: string): boolean {
    return path === '*';
  }

  /**
   * 规范化路径
   *
   * @param path - 原始路径
   * @returns 规范化后的路径
   *
   * @example
   * ```typescript
   * normalizePath('/user//profile/') // '/user/profile'
   * ```
   */
  normalizePath(path: string): string {
    return path
      .replace(/\/+/g, '/') // 移除重复的斜杠
      .replace(/\/$/, '') // 移除末尾斜杠
      .replace(/^$/, '/'); // 空路径转为 '/'
  }

  /**
   * 连接路径
   *
   * @param base - 基础路径
   * @param path - 相对路径
   * @returns 完整路径
   *
   * @example
   * ```typescript
   * joinPath('/admin', 'users') // '/admin/users'
   * ```
   */
  joinPath(base: string, path: string): string {
    // 如果是绝对路径，直接返回
    if (path.startsWith('/')) {
      return this.normalizePath(path);
    }

    // 连接路径
    const joined = `${base}/${path}`;
    return this.normalizePath(joined);
  }
}
