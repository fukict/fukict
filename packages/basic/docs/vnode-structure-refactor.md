# VNode 结构重构方案

> 优化后的 VNode 结构设计，解决命名混乱和概念分裂问题。

## 1. 核心变更

| 当前                           | 重构后             | 说明                   |
| ------------------------------ | ------------------ | ---------------------- |
| `__dom__` / `__placeholder__`  | `__node__`         | 统一位置标记           |
| `__rendered__`                 | `__render__`       | 函数组件 render 结果   |
| `instance.__vnode__`           | `instance._render` | 类组件 render 结果     |
| `instance.__wrapper__`         | `instance._parent` | 父组件引用             |
| `instance.__id__` / `__name__` | `$id` / `$name`    | 用户可访问属性         |
| `instance.__placeholder__`     | 删除               | 冗余（只赋值从未读取） |

## 2. 命名规范

| 前缀     | 用途               | 示例                                 |
| -------- | ------------------ | ------------------------------------ |
| `__<>__` | VNode 内部属性     | `__type__`, `__node__`, `__render__` |
| `$<>`    | 实例用户可访问属性 | `$id`, `$name`, `$slots`, `$refs`    |
| `_<>`    | 实例框架内部属性   | `_render`, `_parent`, `_container`   |

## 3. VNode 属性对照

| 属性           | Element     | Fragment     | Function       | Class      | Primitive       |
| -------------- | ----------- | ------------ | -------------- | ---------- | --------------- |
| `__type__`     | `'element'` | `'fragment'` | `'function'`   | `'class'`  | `'primitive'`   |
| `type`         | `string`    | `Symbol`     | `Function`     | `Function` | `'primitive'`   |
| `props`        | ✅          | ✅           | ✅             | ✅         | `null`          |
| `children`     | ✅          | ✅           | ✅             | ✅\*       | `[]`            |
| `__node__`     | `Node`      | `Node[]`     | `Node\|Node[]` | `Comment`  | `Text\|Comment` |
| `__render__`   | —           | —            | `VNode`        | —          | —               |
| `__instance__` | —           | —            | —              | `Fukict`   | —               |

> \* ClassComponent 的 `children` 提取为 `instance.$slots`

## 4. `__node__` 语义

**`__node__` 是位置锚点**，用于 diff 时的插入/移动操作。

| 类型      | `__node__` 值   | 说明                 |
| --------- | --------------- | -------------------- |
| Element   | `Node`          | 实际 DOM 元素        |
| Fragment  | `Node[]`        | 子节点数组           |
| Function  | `Node\|Node[]`  | 从 `__render__` 获取 |
| **Class** | `Comment`       | **始终是占位符**     |
| Primitive | `Text\|Comment` | 文本或空值占位       |

### 获取实际 DOM（递归）

```typescript
function getRealDOM(vnode) {
  if (vnode.__type__ === 'class') {
    return getRealDOM(vnode.__instance__._render);
  }
  if (vnode.__type__ === 'function') {
    return getRealDOM(vnode.__render__);
  }
  return vnode.__node__;
}
```

## 5. ClassComponentVNode 结构

```
ClassComponentVNode
├── __type__: 'class'
├── type: ComponentClass
├── props: { ... }
├── children: [...] ──────────────┐
├── __node__: Comment             │  位置锚点
└── __instance__: Fukict ────┐    │
    ├── $id                  │    │
    ├── $name                │    │
    ├── $slots ◄─────────────┼────┘  由 children 提取
    ├── $refs                │
    ├── props                │
    ├── _render: VNode ◄─────┼────── render() 结果
    ├── _parent: Fukict      │       父组件实例
    ├── _container: Element  │
    └── _phase: string       │       生命周期状态
```

## 6. Fukict 实例属性

```typescript
class Fukict {
  // 用户可访问 ($)
  readonly $id: number;
  readonly $name: string;
  readonly $slots: Slots;
  readonly $refs: Refs;
  protected props: Props;

  // 框架内部 (_)
  _render: VNode | null;
  _parent: Fukict | null;
  _container: Element | null;
  _phase: 'idle' | 'mounting' | 'updating' | 'unmounting';
}
```

## 7. 完整示例

### 代码

```tsx
class App extends Fukict {
  render() {
    return (
      <Layout title="My App">
        <Sidebar />
        <Main>
          <Greeting name="World" />
        </Main>
      </Layout>
    );
  }
}

const Greeting = defineFukict(({ name }) => <span>Hi, {name}!</span>);
```

### VNode 结构

```jsonc
{
  "__type__": "class",
  "type": "[Function: App]",
  "props": null,
  "children": [],
  "__node__": "[Comment]",
  "__instance__": {
    "$id": 1,
    "$name": "App",
    "$slots": {},
    "_parent": null,
    "_render": {
      "__type__": "class",
      "type": "[Function: Layout]",
      "props": { "title": "My App" },
      "children": ["[VNode: Sidebar]", "[VNode: Main]"],
      "__node__": "[Comment]",
      "__instance__": {
        "$id": 2,
        "$name": "Layout",
        "$slots": { "default": ["..."] },
        "_parent": "[App#1]",
        "_render": {
          "__type__": "element",
          "type": "div",
          "__node__": "[HTMLDivElement]",
          "children": [
            {
              "__type__": "class",
              "type": "[Function: Sidebar]",
              "__node__": "[Comment]",
              "__instance__": {
                "$id": 3,
                "_parent": "[Layout#2]",
                "_render": {
                  "__type__": "element",
                  "type": "aside",
                  "__node__": "[HTMLElement]",
                },
              },
            },
            {
              "__type__": "class",
              "type": "[Function: Main]",
              "__node__": "[Comment]",
              "__instance__": {
                "$id": 4,
                "$slots": { "default": ["[VNode: Greeting]"] },
                "_parent": "[Layout#2]",
                "_render": {
                  "__type__": "element",
                  "type": "main",
                  "__node__": "[HTMLElement]",
                  "children": [
                    {
                      "__type__": "function",
                      "type": "[Function: Greeting]",
                      "props": { "name": "World" },
                      "__node__": "[HTMLSpanElement]",
                      "__render__": {
                        "__type__": "element",
                        "type": "span",
                        "__node__": "[HTMLSpanElement]",
                        "children": [
                          {
                            "__type__": "primitive",
                            "value": "Hi, ",
                            "__node__": "[Text]",
                          },
                          {
                            "__type__": "primitive",
                            "value": "World",
                            "__node__": "[Text]",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  },
}
```

## 8. 树遍历

```typescript
function traverse(vnode, parent) {
  if (vnode.__type__ === 'class' && vnode.__instance__) {
    visit(vnode.__instance__, parent);
    traverse(vnode.__instance__._render, vnode.__instance__);
    return;
  }

  if (vnode.__type__ === 'function' && vnode.__render__) {
    traverse(vnode.__render__, parent);
    return;
  }

  for (const child of vnode.children) {
    traverse(child, parent);
  }
}
```

## 9. 迁移清单

### VNode

- [ ] `__dom__` → `__node__`
- [ ] `__placeholder__` → `__node__`
- [ ] `__rendered__` → `__render__`

### Instance

- [ ] `__id__` → `$id`
- [ ] `__name__` → `$name`
- [ ] `__vnode__` → `_render`
- [ ] `__wrapper__` → `_parent`
- [ ] `__container__` → `_container`
- [ ] `__placeholder__` → 删除
- [ ] `__inUpdating__` / `__inMounting__` / `__inUnmounting__` → `_phase`

### 文件

- [ ] `types/core.ts`
- [ ] `types/class.ts`
- [ ] `component-class/fukict.ts`
- [ ] `renderer/*.ts`

---

**相关文档**: [vnode-structure.md](./vnode-structure.md) | [fukict-class-refactor.md](./fukict-class-refactor.md)
