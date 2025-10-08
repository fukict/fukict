/**
 * Slots 提取模块
 *
 * 从 VNode children 中提取具名插槽
 *
 * @fileoverview Slots 提取和管理工具
 * @module @fukict/widget/slots-extractor
 */

import type { VNode, VNodeChild } from '@fukict/runtime';

/**
 * Slots 存储类型
 *
 * VNode 可能代表：
 * - 普通 DOM 元素（type 为字符串）
 * - Widget 类组件（type 为 Widget 类）
 * - 函数组件（type 为函数）
 */
export type SlotsMap = Record<string, VNode | VNode[]>;

/**
 * 从 children 中提取 slots
 *
 * 识别带有 `fukict:slot` 属性的子元素，提取为具名插槽
 * 未标记的子元素归入 `default` 插槽
 *
 * 支持的 slot 类型：
 * - 普通 DOM 元素：`<h1 fukict:slot="header">Title</h1>`
 * - Widget 类组件：`<Header fukict:slot="header" title="Title" />`
 * - 函数组件：`<Greeting fukict:slot="greeting" name="User" />`
 *
 * @param children - VNode children 数组
 * @returns Slots 映射表
 *
 * @example
 * ```tsx
 * // 示例 1: DOM 元素作为 slot
 * <Dialog>
 *   <h1 fukict:slot="header">Title</h1>
 *   <p>Body content</p>
 *   <button fukict:slot="footer">OK</button>
 * </Dialog>
 *
 * // 输出：
 * {
 *   header: VNode(h1),
 *   default: VNode(p),
 *   footer: VNode(button)
 * }
 *
 * // 示例 2: Widget 组件作为 slot
 * <Dialog>
 *   <Header fukict:slot="header" title="Title" />
 *   <p>Body content</p>
 *   <Footer fukict:slot="footer" />
 * </Dialog>
 *
 * // 输出：
 * {
 *   header: VNode(type=Header),
 *   default: VNode(p),
 *   footer: VNode(type=Footer)
 * }
 * ```
 */
export function extractSlots(children: VNodeChild | VNodeChild[] | null | undefined): SlotsMap {
  const slots: SlotsMap = {};

  if (!children) {
    return slots;
  }

  // 规范化为数组
  const childrenArray = Array.isArray(children) ? children : [children];

  // 默认插槽内容
  const defaultSlotChildren: VNode[] = [];

  for (const child of childrenArray) {
    // 跳过 null/undefined/boolean
    if (child === null || child === undefined || typeof child === 'boolean') {
      continue;
    }

    // 处理 VNode 对象（可能是 DOM 元素、Widget 组件、函数组件）
    if (typeof child === 'object' && 'type' in child) {
      const vnode = child as VNode;

      // 检查是否有 fukict:slot 属性
      const slotName = vnode.props?.['fukict:slot'];

      if (slotName && typeof slotName === 'string') {
        // 具名插槽（支持 DOM 元素和 Widget 组件）
        if (slots[slotName]) {
          // 同名插槽，转换为数组
          if (Array.isArray(slots[slotName])) {
            (slots[slotName] as VNode[]).push(vnode);
          } else {
            slots[slotName] = [slots[slotName] as VNode, vnode];
          }
        } else {
          slots[slotName] = vnode;
        }
      } else {
        // 默认插槽（支持 DOM 元素和 Widget 组件）
        defaultSlotChildren.push(vnode);
      }
    } else {
      // 文本节点、数字等，归入默认插槽
      // 注意：这里不创建 VNode，直接忽略原始值
      // 如果需要支持，需要在 Widget 层处理
    }
  }

  // 设置默认插槽
  if (defaultSlotChildren.length > 0) {
    slots.default = defaultSlotChildren.length === 1
      ? defaultSlotChildren[0]
      : defaultSlotChildren;
  }

  return slots;
}

/**
 * 检查 slots 是否为空
 *
 * @param slots - Slots 映射表
 * @returns 是否为空
 */
export function isEmptySlots(slots: SlotsMap): boolean {
  return Object.keys(slots).length === 0;
}

/**
 * 获取指定插槽，支持默认值
 *
 * @param slots - Slots 映射表
 * @param name - 插槽名称
 * @param defaultValue - 默认值
 * @returns 插槽内容或默认值
 */
export function getSlot(
  slots: SlotsMap,
  name: string,
  defaultValue?: VNode | VNode[]
): VNode | VNode[] | undefined {
  return slots[name] ?? defaultValue;
}
