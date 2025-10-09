# @fukict/runtime API 文档

## VNode 创建

### `h` / `hyperscript`

创建 VNode。

```typescript
function h(
  type: string | Function | typeof Fragment,
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode;
```

**参数**：

- `type`: 元素标签名、组件函数或 Fragment
- `props`: 属性对象（包含 `on:` 前缀的事件）
- `children`: 子节点

### `jsx` / `jsxs` / `jsxDEV`

JSX 运行时函数（由编译器调用）。

### `Fragment`

Fragment 符号，用于渲染多个根节点。

## 渲染函数

### `render`

将 VNode 渲染到容器元素。

```typescript
function render(vnode: VNodeChild, container: Element): Node | null;
```

**行为**：
1. 创建 DOM 节点（不触发生命周期）
2. 插入到容器中
3. **递归触发 `onMount` 钩子**（此时 DOM 已在文档中）

### `replaceNode`

用新 VNode 替换现有 DOM 节点。

```typescript
function replaceNode(
  oldNode: Node,
  newVNode: VNodeChild,
  oldVNode?: VNode,
): Node | null;
```

**行为**：
1. 触发旧节点的 `onUnmount` 钩子
2. 创建新 DOM 节点（不触发生命周期）
3. 替换 DOM
4. **触发新节点的 `onMount` 钩子**（此时 DOM 已在文档中）

**注意**：无 diff/patch，会重建整个子树。

### `unmount`

卸载 DOM 节点并触发清理钩子。

```typescript
function unmount(node: Node, vnode?: VNode): void;
```

## Component Handlers（扩展机制）

### `registerComponentHandler`

注册组件处理器。

```typescript
function registerComponentHandler(handler: ComponentHandler): UnregisterFn;
```

**ComponentHandler 接口**：

```typescript
interface ComponentHandler {
  name: string;
  priority?: number;

  // 必需
  detect(fn: Function): boolean;
  render(component: Function, props: any, children: VNodeChild[]): VNode | null;

  // 可选
  processVNode?(vnode: VNode): VNode;

  // DOM 插入后调用（此时可访问 DOM 属性）
  onMount?(element: Element, vnode: VNode): void;

  processAttribute?(element: Element, key: string, value: any): boolean;
  onUnmount?(element: Element, vnode: VNode): void;
}
```

### `findComponentHandler` / `getHandlers`

查找或获取处理器。

```typescript
function findComponentHandler(component: Function): ComponentHandler | null;
function getHandlers(): ComponentHandler[];
```

## 类型定义

### `VNode`

```typescript
interface VNode {
  type: string | Function | symbol;
  props: Record<string, any> | null;
  children: VNodeChild[];
}
```

### `VNodeChild`

```typescript
type VNodeChild =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | VNodeChild[];
```

### `UnregisterFn`

```typescript
type UnregisterFn = () => void;
```

## 特殊属性

- `on:` 前缀事件：`h('button', { 'on:click': handleClick })`
- `ref` 回调：`h('button', { ref: (el) => ref = el })`
- `style` 对象：`h('div', { style: { color: 'red' } })`

## JSX 支持

TypeScript 配置：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@fukict/runtime"
  }
}
```

---

**最后更新**：2025-01-09
