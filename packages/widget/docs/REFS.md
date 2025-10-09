# Refs 机制设计

## 设计目标

实现父子组件通信，父组件可以：

- 引用子组件实例
- 调用子组件方法
- 触发子组件更新

## fukict:ref 属性

```tsx
class Parent extends Widget<{}> {
  // 声明 refs 类型
  declare protected refs: {
    child: ChildWidget;
  };

  handleClick = () => {
    // 通过 ref 访问子组件
    this.refs.child.update({ count: 1 });
  };

  render() {
    return <ChildWidget fukict:ref="child" />;
  }
}
```

## Refs 实现机制

**通过 runtime ComponentHandler 实现**：

1. **组件渲染时**：

   - 创建组件实例：`const instance = new Component(props)`
   - 将实例存储在 VNode 上：`vnode.__instance__ = instance`

2. **VNode 后处理时**：

   - 提取 `fukict:ref` 属性
   - **立即填充到父组件 refs**：`parent.refs.set(refName, instance)`
   - 时机：子组件实例化完成后的第一时间

3. **卸载时**：
   - 清理 refs 引用
   - 调用子组件 unmount

## Refs 可用时机

**重要说明**：

| 时机               | refs 是否可用 | 说明                                            |
| ------------------ | ------------- | ----------------------------------------------- |
| `constructor()`    | ❌            | 子组件还未创建                                  |
| `render()`         | ❌            | 子组件实例化在 render 返回之后                  |
| `onMounted()`      | ❌            | 子组件的 onMounted 还未调用（子级后于父级挂载） |
| `onMounted()` 之后 | ✅            | 可以通过异步访问（如 setTimeout、事件处理器）   |
| 事件处理器         | ✅            | 用户交互时，所有组件已完成挂载                  |

**正确用法**：

```typescript
class Parent extends Widget<{}> {
  protected declare refs: {
    child: ChildWidget
  }

  // ❌ 错误：render 中无法访问 refs
  render() {
    // this.refs.child  // undefined
    return <ChildWidget fukict:ref="child" />
  }

  // ❌ 错误：onMounted 中子组件还未挂载完成
  onMounted() {
    // this.refs.child.element  // undefined，子组件的 element 还未设置
  }

  // ✅ 正确：事件处理器中访问
  handleClick = () => {
    this.refs.child.update({ count: 1 })  // ✅ 可用
  }

  // ✅ 正确：异步访问
  async onMounted() {
    await nextTick()
    this.refs.child.update({ count: 1 })  // ✅ 可用
  }
}
```

**为什么 onMounted 中不能访问子组件实例？**

- 生命周期顺序：父组件 onMounted → 子组件 onMounted
- refs 填充时机：子组件实例化后立即填充
- 子组件 element：子组件 onMounted 时才设置
- 因此父组件 onMounted 时，子组件 element 属性还是 undefined

## Refs 的限制

- **仅用于组件**：不能用于 DOM 元素（使用 props.ref）
- **必须指定名称**：`fukict:ref="name"`
- **同名会覆盖**：后注册的覆盖先注册的

## Refs 清理机制

**自动清理时机**：

- 子组件 unmount 时自动从父组件 refs 中移除
- 父组件 unmount 时递归卸载所有子组件

**避免悬空引用**：

```typescript
class Parent extends Widget<{}> {
  declare protected refs: {
    child?: ChildWidget; // ✅ 使用可选类型
  };

  handleClick = () => {
    // ✅ 正确：检查 ref 是否存在
    if (this.refs.child) {
      this.refs.child.update({ count: 1 });
    }

    // ❌ 错误：不检查直接访问
    // this.refs.child.update({ count: 1 })  // 可能抛出错误
  };
}
```

**潜在问题与解决方案**：

- ⚠️ 问题：异步操作中 ref 可能已被清理
- ✅ 方案：在异步回调中检查 ref 是否仍然存在
- ⚠️ 问题：快速卸载/重新挂载可能导致引用混乱
- ✅ 方案：使用唯一 key 或检查组件实例 ID

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
