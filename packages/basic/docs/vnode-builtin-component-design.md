# VNode BuiltinComponent 设计

## 概述

为支持内置逻辑组件（Show、For、Switch 等），扩展 VNode 类型体系，新增 `BuiltinComponent` 类型。

## 类型定义

### VNodeType 枚举扩展

```typescript
export enum VNodeType {
  Element = 'element',
  Fragment = 'fragment',
  FunctionComponent = 'function',
  ClassComponent = 'class',
  BuiltinComponent = 'builtin', // 新增
}
```

### 内置组件类型标识

```typescript
export const BuiltinComponentType = {
  Show: Symbol('Show'),
  For: Symbol('For'),
  Switch: Symbol('Switch'),
  Match: Symbol('Match'),
} as const;
```

### BuiltinComponentVNode 接口

```typescript
export interface BuiltinComponentVNode extends VNodeBase {
  __type__: VNodeType.BuiltinComponent;

  /** 内置组件类型标识符 */
  builtinType: symbol;

  /** 组件构造函数 */
  type: Function;

  /** 组件实例 */
  __instance__?: BuiltinComponent;

  /** 固定的 DOM 锚点（comment node） */
  __anchor__?: Comment | null;

  /** 当前渲染的内容 */
  __rendered__?: VNode | VNode[] | null;

  /** DOM 节点引用 */
  __dom__?: Node | Node[] | null;
}
```

### VNode 联合类型更新

```typescript
export type VNode =
  | ElementVNode
  | FragmentVNode
  | FunctionComponentVNode
  | ClassComponentVNode
  | BuiltinComponentVNode; // 新增
```

## BuiltinComponent 基类

```typescript
export abstract class BuiltinComponent<P = any> {
  /** 内置组件类型标识（子类必须定义） */
  static readonly __builtin_type__: symbol;

  /** Props */
  props: P;

  /** Slots */
  slots: FukictSlots;

  /** VNode 引用 */
  __vnode__?: BuiltinComponentVNode;

  constructor(props: P, slots: FukictSlots) {
    this.props = props;
    this.slots = slots;
  }

  /**
   * 渲染方法
   * 返回要显示的内容（VNode、VNode[] 或 null）
   */
  abstract render(): VNode | VNode[] | null;

  /**
   * 更新方法
   * 当 props 或 slots 变化时调用
   */
  update(newProps: P, newSlots: FukictSlots): void {
    this.props = newProps;
    this.slots = newSlots;
  }

  /**
   * 销毁方法
   * 组件卸载时调用
   */
  destroy(): void {
    // 默认空实现，子类可覆盖
  }
}
```

## Hyperscript 识别机制

```typescript
export function hyperscript(type: any, props: any, ...children: any[]): VNode {
  // ... 现有的 normalization 代码

  // 检测内置组件
  if (typeof type === 'function' && '__builtin_type__' in type) {
    return {
      __type__: VNodeType.BuiltinComponent,
      builtinType: (type as any).__builtin_type__,
      type,
      props: normalizedProps,
      children: normalizedChildren,
    } as BuiltinComponentVNode;
  }

  // 检测 Class Component
  if (typeof type === 'function' && type.prototype?.render) {
    return {
      __type__: VNodeType.ClassComponent,
      type,
      props: normalizedProps,
      children: normalizedChildren,
    } as ClassComponentVNode;
  }

  // ... 其他现有代码
}
```

## 渲染逻辑

### 创建（createRealNode）

```typescript
function createBuiltinComponent(vnode: BuiltinComponentVNode): Node | Node[] {
  const { type, props, children } = vnode;

  // 1. 创建组件实例
  const slots = extractSlots(children);
  const instance = new (type as any)(props, slots);
  vnode.__instance__ = instance;
  instance.__vnode__ = vnode;

  // 2. 创建固定锚点
  const anchor = document.createComment(
    `fukict:${type.name}#${getBuiltinId()}`,
  );
  vnode.__anchor__ = anchor;

  // 3. 渲染内容
  const rendered = instance.render();
  vnode.__rendered__ = rendered;

  // 4. 创建真实 DOM
  if (!rendered) {
    vnode.__dom__ = anchor;
    return anchor;
  }

  if (Array.isArray(rendered)) {
    const nodes = rendered.flatMap(child =>
      child ? createRealNode(child) : [],
    );
    vnode.__dom__ = [anchor, ...nodes];
    return [anchor, ...nodes];
  }

  const contentNode = createRealNode(rendered);
  const domArray = Array.isArray(contentNode)
    ? [anchor, ...contentNode]
    : [anchor, contentNode];
  vnode.__dom__ = domArray;
  return domArray;
}
```

### Diff 算法

```typescript
function diffBuiltinComponent(
  oldVNode: BuiltinComponentVNode,
  newVNode: BuiltinComponentVNode,
  parentDom: Node,
): void {
  // 1. 复用实例和锚点
  const instance = oldVNode.__instance__!;
  newVNode.__instance__ = instance;
  newVNode.__anchor__ = oldVNode.__anchor__;
  instance.__vnode__ = newVNode;

  // 2. 更新 props 和 slots
  const newSlots = extractSlots(newVNode.children);
  instance.update(newVNode.props, newSlots);

  // 3. 重新渲染
  const oldRendered = oldVNode.__rendered__;
  const newRendered = instance.render();
  newVNode.__rendered__ = newRendered;

  // 4. Diff 渲染内容
  diffBuiltinContent(oldRendered, newRendered, oldVNode.__anchor__!, parentDom);

  // 5. 更新 DOM 引用
  newVNode.__dom__ = calculateBuiltinDom(newVNode);
}
```

### Diff 内容（四种场景）

```typescript
function diffBuiltinContent(
  oldContent: VNode | VNode[] | null,
  newContent: VNode | VNode[] | null,
  anchor: Comment,
  parentDom: Node,
): void {
  // 场景 1: null → null
  if (!oldContent && !newContent) {
    return;
  }

  // 场景 2: null → VNode（挂载）
  if (!oldContent && newContent) {
    const newNodes = Array.isArray(newContent)
      ? newContent.flatMap(v => createRealNode(v))
      : createRealNode(newContent);
    insertAfter(newNodes, anchor, parentDom);
    return;
  }

  // 场景 3: VNode → null（卸载）
  if (oldContent && !newContent) {
    if (Array.isArray(oldContent)) {
      oldContent.forEach(unmount);
    } else {
      unmount(oldContent);
    }
    return;
  }

  // 场景 4: VNode → VNode（diff 更新）
  if (oldContent && newContent) {
    // 单个 → 单个
    if (!Array.isArray(oldContent) && !Array.isArray(newContent)) {
      diff(oldContent, newContent, parentDom);
      return;
    }

    // 数组 → 数组
    if (Array.isArray(oldContent) && Array.isArray(newContent)) {
      diffChildren(oldContent, newContent, parentDom);
      return;
    }

    // 类型不匹配：卸载旧的，挂载新的
    if (Array.isArray(oldContent)) {
      oldContent.forEach(unmount);
    } else {
      unmount(oldContent);
    }

    const newNodes = Array.isArray(newContent)
      ? newContent.flatMap(v => createRealNode(v))
      : createRealNode(newContent);
    insertAfter(newNodes, anchor, parentDom);
  }
}
```

### 卸载（unmount）

```typescript
function unmountBuiltinComponent(vnode: BuiltinComponentVNode): void {
  const { __instance__, __rendered__ } = vnode;

  // 1. 卸载渲染内容
  if (__rendered__) {
    if (Array.isArray(__rendered__)) {
      __rendered__.forEach(unmount);
    } else {
      unmount(__rendered__);
    }
  }

  // 2. 调用销毁方法
  __instance__?.destroy();

  // 3. 清理引用
  if (__instance__) {
    __instance__.__vnode__ = undefined;
  }
  vnode.__instance__ = undefined;
  vnode.__rendered__ = undefined;
}
```

## Show 组件实现示例

```typescript
export interface ShowProps {
  when: boolean;
  fallback?: VNode | null;
}

export class Show extends BuiltinComponent<ShowProps> {
  static readonly __builtin_type__ = BuiltinComponentType.Show;

  render() {
    const { when, fallback } = this.props;
    const children = this.slots.default || [];

    if (when) {
      if (children.length === 0) return null;
      if (children.length === 1) return children[0];
      return children;
    } else {
      return fallback || null;
    }
  }
}
```

## 使用示例

```tsx
import { Show } from '@fukict/basic';

class MyComponent extends Fukict {
  render() {
    return (
      <div>
        <Show when={this.isVisible}>
          <Content />
        </Show>

        <Show when={this.isAuthenticated} fallback={<LoginPrompt />}>
          <Dashboard />
        </Show>
      </div>
    );
  }
}
```

## 实现路线图

### Phase 1: 类型定义

- 扩展 VNodeType 枚举
- 定义 BuiltinComponentVNode 接口
- 创建 BuiltinComponent 基类
- 定义 BuiltinComponentType 符号表

### Phase 2: Hyperscript

- 修改 hyperscript 识别 `__builtin_type__`
- 更新类型推导逻辑

### Phase 3: 渲染器

- 实现 createBuiltinComponent
- 实现 diffBuiltinComponent
- 实现 diffBuiltinContent
- 实现 unmountBuiltinComponent

### Phase 4: Show 组件

- 使用 BuiltinComponent 基类实现
- 导出类型和组件
- 更新文档和示例

### Phase 5: 扩展组件

- For 组件（列表渲染）
- Switch/Match 组件（多分支条件）
