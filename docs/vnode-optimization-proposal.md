# VNode 优化方案：PrimitiveVNode 类型系统

## 问题背景

### 当前架构的问题

在 `@fukict/basic` 中，`VNodeChild` 类型定义为：

```typescript
export type VNodeChild =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | VNodeChild[];
```

这导致 `children` 数组是**异构的**（包含 VNode 和基础值），在条件渲染时会产生**结构不稳定**问题。

### 问题案例

```tsx
<div>
  <div>计算结果:</div>
  {this.calculatedDays !== null && <CalculatorResult />}
  <div>记忆列表:</div>
  {this.memories.length > 0 && <MemoryList />}
  {this.showWarning && <WarningMessage />}
</div>
```

**children 数组的变化过程：**

| 时刻 | 条件状态                 | children 数组                                | 问题           |
| ---- | ------------------------ | -------------------------------------------- | -------------- |
| T1   | A=true, B=false, C=false | `[div, CalculatorResult, div, false, false]` | 类型混杂       |
| T2   | A=false, B=true, C=false | `[div, false, div, MemoryList, false]`       | 索引位置对不上 |

**当前 diffChildren 的问题：**

```typescript
// packages/basic/src/renderer/diff/children.ts:26-45
for (let i = 0; i < commonLen; i++) {
  const oldChild = oldChildren[i];
  const newChild = newChildren[i];

  // 基于位置 diff，但条件渲染会导致位置错乱
  diff(oldChild, newChild, container);
}
```

在 T1→T2 时：

- `children[1]`: `CalculatorResult` → `false` （误认为是类型替换）
- `children[3]`: `false` → `MemoryList` （误认为是新增）

实际上 MemoryList 应该在**自己的语法槽位**渲染，而不是被 diff 到错误的位置。

---

## 解决方案：PrimitiveVNode

### 核心思想

**将所有基础值提升为 VNode**，使 children 数组成为**同构的 VNode 数组**：

```typescript
// 优化前
children: [VNode, false, VNode, null]; // 类型混杂

// 优化后
children: [VNode, PrimitiveVNode(false), VNode, PrimitiveVNode(null)]; // 类型统一
```

### 类型设计

#### 1. 新增 PrimitiveVNode 类型

```typescript
// packages/basic/src/types/core.ts

/**
 * Primitive value types
 */
export type PrimitiveValue = string | number | boolean | null | undefined;

/**
 * VNode type enum
 */
export enum VNodeType {
  Element = 'element',
  Fragment = 'fragment',
  FunctionComponent = 'function',
  ClassComponent = 'class',
  Primitive = 'primitive', // 新增
}

/**
 * Primitive VNode
 * - type: 'primitive'
 * - value: string | number | boolean | null | undefined
 * - __dom__: Text | Comment | null
 */
export interface PrimitiveVNode extends VNodeBase {
  __type__: VNodeType.Primitive;
  type: 'primitive';
  value: PrimitiveValue;
  __dom__?: Text | Comment | null;

  // PrimitiveVNode 不需要 props 和 children
  props: null;
  children: [];
}
```

#### 2. 更新 VNode 联合类型

```typescript
export type VNode =
  | ElementVNode
  | FragmentVNode
  | FunctionComponentVNode
  | ClassComponentVNode
  | PrimitiveVNode; // 新增
```

#### 3. 更新 VNodeChild 类型

```typescript
/**
 * VNode child types - now only VNode or nested arrays
 */
export type VNodeChild =
  | VNode // 所有类型都是 VNode（包括 PrimitiveVNode）
  | VNodeChild[]; // 仅保留嵌套数组支持（slots）
```

注意：移除了基础值类型，因为它们现在都会被包装为 PrimitiveVNode。

---

## 实现细节

### 1. hyperscript 规范化 children

```typescript
// packages/basic/src/vnode.ts

/**
 * Normalize a child to VNode
 */
function normalizeChild(child: any): VNode | null {
  // Already a VNode
  if (child && typeof child === 'object' && '__type__' in child) {
    return child as VNode;
  }

  // Primitive values -> PrimitiveVNode
  if (
    typeof child === 'string' ||
    typeof child === 'number' ||
    typeof child === 'boolean' ||
    child === null ||
    child === undefined
  ) {
    return createPrimitiveVNode(child);
  }

  // Arrays should be flattened before this
  if (Array.isArray(child)) {
    console.warn('Nested array in children, should be flattened first');
    return null;
  }

  return null;
}

/**
 * Create a PrimitiveVNode
 */
function createPrimitiveVNode(value: PrimitiveValue): PrimitiveVNode {
  return {
    __type__: VNodeType.Primitive,
    type: 'primitive',
    value,
    props: null,
    children: [],
  };
}

/**
 * Flatten and normalize children array
 */
function normalizeChildren(children: any[]): VNode[] {
  const result: VNode[] = [];

  for (const child of children) {
    // Flatten nested arrays (from slots, map, etc.)
    if (Array.isArray(child)) {
      result.push(...normalizeChildren(child));
    } else {
      const normalized = normalizeChild(child);
      if (normalized !== null) {
        result.push(normalized);
      }
    }
  }

  return result;
}

/**
 * Create a VNode (updated)
 */
export function hyperscript(
  type: string | Function | typeof Fragment,
  props: Record<string, any> | null,
  children: any[], // 接受任意类型的 children
): VNode {
  // Normalize children to VNode[]
  const normalizedChildren = normalizeChildren(children);

  const vnode = {
    type,
    props: props || {},
    children: normalizedChildren, // 现在保证是 VNode[]
  } as VNode;

  if (!('__type__' in vnode)) {
    (vnode as VNode).__type__ = detectVNodeType(type);
  }

  return vnode;
}
```

### 2. 更新 createRealNode

```typescript
// packages/basic/src/renderer/create.ts

export function createRealNode(vnode: VNode): Node | Node[] | null {
  switch (vnode.__type__) {
    case VNodeType.Element:
      return createElementNode(vnode);

    case VNodeType.Fragment:
      return createFragmentNodes(vnode);

    case VNodeType.FunctionComponent:
      return createFunctionComponentNode(vnode);

    case VNodeType.ClassComponent:
      return createClassComponentNode(vnode);

    case VNodeType.Primitive:
      return createPrimitiveNode(vnode); // 新增

    default:
      return null;
  }
}

/**
 * Create DOM node for PrimitiveVNode
 */
function createPrimitiveNode(vnode: PrimitiveVNode): Text | Comment | null {
  const { value } = vnode;

  // Renderable values: string, number
  if (typeof value === 'string' || typeof value === 'number') {
    const textNode = document.createTextNode(String(value));
    vnode.__dom__ = textNode;
    return textNode;
  }

  // Non-renderable values: boolean, null, undefined
  // Use comment node as placeholder to maintain structure
  if (typeof value === 'boolean' || value === null || value === undefined) {
    const comment = document.createComment(
      `fukict:primitive:${value === null ? 'null' : value === undefined ? 'undefined' : value}`,
    );
    vnode.__dom__ = comment;
    return comment;
  }

  return null;
}
```

### 3. 更新 diff 算法

#### diffChildren 简化

```typescript
// packages/basic/src/renderer/diff/children.ts

/**
 * Diff children arrays (simplified - now all children are VNodes)
 */
export function diffChildren(
  oldChildren: VNode[], // 现在保证是 VNode[]
  newChildren: VNode[], // 现在保证是 VNode[]
  container: Element,
): void {
  const oldLen = oldChildren.length;
  const newLen = newChildren.length;
  const commonLen = Math.min(oldLen, newLen);

  // Diff common children - 现在都是 VNode，逻辑统一
  for (let i = 0; i < commonLen; i++) {
    diff(oldChildren[i], newChildren[i], container);
  }

  // Remove extra old children
  if (oldLen > newLen) {
    for (let i = commonLen; i < oldLen; i++) {
      removeNode(oldChildren[i], container);
    }
  }

  // Append new children
  if (newLen > oldLen) {
    for (let i = commonLen; i < newLen; i++) {
      const node = createRealNode(newChildren[i]);
      if (node) {
        if (Array.isArray(node)) {
          node.forEach(n => container.appendChild(n));
        } else {
          container.appendChild(node);
        }
        activate({ vnode: newChildren[i], container });
      }
    }
  }
}
```

#### diff 主函数更新

```typescript
// packages/basic/src/renderer/diff/index.ts

export function diff(
  oldVNode: VNode, // 现在只接受 VNode
  newVNode: VNode, // 现在只接受 VNode
  container: Element,
): void {
  // Type mismatch - replace entire node
  if (oldVNode.__type__ !== newVNode.__type__) {
    replaceNode(oldVNode, newVNode, container);
    return;
  }

  // Same type - diff by type
  switch (newVNode.__type__) {
    case VNodeType.Element:
      diffElement(oldVNode, newVNode, container);
      break;

    case VNodeType.Fragment:
      diffFragment(oldVNode, newVNode, container);
      break;

    case VNodeType.FunctionComponent:
      diffFunctionComponent(oldVNode, newVNode, container);
      break;

    case VNodeType.ClassComponent:
      diffClassComponent(oldVNode, newVNode, container);
      break;

    case VNodeType.Primitive:
      diffPrimitive(oldVNode, newVNode, container); // 新增
      break;
  }
}
```

#### diffPrimitive 实现

```typescript
// packages/basic/src/renderer/diff/primitive.ts

/**
 * Diff Primitive VNode
 */
export function diffPrimitive(
  oldVNode: VNode,
  newVNode: VNode,
  container: Element,
): void {
  if (
    oldVNode.__type__ !== VNodeType.Primitive ||
    newVNode.__type__ !== VNodeType.Primitive
  ) {
    throw new Error('Expected PrimitiveVNode');
  }

  const oldPrimitive = oldVNode as PrimitiveVNode;
  const newPrimitive = newVNode as PrimitiveVNode;

  // Value unchanged - reuse DOM
  if (oldPrimitive.value === newPrimitive.value) {
    newPrimitive.__dom__ = oldPrimitive.__dom__;
    return;
  }

  const oldValue = oldPrimitive.value;
  const newValue = newPrimitive.value;
  const oldDom = oldPrimitive.__dom__;

  // Both are renderable strings/numbers - update text content
  if (
    (typeof oldValue === 'string' || typeof oldValue === 'number') &&
    (typeof newValue === 'string' || typeof newValue === 'number')
  ) {
    if (oldDom && oldDom.nodeType === Node.TEXT_NODE) {
      oldDom.textContent = String(newValue);
      newPrimitive.__dom__ = oldDom;
      return;
    }
  }

  // Type changed (renderable ↔ non-renderable) - replace node
  replaceNode(oldPrimitive, newPrimitive, container);
}
```

---

## 条件渲染问题解决

### 优化前

```tsx
<div>
  <div>计算结果:</div>
  {this.calculatedDays !== null && <CalculatorResult />}
  <div>记忆列表:</div>
</div>
```

**编译为：**

```typescript
hyperscript('div', null, [
  hyperscript('div', null, ['计算结果:']),
  this.calculatedDays !== null && hyperscript(CalculatorResult, null, []),
  hyperscript('div', null, ['记忆列表:']),
]);
```

**运行时 children（条件为 false）：**

```typescript
[
  ElementVNode(div),
  false, // ⚠️ 基础值，破坏结构
  ElementVNode(div),
];
```

### 优化后

**hyperscript 规范化后的 children（条件为 false）：**

```typescript
[
  ElementVNode(div),
  PrimitiveVNode(false), // ✅ VNode，保持结构
  ElementVNode(div),
];
```

**diff 过程：**

```
T1 (条件 true):  [div, CalculatorResult, div]
T2 (条件 false): [div, PrimitiveVNode(false), div]

diffChildren:
  i=0: diff(div, div) → 复用
  i=1: diff(CalculatorResult, PrimitiveVNode(false))
       → __type__ 不同，replaceNode
       → 移除 CalculatorResult DOM
       → 插入 Comment 节点
  i=2: diff(div, div) → 复用
```

**DOM 结果：**

```html
<div>
  <div>计算结果:</div>
  <!--fukict:primitive:false-->
  <div>记忆列表:</div>
</div>
```

---

## 性能影响分析

### 内存开销

| 项目       | 优化前            | 优化后                          | 增量     |
| ---------- | ----------------- | ------------------------------- | -------- |
| `false` 值 | 8 字节（boolean） | ~40 字节（PrimitiveVNode 对象） | +32 字节 |
| `null` 值  | 8 字节            | ~40 字节                        | +32 字节 |
| `"text"`   | 字符串引用        | ~40 字节 + 字符串引用           | +40 字节 |

**估算**：每个基础值多占用约 32-40 字节。对于典型组件（5-10 个条件渲染），增加约 200-400 字节。

### 运行时开销

| 操作         | 优化前              | 优化后                | 变化             |
| ------------ | ------------------- | --------------------- | ---------------- |
| hyperscript  | 直接使用基础值      | 包装为 PrimitiveVNode | +少量对象创建    |
| diffChildren | 类型检查 + 分支处理 | 统一 diff 逻辑        | 减少分支预测失败 |
| diff         | 多次类型判断        | 统一类型系统          | 代码更简洁       |

**总体**：内存增加 ~5-10%，但逻辑简化可能带来性能提升（减少分支）。

### DOM 节点影响

| 场景       | 优化前   | 优化后                          |
| ---------- | -------- | ------------------------------- |
| `{false}`  | 无 DOM   | `<!--fukict:primitive:false-->` |
| `{null}`   | 无 DOM   | `<!--fukict:primitive:null-->`  |
| `{true}`   | 无 DOM   | `<!--fukict:primitive:true-->`  |
| `{"text"}` | TextNode | TextNode（无变化）              |

**影响**：增加注释节点数量，但对渲染性能影响极小（Comment 节点非常轻量）。

---

## 优势总结

1. **结构稳定性** ✅

   - children 数组长度固定，槽位对应清晰
   - 条件渲染不会导致位置错乱

2. **类型统一性** ✅

   - children 始终是 `VNode[]`
   - 消除类型判断，简化代码

3. **diff 简化** ✅

   - 不再需要处理基础值的特殊情况
   - 逻辑更清晰，维护成本降低

4. **可调试性** ✅

   - DOM 中可见注释节点，方便调试条件渲染
   - `<!--fukict:primitive:false-->` 清晰表明状态

5. **扩展性** ✅
   - 为未来的 key-based reconciliation 奠定基础
   - PrimitiveVNode 可以携带 `__slot_key__` 等元数据

---

## 潜在问题与解决

### 1. 注释节点过多

**问题**：大量 `false/null` 会产生很多注释节点。

**优化方案**：

- 开发模式：保留注释节点（便于调试）
- 生产模式：对连续的 false/null 合并为单个注释节点

```typescript
// 生产模式优化
if (process.env.NODE_ENV === 'production') {
  // 合并连续的非渲染节点
  if (isNonRenderable(value) && lastWasNonRenderable) {
    return null; // 跳过创建节点
  }
}
```

### 2. SSR 兼容性

**问题**：服务端渲染时注释节点会输出到 HTML。

**解决**：

- SSR 时跳过非渲染的 PrimitiveVNode
- Hydration 时重建注释节点

### 3. 与第三方库的兼容

**问题**：某些库可能直接操作 children 数组。

**解决**：

- 提供 `getRawChildren()` API 返回原始值
- 文档中明确说明 children 是 VNode 数组

---

## 迁移路径

### 阶段 1：内部实现（当前版本）

- 修改 hyperscript、diff、create 逻辑
- 确保所有测试用例通过
- **对外 API 不变**（children 仍然可以传基础值）

### 阶段 2：性能优化

- 添加开发/生产模式的注释节点优化
- 性能基准测试

### 阶段 3：扩展功能

- 基于 PrimitiveVNode 实现 key-based reconciliation
- 支持自定义 `__slot_key__`

---

## 实现检查清单

- [ ] 修改 `packages/basic/src/types/core.ts`

  - [ ] 新增 `PrimitiveValue` 类型
  - [ ] 新增 `VNodeType.Primitive` 枚举值
  - [ ] 新增 `PrimitiveVNode` 接口
  - [ ] 更新 `VNode` 联合类型
  - [ ] 更新 `VNodeChild` 类型定义

- [ ] 修改 `packages/basic/src/vnode.ts`

  - [ ] 实现 `createPrimitiveVNode()`
  - [ ] 实现 `normalizeChild()`
  - [ ] 实现 `normalizeChildren()`
  - [ ] 更新 `hyperscript()` 函数

- [ ] 修改 `packages/basic/src/renderer/create.ts`

  - [ ] 实现 `createPrimitiveNode()`
  - [ ] 更新 `createRealNode()` 添加 Primitive 分支

- [ ] 新增 `packages/basic/src/renderer/diff/primitive.ts`

  - [ ] 实现 `diffPrimitive()`

- [ ] 修改 `packages/basic/src/renderer/diff/index.ts`

  - [ ] 简化类型判断逻辑
  - [ ] 添加 Primitive diff 分支
  - [ ] 移除基础值特殊处理

- [ ] 修改 `packages/basic/src/renderer/diff/children.ts`

  - [ ] 更新类型签名（VNode[] 而非 VNodeChild[]）
  - [ ] 移除基础值判断逻辑

- [ ] 修改 `packages/basic/src/renderer/diff/helpers.ts`

  - [ ] 更新 `removeNode()` 支持 PrimitiveVNode

- [ ] 测试
  - [ ] 条件渲染测试（ConditionalRenderingDemo）
  - [ ] 文本节点更新测试
  - [ ] Fragment 测试
  - [ ] 性能基准测试

---

## 示例代码对比

### 场景：条件切换渲染

```tsx
class Demo extends Fukict {
  showA = true;
  showB = false;

  render() {
    return (
      <div>
        <h1>Title</h1>
        {this.showA && <ComponentA />}
        {this.showB && <ComponentB />}
        <footer>Footer</footer>
      </div>
    );
  }
}
```

**优化前 children（showA=true, showB=false）：**

```javascript
[
  ElementVNode(h1),
  ClassComponentVNode(ComponentA),
  false, // 💥 破坏结构
  ElementVNode(footer),
];
```

**优化后 children（showA=true, showB=false）：**

```javascript
[
  ElementVNode(h1),
  ClassComponentVNode(ComponentA),
  PrimitiveVNode(false), // ✅ 保持结构
  ElementVNode(footer),
];
```

**切换为 showA=false, showB=true 后：**

```javascript
// 优化前：位置错乱
[
  ElementVNode(h1),
  false, // 位置 1
  ClassComponentVNode(ComponentB), // 位置 2（错误！）
  ElementVNode(footer),
][
  // 优化后：位置正确
  (ElementVNode(h1),
  PrimitiveVNode(false), // 位置 1（正确）
  ClassComponentVNode(ComponentB), // 位置 2（正确）
  ElementVNode(footer))
];
```

---

## 总结

通过引入 **PrimitiveVNode**，我们：

1. **解决了条件渲染乱序问题** - children 结构固化，槽位稳定
2. **简化了类型系统** - 统一为 VNode，消除异构数组
3. **提升了代码可维护性** - 逻辑更清晰，分支更少
4. **为未来优化奠定基础** - 可扩展 key-based reconciliation

**代价**：

- 每个基础值增加 ~40 字节内存
- DOM 中增加注释节点（可优化）

**建议**：立即实施此优化，收益远大于成本。
