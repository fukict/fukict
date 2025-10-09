# Slots 机制设计

## 设计目标

实现内容投影（类似 Vue slots / React children）

## 默认插槽

```tsx
class Dialog extends Widget<{ title: string }> {
  render() {
    return (
      <div class="dialog">
        <h1>{this.props.title}</h1>
        <div class="body">{this.slots.default}</div>
      </div>
    );
  }
}

// 使用
<Dialog title="标题">
  <p>这是内容</p>
</Dialog>;
```

## 具名插槽

```tsx
class Dialog extends Widget<{ title: string }> {
  render() {
    return (
      <div class="dialog">
        {this.slots.header || <h1>{this.props.title}</h1>}
        <div class="body">{this.slots.default}</div>
        {this.slots.footer || <button>确定</button>}
      </div>
    );
  }
}

// 使用
<Dialog title="标题">
  <h2 fukict:slot="header">自定义标题</h2>
  <p>内容</p>
  <div fukict:slot="footer">
    <button>取消</button>
    <button>确定</button>
  </div>
</Dialog>;
```

## Slots 实现机制

**在 Widget 基类 constructor 中提取**：

1. 从 `props.children` 中提取
2. 检查每个子节点的 `fukict:slot` 属性
3. 有属性的归入具名 slot
4. 无属性的归入 `default` slot
5. 存储到 `this.slots`
6. **隐藏 children 属性**：用户无法直接访问 `this.props.children`

## Slots 可用时机

**重要说明**：

| 时机            | slots 是否可用 | 说明                        |
| --------------- | -------------- | --------------------------- |
| `constructor()` | ✅             | 在基类 constructor 中已提取 |
| `render()`      | ✅             | 可以直接在 render 中使用    |
| `onMounted()`   | ✅             | 始终可用                    |
| 任何方法        | ✅             | 始终可用                    |

**用法示例**：

```typescript
class Dialog extends Widget<{ title: string }> {
  constructor(props) {
    super(props)

    // ✅ constructor 中已可用
    console.log(this.slots.default)  // ✅ 可用
    console.log(this.props.children) // ❌ undefined，已被隐藏
  }

  render() {
    // ✅ render 中直接使用
    return (
      <div class="dialog">
        <h1>{this.props.title}</h1>
        <div class="body">{this.slots.default}</div>
        <div class="footer">{this.slots.footer}</div>
      </div>
    )
  }
}
```

**为什么不暴露 children？**

- slots 机制已经提供了更好的内容投影方式
- 避免用户直接操作 children 导致混乱
- 统一使用 slots API

## Slots 类型

```typescript
type SlotsMap = {
  default?: VNodeChild[]; // 默认插槽
  [name: string]: VNodeChild[] | undefined; // 具名插槽
};
```

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
