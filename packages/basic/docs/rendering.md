# Rendering Mechanism

渲染机制文档：VNode 到 DOM 的转换顺序、Class Component 的初始化/挂载/更新/卸载流程。

## 渲染顺序概览

```
用户代码
  → JSX (babel-plugin 添加 __type__)
  → VNode 结构
  → attach(vnode, container)
  → createRealNode(vnode)
  → activate(vnode, container)
  → DOM 挂载完成
```

## 初始渲染流程

### Element / Fragment / Function Component

```typescript
attach(vnode, container)
  → createRealNode(vnode)
    → renderElement / renderFragment / renderFunctionComponent
    → 返回 Node 或 Node[]
  → activate(vnode, container)
    → container.appendChild(node)
```

**特点**：

- 一次性创建 DOM
- 无生命周期
- Fragment 和 Function Component 可能返回多个节点

### Class Component

```typescript
attach(vnode, container)
  → createRealNode(vnode)
    → renderClassComponent(vnode)
      1. instance = new Component(props, children)
         → constructor() 执行
         → slots = extractSlots(children)
         → _render = this.render()  // 初始 VNode

      2. createRealNode(instance._render)
         → 递归创建 DOM

      3. placeholder = createComment(`fukict:${name}#${id}`)
         vnode.__node__ = placeholder

      4. 返回 placeholder

  → activate(vnode, container)
    → container.appendChild(placeholder)
    → instance.mount(container)
      → 替换 placeholder 为真实 DOM
      → 递归 activate(instance._render)
      → mounted() 钩子执行 ✅
```

**关键点**：

- 构造器阶段就调用 `render()` 得到初始 VNode
- 创建注释节点占位符，保持插入顺序
- `activate()` 时替换占位符为真实 DOM
- `mounted()` 钩子在 DOM 挂载后执行

## 更新机制

### Props 驱动更新（Normal Mode）

```typescript
// 父组件重新渲染，触发子组件更新
diff(oldVNode, newVNode, container)
  → diffClassComponent(oldVNode, newVNode)
    → instance = oldVNode.__instance__

    → 检查 fukict:detach
      if (newVNode.props['fukict:detach']) {
        // 脱围模式：只更新 props，不调用 update()
        instance.props = newVNode.props
        newVNode.__instance__ = instance
        return  // ❌ 不触发 update()
      }

    → instance.update(newVNode.props)  // ✅ 正常更新
      1. prevProps = this.props
      2. this.props = newProps
      3. newVNode = this.render()
      4. diff(this._render, newVNode, this._container)  // 内置 diff
      5. this._render = newVNode
      6. this.updated(prevProps)  // 钩子执行 ✅

    → newVNode.__instance__ = instance
```

**特点**：

- `update()` 由 renderer 调用（props 驱动）
- `update()` 内置 diff，自动更新 DOM
- `updated()` 钩子在 diff 后执行

### 自更新（Self Update）

```typescript
class Counter extends Fukict<{ initial: number }> {
  private count = 0;

  increment() {
    this.count++;
    // 用户主动调用 update() 触发重新渲染
    this.update(this.props);  // ✅ 传入当前 props
  }

  render() {
    return <div on:click={() => this.increment()}>{this.count}</div>;
  }
}
```

**执行流程**：

```typescript
this.update(this.props)
  → 同样的 update() 逻辑
  → this.render()
  → diff(this._render, newVNode, this._container)
  → this.updated(prevProps)
```

**特点**：

- 用户手动调用 `this.update(this.props)`
- 与 props 驱动更新走相同的 `update()` 方法
- 适用于内部状态变化需要重新渲染的场景

### 脱围更新（Detached Mode）

```typescript
// JSX 声明
<MyComponent fukict:detach name="foo" />

// Renderer 行为
if (newVNode.props['fukict:detach']) {
  // 只更新 props，不调用 update()
  instance.props = newVNode.props;
  newVNode.__instance__ = instance;
  // ❌ 不触发 render()
  // ❌ 不触发 diff()
  // ❌ 不触发 updated()
}
```

**用途**：

- 静态内容（props 更新但不需要重新渲染）
- 性能优化（跳过不必要的渲染）
- 用户仍可手动调用 `this.update(this.props)` 触发渲染

**注意**：

- Props 仍然会更新（`instance.props` 是最新的）
- 只是不会触发 `update()` → `render()` → `diff()` 流程

## 卸载机制

```typescript
unmount(vnode)
  → diffClassComponent 中检测到组件需要移除
    → instance.unmount()
      1. this.beforeUnmount()  // 钩子执行 ✅
      2. 清理 refs
         for (ref of this.refs.values()) {
           ref.current = null
         }
         this.refs.clear()
      3. this._render = null
      4. this._container = null
```

**特点**：

- `beforeUnmount()` 在清理前执行
- 自动清理 refs
- 清空内部状态

## 生命周期执行时机总结

| 钩子              | 执行时机          | 触发条件           |
| ----------------- | ----------------- | ------------------ |
| `mounted()`       | DOM 挂载到容器后  | 初次渲染           |
| `updated()`       | diff/patch 完成后 | props 更新或自更新 |
| `beforeUnmount()` | 组件从 DOM 移除前 | 组件卸载           |

**不执行的情况**：

- 脱围模式（`fukict:detach`）：`updated()` 不会被调用

## 自定义 Update 逻辑

用户可以重写 `update()` 实现自定义更新逻辑：

```typescript
class OptimizedComponent extends Fukict<{ data: string }> {
  update(newProps) {
    // 浅比较优化：data 未变化则跳过更新
    if (newProps.data === this.props.data) {
      return;
    }

    // 调用基类的内置 update
    super.update(newProps);
  }
}
```

**注意**：

- 必须调用 `super.update(newProps)` 才能触发内置 diff
- 适用于需要自定义 shouldUpdate 逻辑的场景

---

**Related**: [VNode System](./vnode-system.md) | [Component Design](./component-design.md) | [Lifecycle](./lifecycle.md) | [Diff/Patch](./diff-patch.md)
