# VNode 结构详解

> 当前 VNode 结构设计参考，用于 DevTools 开发和框架理解。

## 1. VNode 类型总览

```
VNode (联合类型)
├── ElementVNode        # <div>, <span> 等原生 DOM
├── FragmentVNode       # 多根节点片段
├── FunctionComponentVNode  # 函数组件
├── ClassComponentVNode     # 类组件 ⭐
└── PrimitiveVNode      # string, number, null 等原始值
```

## 2. 各类型 VNode 属性对照

| 属性           | Element     | Fragment     | Function       | Class      | Primitive       |
| -------------- | ----------- | ------------ | -------------- | ---------- | --------------- |
| `__type__`     | `'element'` | `'fragment'` | `'function'`   | `'class'`  | `'primitive'`   |
| `type`         | `string`    | `Symbol`     | `Function`     | `Function` | `'primitive'`   |
| `props`        | ✅          | ✅           | ✅             | ✅         | `null`          |
| `children`     | ✅          | ✅           | ✅             | ✅\*       | `[]`            |
| `__node__`     | `Node`      | `Node[]`     | `Node\|Node[]` | `Comment`  | `Text\|Comment` |
| `__render__`   | ❌          | ❌           | `VNode`        | ❌         | ❌              |
| `__instance__` | ❌          | ❌           | ❌             | `Fukict`   | ❌              |

> \* ClassComponent 的 `children` 会被提取为 `$slots`，不直接渲染

## 3. ClassComponentVNode 的双层结构

这是最复杂的部分：

```
ClassComponentVNode (父组件树中的节点)
├── __type__: 'class'
├── type: ComponentClass (构造函数)
├── props: { ... }
├── children: [...] ────────────────┐
├── __instance__: Fukict ──────┐    │
│   ├── props                  │    │
│   ├── $slots ◄───────────────┼────┘ (由 children 提取)
│   ├── $refs                  │
│   ├── _render: VNode ◄───────┼────── render() 的结果
│   ├── _parent ◄──────────────┼────── 父组件实例
│   ├── _container             │
│   └── _phase                 │
└── __node__: Comment ─────────────── 位置标记
```

**关键理解**：

- `vnode.children` → 传给组件的子元素（slots 来源）
- `vnode.__instance__._render` → 组件 render() 返回的 DOM 结构

## 4. 树遍历路径

从根 VNode 遍历到所有子组件：

```typescript
function traverse(vnode, parent) {
  // ClassComponent: 穿透到 instance._render
  if (vnode.__type__ === 'class' && vnode.__instance__) {
    visit(vnode.__instance__, parent);
    traverse(vnode.__instance__._render, vnode.__instance__);
    return; // 不遍历 children (已变成 slots)
  }

  // FunctionComponent: 穿透到 __render__
  if (vnode.__type__ === 'function' && vnode.__render__) {
    traverse(vnode.__render__, parent);
    return;
  }

  // Element/Fragment: 遍历 children
  for (const child of vnode.children) {
    traverse(child, parent);
  }
}
```

## 5. DOM 查找路径

从组件实例找到对应 DOM：

```typescript
function findDOM(vnode) {
  if (vnode.__node__) return vnode.__node__;

  // ClassComponent: instance._render → DOM
  if (vnode.__type__ === 'class') {
    return findDOM(vnode.__instance__._render);
  }

  // FunctionComponent: __render__ → DOM
  if (vnode.__type__ === 'function') {
    return findDOM(vnode.__render__);
  }

  // 递归 children
  for (const child of vnode.children) {
    const dom = findDOM(child);
    if (dom) return dom;
  }
}
```

## 6. 典型组件树示例

```tsx
// 代码
<App>
  <Layout>
    <Sidebar />
    <Content />
  </Layout>
</App>
```

```
VNode 树结构:

App (ClassComponentVNode)
└── __instance__
    └── _render: Layout (ClassComponentVNode)
        ├── children: [Sidebar, Content] → 变成 Layout.$slots.default
        └── __instance__
            └── _render: <div> (ElementVNode)
                └── children: [
                      ...,
                      Sidebar (ClassComponentVNode),
                      Content (ClassComponentVNode)
                    ]
```

---

**相关文档**: [vnode-system.md](./vnode-system.md) | [component-design.md](./component-design.md)
