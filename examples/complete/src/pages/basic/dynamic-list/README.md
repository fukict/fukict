# 高性能动态列表示例

## 目录结构

```
dynamic-list/
├── index.tsx                    # 主页面（状态管理组件）
├── HighPerformanceList.tsx      # 高性能列表组件（暴露 APIs）
├── TraditionalList.tsx          # 传统列表组件（性能对比）
├── TodoItemComponent.tsx        # Todo Item 组件
├── types.ts                     # TypeScript 类型定义
└── README.md                    # 本文件
```

## 架构设计

### 三层架构

```
┌─────────────────────────────────────────┐
│  index.tsx (状态管理组件)              │
│  - 管理页面级状态                       │
│  - 通过 this.refs.listRef.add() 调用   │
│  - 展示文档和使用指南                   │
└─────────────────────────────────────────┘
                  │
                  ↓ fukict:ref="perfList"
┌─────────────────────────────────────────┐
│  HighPerformanceList.tsx                │
│  - 暴露 APIs: add/remove/update/move    │
│  - 手动管理子组件实例                   │
│  - 创建 Comment 占位元素                │
└─────────────────────────────────────────┘
                  │
                  ↓ new TodoItemComponent() + mount()
┌─────────────────────────────────────────┐
│  TodoItemComponent.tsx                  │
│  - 通过 new 实例化（不是 JSX）          │
│  - 通过 mount(container, placeholder)   │
│  - 提供 updateTodo() 方法              │
└─────────────────────────────────────────┘
```

## 核心实现原理

### 1. 手动实例化 + 挂载

```tsx
// HighPerformanceList.tsx

add(todo: TodoItem) {
  // 1. 创建 Comment 占位元素
  const placeholder = dom.createComment(`fukict:todo:${todo.id}`);

  // 2. 将占位元素添加到容器的正确位置
  this.containerRef.appendChild(placeholder);

  // 3. 直接实例化 TodoItemComponent
  const instance = new TodoItemComponent({
    todo,
    onToggle: (id) => this.toggle(id),
    onDelete: (id) => this.remove(id),
  });

  // 4. 调用 mount 方法手动挂载
  //    - 第一个参数：容器元素
  //    - 第二个参数：占位元素（可选）
  instance.mount(this.containerRef, placeholder);

  // 5. 保存实例和占位元素的引用
  this.todoInstances.set(todo.id, instance);
  this.todoPlaceholders.set(todo.id, placeholder);
}
```

### 2. 精确更新单个组件

```tsx
update(id: string, newTodo: TodoItem) {
  const instance = this.todoInstances.get(id);
  if (instance) {
    // 直接调用子组件的方法，只更新这一个组件
    instance.updateTodo(newTodo);
  }
  // ✅ 不需要 this.update()，不触发父组件渲染
}
```

### 3. 移除组件

```tsx
remove(id: string) {
  const instance = this.todoInstances.get(id);
  const placeholder = this.todoPlaceholders.get(id);

  if (instance && placeholder) {
    // 1. 卸载组件（触发 beforeUnmount 生命周期）
    instance.unmount();

    // 2. 从 DOM 中移除占位元素
    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }

    // 3. 清理引用
    this.todoInstances.delete(id);
    this.todoPlaceholders.delete(id);
  }
}
```

### 4. 移动组件位置

```tsx
move(fromId: string, toIndex: number) {
  const placeholder = this.todoPlaceholders.get(fromId);
  const instance = this.todoInstances.get(fromId);

  if (placeholder && instance) {
    // 移动占位元素到新位置
    const targetPlaceholder = allPlaceholders[toIndex];
    this.containerRef.insertBefore(placeholder, targetPlaceholder);

    // 组件的 DOM 会自动跟随占位元素移动
  }
}
```

## 暴露的 APIs

### HighPerformanceList 组件 APIs

```tsx
class HighPerformanceList extends Fukict {
  /**
   * 添加 Todo 项
   */
  add(todo: TodoItem): void;

  /**
   * 删除 Todo 项
   */
  remove(id: string): void;

  /**
   * 更新 Todo 项（精确更新单个组件）
   * 注意：方法名改为 updateItem 避免与父类 update() 冲突
   */
  updateItem(id: string, newTodo: TodoItem): void;

  /**
   * 切换完成状态
   */
  toggle(id: string): void;

  /**
   * 移动 Todo 项到指定位置
   */
  move(fromId: string, toIndex: number): void;

  /**
   * 排序（传入比较函数）
   */
  sort(compareFn: (a: TodoItem, b: TodoItem) => number): void;

  /**
   * 按时间排序
   */
  sortByDate(): void;

  /**
   * 获取所有 Todo 项
   */
  getAll(): TodoItem[];

  /**
   * 获取单个 Todo 项
   */
  get(id: string): TodoItem | undefined;
}
```

### 外部调用示例

```tsx
class App extends Fukict {
  declare $refs: {
    perfList: HighPerformanceList;
  };

  handleAddTodo() {
    // 通过 $refs 调用高性能列表的 API
    this.$refs.perfList.add({
      id: `todo-${Date.now()}`,
      text: '新任务',
      completed: false,
      createdAt: Date.now(),
    });
  }

  handleSort() {
    this.$refs.perfList.sortByDate();
  }

  render() {
    return (
      <div>
        <button on:click={() => this.handleAddTodo()}>添加</button>
        <button on:click={() => this.handleSort()}>排序</button>

        <HighPerformanceList fukict:ref="perfList" />
      </div>
    );
  }
}
```

> **重要变更**：
>
> - `refs` 改为 `$refs`（使用 $ 前缀表示框架语法糖）
> - `slots` 改为 `$slots`
> - 修复了 slots 中的组件 ref 注册问题（使用 `__refOwner__` 机制）

## 性能对比

### 传统模式（TraditionalList）

- 使用 JSX 渲染：`{todoArray.map(todo => <TodoItemComponent ... />)}`
- 父组件每次 `update()` 都会重新执行 `render()`
- **所有子组件都会重新渲染**

**性能表现**：

- 添加 10 个任务后
- 父组件渲染：11 次
- 所有子组件渲染总计：110 次（10 个子组件 × 11 次）

### 高性能模式（HighPerformanceList）

- 手动实例化：`new TodoItemComponent()`
- 手动挂载：`instance.mount(container, placeholder)`
- 精确更新：`instance.updateTodo(newData)`

**性能表现**：

- 添加 10 个任务后
- 父组件渲染：11 次
- 所有子组件渲染总计：10 次（每个子组件只渲染 1 次）

**性能提升**：**11x**（在更复杂的场景下可达 100x）

## 关键点总结

### ✅ 正确的做法

1. **Item 组件不是通过 JSX 决定渲染位置的**

   - ❌ 错误：`{todos.map(todo => <TodoItem fukict:detach />)}`
   - ✅ 正确：`new TodoItemComponent()` + `mount()`

2. **使用 Comment 占位元素**

   - `dom.createComment('fukict:todo:1')`
   - 标记组件应该在的位置

3. **暴露 APIs 给外部调用**

   - 高性能列表组件提供 `add/remove/update/move` 等方法
   - 外部通过 `this.refs.listRef.add(todo)` 调用

4. **精确更新**
   - 通过保存的实例引用直接调用 `instance.updateTodo()`
   - 不触发父组件的 `update()`

### ❌ 避免的做法

1. **不要使用 `fukict:detach` + JSX 渲染**

   - 这样仍然会在父组件 update 时执行 diff
   - 性能提升有限

2. **不要依赖框架自动管理**

   - 高性能场景需要手动控制

3. **不要忘记清理**
   - `beforeUnmount` 时要调用所有子组件的 `unmount()`

## 适用场景

### 使用高性能列表模式

- ✅ 大量列表项（100+ 项）
- ✅ 频繁更新（每秒多次）
- ✅ 复杂子组件（渲染成本高）
- ✅ 实时数据（WebSocket、轮询）

### 使用传统模式

- ✅ 简单列表（< 50 项）
- ✅ 低频更新（用户手动触发）
- ✅ 简单子组件（渲染成本低）
- ✅ 代码简洁性优先

## 下一步

查看 `/DYNAMIC_LIST_DESIGN.md` 了解 `@fukict/list` package 的完整设计方案。
