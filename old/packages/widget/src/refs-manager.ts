/**
 * Refs 管理模块
 *
 * 提供子组件引用的管理工具
 *
 * @fileoverview Refs 管理工具
 * @module @fukict/widget/refs-manager
 */

import type { Widget } from './class-widget';

/**
 * Refs 存储类型
 */
export type RefsMap = Record<string, Widget>;

/**
 * Refs 管理器基类
 *
 * 提供 refs 的基础操作方法
 */
export class RefsManager {
  /**
   * Refs 存储
   */
  protected refs: RefsMap = {};

  /**
   * 设置 ref
   *
   * @param name - ref 名称
   * @param widget - Widget 实例
   */
  setRef(name: string, widget: Widget): void {
    this.refs[name] = widget;
  }

  /**
   * 获取 ref
   *
   * @param name - ref 名称
   * @returns Widget 实例或 undefined
   */
  getRef(name: string): Widget | undefined {
    return this.refs[name];
  }

  /**
   * 检查 ref 是否存在
   *
   * @param name - ref 名称
   * @returns 是否存在
   */
  hasRef(name: string): boolean {
    return name in this.refs;
  }

  /**
   * 删除 ref
   *
   * @param name - ref 名称
   * @returns 是否删除成功
   */
  deleteRef(name: string): boolean {
    if (name in this.refs) {
      delete this.refs[name];
      return true;
    }
    return false;
  }

  /**
   * 清空所有 refs
   */
  clearRefs(): void {
    this.refs = {};
  }

  /**
   * 遍历所有 refs
   *
   * @param callback - 回调函数
   */
  forEachRef(callback: (name: string, ref: Widget) => void): void {
    for (const name in this.refs) {
      callback(name, this.refs[name]);
    }
  }

  /**
   * 获取所有 ref 名称
   *
   * @returns ref 名称数组
   */
  getRefNames(): string[] {
    return Object.keys(this.refs);
  }

  /**
   * 获取 refs 数量
   *
   * @returns refs 数量
   */
  get refCount(): number {
    return Object.keys(this.refs).length;
  }
}

/**
 * 从 VNode props 中提取 ref 名称
 *
 * @param props - VNode props
 * @returns ref 名称或 undefined
 */
export function extractRefName(props: Record<string, any> | null): string | undefined {
  if (!props) return undefined;

  const refName = props['fukict:ref'];
  if (typeof refName === 'string' && refName.length > 0) {
    return refName;
  }

  return undefined;
}

/**
 * 检查 VNode 是否标记为脱围
 *
 * @param props - VNode props
 * @returns 是否脱围
 */
export function isDetached(props: Record<string, any> | null): boolean {
  if (!props) return false;

  // fukict:detach 属性的存在即表示脱围
  return 'fukict:detach' in props;
}
