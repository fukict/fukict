# Widget 生命周期设计

## Widget 类生命周期

```
创建: constructor(props)
  ↓
挂载: mount(container)
  ↓ 渲染并插入 DOM
onMounted() ← 初始化钩子
  ↓
[运行中]
  ↓
update(newProps) ← 可重写，控制更新逻辑
  ↓ this.props = { ...this.props, ...newProps }
  ↓ this.__performUpdate() ← 平滑更新（带 diff）
  ↓ diff/patch DOM
  ↓
[运行中]
  ↓
onBeforeUnmount() ← 清理钩子
  ↓
unmount()
  ↓ 清理 refs，移除 DOM
```

## 挂载方式

Widget 支持两种挂载方式：

### 1. 自动挂载（通过 JSX）

```tsx
class App extends Widget<{}> {
  render() {
    return (
      <div>
        <ChildWidget /> {/* 自动挂载，自动触发 onMounted */}
      </div>
    );
  }
}
```

### 2. 手动挂载（通过 mount 方法）

```typescript
const widget = new MyWidget({ count: 0 });
widget.mount(document.body); // 手动挂载，手动控制时机
```

## 生命周期钩子说明

### onMounted()

- **时机**：DOM **插入到文档**后立即调用
- **用途**：初始化、事件绑定、数据请求、DOM 查询
- **注意**：
  - 此时 `this.element` 已设置，可以访问 DOM
  - 此时 refs 已注册（自动挂载的子组件）
  - **手动挂载的子组件**需要在 `onMounted` 中调用 `mount()`

### onBeforeUnmount()

- **时机**：DOM 移除前
- **用途**：清理、解绑事件、取消请求
- **注意**：此时 DOM 和 refs 都还在，可以访问

## 为什么只有 2 个生命周期钩子？

**决策**：只保留 `onMounted`、`onBeforeUnmount`

**理由**：

- Fukict 更新是显式的（非响应式）
- 用户在 `update()` 方法中完全控制更新逻辑
- **不需要 onPropsUpdated**：`update()` 方法本身就是 props 更新的钩子
- 不需要额外的 `onBeforeUpdate`/`onUpdated` 拦截自动更新
- 保持简单，降低学习成本

**权衡**：

- 比 React/Vue 少很多钩子
- 但符合 Fukict "显式优于隐式"的理念

## 在 update() 中处理 props 变化

**示例**：

```typescript
class MyWidget extends Widget<{ userId: number }> {
  update(newProps: Partial<{ userId: number }>) {
    const oldUserId = this.props.userId;

    // 更新 props
    this.props = { ...this.props, ...newProps };

    // 处理 props 变化
    if (oldUserId !== newProps.userId) {
      this.loadUserData(newProps.userId!);
    }

    // 平滑更新
    this.__performUpdate();
  }
}
```

## 函数组件没有生命周期

**理由**：

- 保持简单
- 避免复杂度（不实现 Hooks）
- 如果需要生命周期，使用 Widget 类

## 手动挂载示例

### 场景：延迟加载子组件

```typescript
class LazyParent extends Widget<{}> {
  private lazyChild?: HeavyWidget;

  onMounted() {
    // 在父组件挂载后，延迟加载子组件
    setTimeout(() => {
      this.lazyChild = new HeavyWidget({ data: 'heavy' });

      const container = this.element!.querySelector('.lazy-container')!;
      this.lazyChild.mount(container);  // ✅ 手动挂载
    }, 1000);
  }

  onBeforeUnmount() {
    // 手动卸载子组件
    this.lazyChild?.unmount();
  }

  render() {
    return (
      <div>
        <div class="lazy-container"></div>
      </div>
    );
  }
}
```

### 场景：条件挂载

```typescript
class ConditionalParent extends Widget<{ showChild: boolean }> {
  private child?: ChildWidget;

  update(newProps: Partial<{ showChild: boolean }>) {
    const oldShow = this.props.showChild;
    this.props = { ...this.props, ...newProps };

    // 根据 props 变化控制子组件挂载/卸载
    if (!oldShow && newProps.showChild) {
      // 显示子组件
      this.child = new ChildWidget({});
      const container = this.element!.querySelector('.child-container')!;
      this.child.mount(container);
    } else if (oldShow && !newProps.showChild) {
      // 隐藏子组件
      this.child?.unmount();
      this.child = undefined;
    }
  }

  render() {
    return (
      <div>
        <div class="child-container"></div>
      </div>
    );
  }
}
```

---

**文档状态**：设计阶段
**最后更新**：2025-01-09
