# TODO List

## 完成任务

### ✅ 1. Class Component 渲染机制（完整重构）

**完成内容**：

#### 1.1 重命名：`createDomNode` → `createRealNode`

- 强调创建真实 DOM 节点
- 所有调用已更新

#### 1.2 组件实例标识系统

- `Fukict` 类添加 `$id`（自增唯一 ID）
- `Fukict` 类添加 `$name`（组件名称 = constructor.name）
- 全局计数器 `componentIdCounter` 管理 ID 分配

#### 1.3 注释节点占位符方案

**问题**：Element children 中的 Class Component 插入顺序问题

**解决方案**：

```typescript
// 创建阶段：返回注释节点占位符
renderClassComponent(vnode) {
  const instance = new Component(props, children);
  const placeholder = createComment(`fukict:${instance.$name}#${instance.$id}`);
  vnode.__node__ = placeholder;
  createRealNode(instance._render);  // 创建真实 DOM 但不挂载
  return placeholder;  // 父节点插入占位符
}

// 激活阶段：替换占位符为真实 DOM
activate(ClassComponent) {
  const realDOM = instance._render.__node__;
  placeholder.parentNode.replaceChild(realDOM, placeholder);
  activate(instance._render, container);  // 递归
  instance.mount(container);  // 触发 mounted()
}
```

**优点**：

- ✅ 保持插入顺序正确
- ✅ 每个组件有唯一标识（方便 DevTools 观察）
- ✅ 注释节点清晰标注：`<!--fukict:Counter#1-->`

#### 1.4 `activate` 函数重构

- 不再接收 `node` 参数，从 `vnode.__node__` 获取
- 每种 VNode 类型：先挂载 DOM，再递归 activate children
- Class Component：替换占位符 → 递归 activate → 触发 mounted()
- 挂载瞬间触发钩子（保持浏览器原生性）

#### 1.5 类型定义更新

```typescript
interface ClassComponentVNode {
  __node__?: Comment; // 注释节点占位符
}
```

#### 1.6 DOM 工具扩展

- 添加 `createComment(data: string): Comment`
- 导出到 `dom/index.ts`

**设计决策**：

- 命名：`createDomNode` → `createRealNode`（强调真实 DOM）
- 占位符：注释节点 + 组件标识（解决插入顺序 + 方便调试）
- 原子操作：挂载 DOM 后立即触发对应节点的钩子
- 无循环引用：mount.ts 不依赖 index.ts

---

## 最近完成（2025-01-10）

### ✅ 7. Function Component 支持（已完成）

**背景**：发现 Function Component 支持不完整

**完成内容**：

- ✅ 创建 `component-function/` 目录
- ✅ 实现 `defineFukict` 辅助函数（类型推导）
- ✅ 导出 `FunctionComponent` 类型
- ✅ 修复 `vnode.ts`：添加运行时 `__type__` 检测（作为 babel-plugin fallback）
- ✅ 支持在没有 babel-plugin 的情况下正常工作

**关键实现**：

```typescript
// 运行时类型检测
function detectVNodeType(type) {
  if (type === Fragment) return VNodeType.Fragment;
  if (typeof type === 'string') return VNodeType.Element;
  if (type.prototype instanceof Fukict) return VNodeType.ClassComponent;
  return VNodeType.FunctionComponent;
}
```

### ✅ 8. diff.ts 拆分重构（已完成）

**背景**：diff.ts 文件过大（547 行），不易维护

**完成内容**：

- ✅ 创建 `renderer/diff/` 目录
- ✅ 拆分为 8 个模块化文件：
  - `index.ts` (120 行) - 主入口和 diff 函数
  - `element.ts` (51 行) - diffElement
  - `fragment.ts` (45 行) - diffFragment
  - `function.ts` (55 行) - diffFunctionComponent
  - `class.ts` (48 行) - diffClassComponent
  - `children.ts` (51 行) - diffChildren
  - `props.ts` (131 行) - patchProps, setProp, removeProp
  - `helpers.ts` (120 行) - replaceNode, removeNode, shallowEqual
- ✅ 删除旧的 diff.ts
- ✅ 更新所有导入路径
- ✅ 类型检查和构建通过

**优势**：

- 每个文件职责清晰、易于理解
- 便于单独测试和维护
- 减少认知负担

---

## 已完成的核心功能

**文件**：`src/renderer/diff.ts`

**完成内容**：

- ✅ `diff` - 主入口函数，处理类型检查和分发
- ✅ `diffElement` - 复用 DOM，patch props，递归 diff children
- ✅ `diffFragment` - diff children 数组，更新 `__node__`
- ✅ `diffFunctionComponent` - 浅比较 props，re-call function
- ✅ `diffClassComponent` - 调用 `instance.update(newProps)`，支持 detached 模式
- ✅ `diffChildren` - 简化的 children diff（无 key 优化）
- ✅ `patchProps` - 更新 element props/events/styles
- ✅ `replaceNode` - 完整节点替换
- ✅ `removeNode` - 移除节点并调用生命周期

**关键实现**：

- 类型不匹配 → `replaceNode`
- Element 类型不同 → `replaceNode`
- Function Component 浅比较 props → 跳过 re-render
- Class Component detached 模式 → 只更新 props，跳过 update()

### ✅ 3. 修复 Fukict.update（已完成）

**文件**：`src/component-class/fukict.ts:133`

**完成内容**：

- ✅ 导入 `diff` 函数
- ✅ 调用 `diff(this._render, newVNode, this._container)`
- ✅ 内置 diff 机制正常工作

### ✅ 4. 实现 Detached 逻辑（已完成）

**文件**：`src/renderer/diff.ts` 中的 `diffClassComponent`

**完成内容**：

```typescript
// Check detached mode
if (newVNode.props && newVNode.props['fukict:detach']) {
  // Detached mode: only update props, skip update()
  (instance.props as any) = newVNode.props;
  return;
}
```

---

### ✅ 6. 编写 EXAMPLES.md（已完成）

**文件**：`docs/EXAMPLES.md`

**完成内容**：

- ✅ 基础渲染示例
- ✅ Class Component 完整示例（Counter、Timer、TodoList）
- ✅ Function Component 示例
- ✅ Self-Update 模式示例
- ✅ Props-Driven Update 示例
- ✅ Detached 模式示例
- ✅ 生命周期钩子示例
- ✅ Refs 示例（单个和多个）
- ✅ Slots 示例（默认和命名）
- ✅ 自定义 update 逻辑示例
- ✅ 最佳实践说明

---

## 待完成任务

### 5. 编写测试用例（暂缓）

**内容**：

- 基础渲染测试
- Props 更新测试
- 自更新测试（`this.update(this.props)`）
- Detached 模式测试
- 生命周期钩子测试
- 占位符替换测试

### 6. 编写 EXAMPLES.md

**内容**：

- Class Component 完整示例（Counter）
- Function Component 示例
- Detached 示例
- 自定义 update 逻辑示例
- Lifecycle hooks 示例

---

## 任务清单

- [x] 实现 renderClassComponent：注释节点占位符方案
- [x] 创建 diff.ts：4 种 VNode 的 diff 策略
- [x] 在 Fukict.update 中集成 diff 函数
- [x] 在 diffClassComponent 中处理 fukict:detach
- [x] 编写 EXAMPLES.md 使用示例
- [ ] 编写测试用例验证功能（需要先配置测试框架）

---

## 已完成的核心功能

### ✅ Class Component 渲染和更新机制

- 注释节点占位符方案
- 组件实例标识系统（`$id`、`$name`）
- activate 函数（挂载时触发钩子）
- diff 函数（4 种 VNode 类型的 diff 策略）
- Fukict.update 内置 diff
- Detached 模式（fukict:detach）

### ✅ 文档

- DESIGN.md - 设计文档
- EXAMPLES.md - 完整使用示例
- TODO.md - 任务追踪

---

## 下一步

1. **配置测试框架**（Vitest 推荐）
2. **编写测试用例**：
   - 基础渲染测试
   - Props 更新测试
   - Self-update 测试
   - Detached 模式测试
   - 生命周期钩子测试
   - Refs 测试
   - Slots 测试
3. **性能优化**：
   - 优化 diff 算法
   - 添加 key-based diff（可选）
4. **构建和发布**：
   - 构建测试
   - 体积检查
   - 准备发布
