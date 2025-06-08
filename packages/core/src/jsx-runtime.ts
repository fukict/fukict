import type { ComponentFunction, VNode, VNodeChild } from '../types/index';

/**
 * 核心VNode创建函数 - hyperscript
 * 所有VNode创建的统一入口点
 */
export function hyperscript(
  type: string | ComponentFunction,
  props: Record<string, any> | null,
  events: Record<string, EventListener> | null,
  ...children: VNodeChild[]
): VNode {
  const { children: propsChildren, key, ref, ...restProps } = props || {};

  // 简单 children 处理
  const finalChildren: VNodeChild[] = [];

  // 处理 props 中的 children
  if (propsChildren) {
    finalChildren.push(...normalizeChildren(propsChildren));
  }

  // 处理参数中的 children
  if (children && children.length > 0) {
    finalChildren.push(...normalizeChildren(children));
  }

  return {
    type,
    props: restProps,
    events: events,
    children: finalChildren,
    key,
    ref,
  };
}

/**
 * JSX Fragment 函数
 */
export function Fragment(props: { children?: VNodeChild[] }): VNode {
  return {
    type: 'fragment',
    props: null,
    events: null,
    children: normalizeChildren(props.children),
  };
}

/**
 * 标准化子节点
 */
function normalizeChildren(children: any): VNodeChild[] {
  if (children == null || children === undefined) {
    return [];
  }

  if (Array.isArray(children)) {
    return children.flat().filter(child => child != null);
  }

  return [children];
}

/**
 * Hyperscript 函数 - hyperscript的直接别名
 * 用于手动创建VNode的便捷接口
 */
export const h = hyperscript;

// 兼容性导出 - babel-plugin使用
export const jsx = hyperscript; // babel-plugin使用
export const jsxs = hyperscript;
export const jsxDEV = hyperscript;
