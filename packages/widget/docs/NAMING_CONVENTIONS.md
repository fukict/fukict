# Widget 类命名约定

## 方法和属性命名规则

### 1. 无前缀 - 公开 API

**用途**：用户可以调用或重写的方法

**示例**：

```typescript
class Widget<TProps = {}> {
  // 公开方法（用户可调用）
  public update(newProps: Partial<TProps>): void
  public forceUpdate(): void
  public mount(container: HTMLElement): void
  public unmount(): void

  // 抽象方法（用户必须实现）
  public abstract render(): VNode

  // 生命周期钩子（用户可选实现）
  protected onMounted?(): void
  protected onBeforeUnmount?(): void

  // 公开属性
  public props: TProps
  public slots: SlotsMap
  public refs: Map<string, Widget>
  public element?: HTMLElement
}
```

**特点**：
- 用户可以直接调用
- 用户可以重写（如 `update()`）
- 用户可以选择实现（如 `onMounted()`）

### 2. 双下划线前缀 `__` - 框架内部方法

**用途**：框架内部使用，用户不应直接调用（但可以在子类中调用）

**为什么使用 `__` 而不是 `_`**：
- 下划线有"忽略"之意，单个下划线不够醒目
- 双下划线视觉上非常显眼，明确表示"框架内部"
- 与内部属性 `__vnode__`、`__key__` 保持一致
- Python 社区的惯例，表示"私有/内部"

**示例**：

```typescript
class Widget<TProps = {}> {
  // 内部方法（框架使用）
  protected __performUpdate(): void  // 执行更新流程（diff + patch）

  // 内部辅助方法
  private __unmountChildren(): void
  private __mountChildren(vnode: VNode): void
  private __updateRefs(oldVNode: VNode, newVNode: VNode): void
  private __extractSlots(children: VNodeChild[]): SlotsMap
}
```

**特点**：
- protected：用户可以在子类中调用（如在 `update()` 中调用 `this.__performUpdate()`）
- private：完全内部实现，用户无法访问
- 用户不应直接从外部调用
- 主要供框架内部流程使用

### 3. 双下划线前后缀 `__xxx__` - 内部属性

**用途**：框架内部属性，用户不应访问或修改

**示例**：

```typescript
class Widget<TProps = {}> {
  // 内部属性
  public __vnode__: VNode          // 当前 VNode
  public __key__: string           // 实例唯一标识

  // VNode 内部属性
  interface VNode {
    __instance__?: Widget          // 组件实例引用
    __instanceKey__?: string       // 实例唯一标识
    __detached__?: boolean         // 是否脱围
    __component__?: Function       // 组件构造函数（调试用）
  }
}
```

**特点**：
- 仅供框架内部使用
- 用户不应直接访问或修改
- 主要用于框架内部状态管理

## 完整的 Widget 类 API

```typescript
class Widget<TProps = {}> {
  // ===== 公开 API =====

  /** 构造函数 */
  constructor(props: TProps)

  /** 更新 props（可重写） */
  public update(newProps: Partial<TProps>): void

  /** 强制重建（不可重写） */
  public forceUpdate(): void

  /** 挂载组件（不可重写） */
  public mount(container: HTMLElement): void

  /** 卸载组件（不可重写） */
  public unmount(): void

  /** 渲染方法（抽象，必须实现） */
  public abstract render(): VNode

  // ===== 生命周期钩子 =====

  /** 挂载后钩子（可选实现） */
  protected onMounted?(): void

  /** 卸载前钩子（可选实现） */
  protected onBeforeUnmount?(): void

  // ===== 公开属性 =====

  /** 组件 props */
  public props: TProps

  /** 插槽内容 */
  public slots: SlotsMap

  /** 子组件引用 */
  public refs: Map<string, Widget>

  /** 关联的 DOM 元素 */
  public element?: HTMLElement

  // ===== 框架内部方法（__ 前缀）=====

  /** 执行更新流程（diff + patch） */
  protected __performUpdate(): void

  /** 卸载所有子组件 */
  private __unmountChildren(): void

  /** 挂载所有子组件 */
  private __mountChildren(vnode: VNode): void

  /** 更新 refs */
  private __updateRefs(oldVNode: VNode, newVNode: VNode): void

  /** 提取 slots */
  private __extractSlots(children: VNodeChild[]): SlotsMap

  // ===== 框架内部属性（__xxx__ 形式）=====

  /** 当前渲染的 VNode */
  public __vnode__: VNode

  /** 实例唯一标识 */
  public __key__: string
}
```

## 使用示例

### 正确用法

```typescript
// ✅ 正确：重写 update()，内部调用 __performUpdate()
class MyWidget extends Widget<{ count: number }> {
  update(newProps: Partial<{ count: number }>) {
    const oldCount = this.props.count

    // 更新 props
    this.props = { ...this.props, ...newProps }

    // 处理 props 变化
    if (oldCount !== newProps.count) {
      this.loadData(newProps.count!)
    }

    // 调用框架内部方法
    this.__performUpdate()
  }
}
```

```typescript
// ✅ 正确：实现生命周期钩子
class MyWidget extends Widget<{}> {
  onMounted() {
    console.log('组件已挂载')
  }

  onBeforeUnmount() {
    console.log('组件即将卸载')
  }
}
```

```typescript
// ✅ 正确：从外部调用公开 API
const widget = new MyWidget({ count: 0 })
widget.mount(document.body)
widget.update({ count: 1 })
widget.forceUpdate()
widget.unmount()
```

### 错误用法

```typescript
// ❌ 错误：从外部直接调用 __performUpdate()
const widget = new MyWidget({ count: 0 })
widget.__performUpdate()  // 不推荐！应该调用 update() 或 forceUpdate()
```

```typescript
// ❌ 错误：访问或修改内部属性
const widget = new MyWidget({ count: 0 })
widget.__vnode__ = someVNode  // 不要这样做！
widget.__key__ = 'custom-key'  // 不要这样做！
```

```typescript
// ❌ 错误：重写框架内部方法
class MyWidget extends Widget<{}> {
  // 不推荐重写 __performUpdate()
  protected __performUpdate() {
    // ...
  }
}
```

## 命名约定总结

| 类型           | 命名规则        | 示例                     | 用途             | 用户可访问 |
| -------------- | --------------- | ------------------------ | ---------------- | ---------- |
| 公开方法       | 无前缀          | `update()`, `mount()`    | 用户可调用/重写  | ✅         |
| 生命周期钩子   | 无前缀          | `onMounted()`            | 用户可选实现     | ✅         |
| 公开属性       | 无前缀          | `props`, `refs`          | 用户可访问       | ✅         |
| 框架内部方法   | `__` 前缀       | `__performUpdate()`      | 框架内部使用     | ⚠️（子类可调用）|
| 框架内部属性   | `__xxx__` 形式  | `__vnode__`, `__key__`   | 框架内部状态     | ❌         |

## 命名约定的好处

1. **清晰的职责分离**：
   - 无前缀 = 用户 API
   - `__` 前缀 = 框架内部（protected/private）
   - `__xxx__` = 框架内部属性

2. **避免意外误用**：
   - 用户看到 `__` 前缀，就知道这是内部方法
   - 视觉上非常醒目，比单个 `_` 更显眼
   - 编辑器会给出提示（TypeScript 的 protected/private）

3. **保持灵活性**：
   - 用户可以在 `update()` 中调用 `this.__performUpdate()`
   - 但不会从外部直接调用

4. **便于维护**：
   - 框架开发者可以自由修改 `__` 前缀方法的实现
   - 不影响用户的公开 API

5. **与内部属性一致**：
   - `__performUpdate()` 与 `__vnode__`、`__key__` 风格一致
   - 统一的命名风格，便于识别

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
