# 列表渲染

## 基础列表

```tsx
class TodoList extends Fukict {
  items = [
    { id: 1, text: 'Learn Fukict' },
    { id: 2, text: 'Build something' },
  ];

  render() {
    return (
      <ul>
        {this.items.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    );
  }
}
```

## 动态列表（手动操作）

```tsx
class DynamicList extends Fukict {
  private containerRef: HTMLDivElement | null = null;
  private itemInstances = new Map<string, TodoItem>();
  private placeholders = new Map<string, Comment>();

  addItem(item: Todo) {
    const placeholder = document.createComment(`todo:${item.id}`);
    this.containerRef!.appendChild(placeholder);
    this.placeholders.set(item.id, placeholder);

    const instance = new TodoItem({ item, 'fukict:detach': true });
    instance.mount(this.containerRef!, placeholder);
    this.itemInstances.set(item.id, instance);
  }

  removeItem(id: string) {
    const instance = this.itemInstances.get(id);
    const placeholder = this.placeholders.get(id);

    if (instance && placeholder) {
      instance.unmount();
      placeholder.remove();
      this.itemInstances.delete(id);
      this.placeholders.delete(id);
    }
  }

  render() {
    return <div ref={el => (this.containerRef = el)} />;
  }
}
```

## 虚拟滚动

```tsx
class VirtualScroller extends Fukict<{ items: Item[] }> {
  private containerRef: HTMLDivElement | null = null;
  private visibleItems = new Map<string, ItemComponent>();
  private itemHeight = 50;

  mounted() {
    this.updateVisibleItems();
    this.containerRef?.addEventListener('scroll', () =>
      this.updateVisibleItems(),
    );
  }

  updateVisibleItems() {
    if (!this.containerRef) return;

    const scrollTop = this.containerRef.scrollTop;
    const viewportHeight = this.containerRef.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - 5);
    const end = Math.min(
      this.props.items.length,
      Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + 5,
    );

    const visibleIds = new Set<string>();

    for (let i = start; i < end; i++) {
      const item = this.props.items[i];
      if (!item) continue;

      visibleIds.add(item.id);

      if (!this.visibleItems.has(item.id)) {
        const instance = new ItemComponent({ item, 'fukict:detach': true });
        instance.mount(this.containerRef);
        this.visibleItems.set(item.id, instance);
      }
    }

    for (const [id, instance] of this.visibleItems) {
      if (!visibleIds.has(id)) {
        instance.unmount();
        this.visibleItems.delete(id);
      }
    }

    this.containerRef.style.paddingTop = `${start * this.itemHeight}px`;
    this.containerRef.style.paddingBottom = `${(this.props.items.length - end) * this.itemHeight}px`;
  }

  render() {
    return (
      <div
        ref={el => (this.containerRef = el)}
        style={{ height: '100vh', overflow: 'auto' }}
      />
    );
  }
}
```
