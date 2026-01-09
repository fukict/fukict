# 性能优化

## 脱围模式

让子组件跳过父组件更新时的自动渲染：

```tsx
class Parent extends Fukict {
  render() {
    return <ExpensiveChild fukict:detach={true} />;
  }

  updateParent() {
    this.update(); // Child 不会更新
  }
}
```

## 手动控制脱围组件

```tsx
class Parent extends Fukict {
  private child: Child | null = null;

  mounted() {
    this.child = this.$refs.child as Child;
  }

  updateChild(newData) {
    if (this.child) {
      this.child.props.data = newData;
      this.child.update(); // 手动触发
    }
  }

  render() {
    return <Child fukict:detach={true} fukict:ref="child" />;
  }
}
```

## 条件更新

```tsx
class Smart extends Fukict<{ data: any }> {
  update(newProps?) {
    if (newProps && newProps.data === this.props.data) return;
    super.update(newProps);
  }
}
```

## 批量更新

```tsx
class Batch extends Fukict {
  items: Item[] = [];

  addItems(newItems: Item[]) {
    this.items = [...this.items, ...newItems];
    this.update(); // 一次性更新
  }
}
```
