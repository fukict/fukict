# Fukict v2.1 API 使用示例

> 本文档提供 v2.1 重构后的完整代码示例
> 配合 `ARCHITECTURE_REDESIGN.md` 阅读

---

## 目录

- [Widget 基类 API](#widget-基类-api)
- [更新机制示例](#更新机制示例)
- [Slots 使用示例](#slots-使用示例)
- [Refs 使用示例](#refs-使用示例)
- [脱围机制示例](#脱围机制示例)
- [生命周期示例](#生命周期示例)
- [List 操作示例](#list-操作示例)
- [函数组件示例](#函数组件示例)
- [完整应用示例](#完整应用示例)

---

## Widget 基类 API

### 完整的基类定义

```typescript
class Widget<TProps extends WidgetProps = WidgetProps> {
  // ===== Protected 字段（子类可访问）=====

  protected readonly props: TProps;
  protected slots: Record<string, VNode | VNode[]> = {};
  protected refs: Record<string, Widget> = {};

  private root: Element | null = null;
  private vnode: VNode | null = null;
  private _isMounted = false;

  constructor(initialProps: TProps) {
    this.props = { ...initialProps };
  }

  // ===== 生命周期钩子（子类可覆盖）=====

  /**
   * 组件挂载后的生命周期钩子
   */
  protected onMounted(): void {
    // 默认为空实现
  }

  /**
   * 组件卸载前的生命周期钩子
   */
  protected onUnmounting(): void {
    // 默认为空实现
  }

  /**
   * Props 更新钩子
   * 默认实现：自动触发 re-render
   */
  protected onPropsUpdate(oldProps: TProps, newProps: TProps): void {
    // 默认实现：自动 re-render
    this.forceUpdate();
  }

  // ===== 渲染方法（子类实现）=====

  render(): VNode | null {
    return null;
  }

  // ===== 核心方法（FINAL - 禁止覆盖）=====

  /**
   * 挂载组件到容器
   * @final - 子类不得覆盖此方法
   */
  async mount(container: Element, immediate = false): Promise<void> {
    // 框架逻辑...
  }

  /**
   * 卸载组件
   * @final - 子类不得覆盖此方法
   */
  unmount(): void {
    // 框架逻辑...
  }

  // ===== 标准 API（子类可使用）=====

  /**
   * 更新组件 props
   */
  update(newProps: Partial<TProps>): void {
    const oldProps = this.props;
    this.props = { ...this.props, ...newProps };
    this.onPropsUpdate(oldProps, this.props);
  }

  /**
   * 强制重新渲染
   */
  protected forceUpdate(): void {
    // Widget 层的 diff/patch 逻辑...
  }

  // ===== Refs 辅助方法 =====

  protected hasRef(name: string): boolean {
    return name in this.refs;
  }

  protected deleteRef(name: string): boolean {
    if (name in this.refs) {
      delete this.refs[name];
      return true;
    }
    return false;
  }

  protected clearRefs(): void {
    this.refs = {};
  }

  protected forEachRef(
    callback: (name: string, ref: Widget) => void
  ): void {
    for (const name in this.refs) {
      callback(name, this.refs[name]);
    }
  }

  // ===== DOM 查询 API =====

  $(selector: string): DOMQuery | null { /* ... */ }
  $$(selector: string): DOMBatchQuery { /* ... */ }

  // ===== Getters =====

  get isMounted(): boolean {
    return this._isMounted;
  }

  get element(): Element | null {
    return this.root;
  }
}
```

### 泛型使用和类型扩展

```typescript
interface MyProps {
  title: string;
  count: number;
}

class MyWidget extends Widget<MyProps> {
  // 扩展 refs 类型（可选）
  protected declare refs: {
    header: Header;
    footer: Footer;
  };

  // 扩展 slots 类型（可选）
  protected declare slots: {
    content: VNode;
    header?: VNode;
  };

  render() {
    // 完美的类型推断
    return (
      <div>
        <h1>{this.props.title}</h1>
        {this.slots.header}
        {this.slots.content}
      </div>
    );
  }

  someMethod() {
    // 类型安全的 refs 访问
    this.refs.header.setTitle('New Title');
    this.refs.footer.update({ year: 2025 });
  }
}
```

---

## 更新机制示例

### 模式 1：完全自动（默认）

```tsx
class Counter extends Widget<{ count: number }> {
  // 不重写 onPropsUpdate，使用默认实现

  render() {
    return <div>Count: {this.props.count}</div>;
  }
}

class App extends Widget {
  protected declare refs: {
    counter: Counter;
  };

  private count = 0;

  render() {
    return (
      <div>
        <Counter fukict:ref="counter" count={this.count} />
        <button on:click={() => this.increment()}>+</button>
      </div>
    );
  }

  increment() {
    this.count++;
    this.forceUpdate();
    // ↑ 框架 diff VNode，发现 counter props 变化
    // ↓ 自动调用 this.refs.counter.update({ count: this.count })
    // ↓ counter.onPropsUpdate 默认调用 forceUpdate()
    // ↓ counter 自动 re-render
  }
}
```

### 模式 2：Re-render 脱围（自定义更新策略）

```tsx
class OptimizedTable extends Widget<{ data: TableData }> {
  /**
   * 重写 onPropsUpdate，自定义更新逻辑
   */
  protected onPropsUpdate(oldProps, newProps): void {
    const oldData = oldProps.data;
    const newData = newProps.data;

    // 检查结构变化
    if (this.isStructureChanged(oldData, newData)) {
      // 结构变化：完全 re-render
      this.forceUpdate();
    } else {
      // 仅数据变化：手动更新 DOM（高性能）
      this.updateTableContent(newData);
    }
  }

  private isStructureChanged(oldData, newData) {
    return oldData.columns.length !== newData.columns.length;
  }

  private updateTableContent(data: TableData) {
    // 手动 DOM 操作
    const rows = this.$$('tbody tr').elements;
    data.rows.forEach((rowData, i) => {
      const cells = rows[i].querySelectorAll('td');
      rowData.forEach((cellData, j) => {
        cells[j].textContent = cellData;
      });
    });
  }

  render() {
    return (
      <table>
        <thead>
          <tr>
            {this.props.data.columns.map(col => <th>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {this.props.data.rows.map(row => (
            <tr>{row.map(cell => <td>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    );
  }
}

class Dashboard extends Widget {
  protected declare refs: {
    table: OptimizedTable;
  };

  render() {
    return (
      <div>
        {/* 不使用 fukict:detach，但 table 自己控制更新策略 */}
        <OptimizedTable fukict:ref="table" data={this.state.tableData} />
      </div>
    );
  }

  handleDataUpdate() {
    this.forceUpdate();
    // ↓ 框架调用 table.update(newProps)
    // ↓ table.onPropsUpdate 自定义逻辑
    // ↓ 可能 re-render，也可能手动 DOM
  }
}
```

### 模式 3：完全脱围（父组件精确控制）

```tsx
class VideoPlayer extends Widget<{ src: string }> {
  private player: HTMLVideoElement | null = null;

  protected onMounted() {
    this.player = this.$('video')!.element as HTMLVideoElement;
  }

  // 自定义公开方法
  play() {
    this.player?.play();
  }

  pause() {
    this.player?.pause();
  }

  setSrc(src: string) {
    if (this.player) {
      this.player.src = src;
    }
  }

  render() {
    return <video src={this.props.src} />;
  }
}

class VideoGallery extends Widget {
  protected declare refs: {
    player: VideoPlayer;
  };

  private currentSrc = 'video1.mp4';

  render() {
    return (
      <div>
        {/* fukict:detach - 完全脱围 */}
        <VideoPlayer
          fukict:ref="player"
          fukict:detach
          src={this.currentSrc}
        />
        <button on:click={() => this.handlePlay()}>Play</button>
        <button on:click={() => this.handleChangeVideo()}>Change Video</button>
      </div>
    );
  }

  handlePlay() {
    // 手动调用自定义方法
    this.refs.player.play();
  }

  handleChangeVideo() {
    this.currentSrc = 'video2.mp4';
    this.forceUpdate();
    // ↑ 框架 diff，但因为 fukict:detach
    // ↓ 不会调用 player.update()

    // 手动调用自定义方法
    this.refs.player.setSrc(this.currentSrc);
  }
}
```

---

## Slots 使用示例

### 基本用法

```tsx
class Dialog extends Widget<{ title: string }> {
  render() {
    return (
      <div class="dialog">
        <header>{this.slots.header}</header>
        <main>{this.slots.body ?? <p>Empty content</p>}</main>
        <footer>{this.slots.footer}</footer>
      </div>
    );
  }
}

class App extends Widget {
  render() {
    return (
      <Dialog title="My Dialog">
        <h1 fukict:slot="header">Dialog Title</h1>
        <div fukict:slot="body">
          <p>This is the body content</p>
        </div>
        <div fukict:slot="footer">
          <button>OK</button>
          <button>Cancel</button>
        </div>
      </Dialog>
    );
  }
}
```

### 默认插槽

```tsx
class Card extends Widget {
  render() {
    return (
      <div class="card">
        <header>{this.slots.header}</header>
        <div class="card-body">{this.slots.default}</div>
      </div>
    );
  }
}

// 使用
<Card>
  <h2 fukict:slot="header">Card Title</h2>
  <p>This goes to default slot</p>
  <p>This too</p>
</Card>
```

### 类型扩展

```tsx
class MyComponent extends Widget {
  protected declare slots: {
    header: VNode;
    footer?: VNode;
    default?: VNode[];
  };

  render() {
    return (
      <div>
        {this.slots.header}
        {this.slots.default}
        {this.slots.footer}
      </div>
    );
  }
}
```

---

## Refs 使用示例

### 单个 Ref

```tsx
class Parent extends Widget {
  protected declare refs: {
    header: Header;
    footer: Footer;
  };

  render() {
    return (
      <div>
        <Header fukict:ref="header" title="My App" />
        <Footer fukict:ref="footer" />
      </div>
    );
  }

  someMethod() {
    // 类型安全的访问
    this.refs.header.setTitle('New Title');
    this.refs.footer.update({ year: 2025 });

    // 使用辅助方法
    if (this.hasRef('header')) {
      console.log('Header exists');
    }
  }
}
```

### 同名 Ref 覆盖

```tsx
class App extends Widget {
  protected declare refs: {
    modal: Modal;
  };

  render() {
    return (
      <div>
        {this.state.showModal1 && (
          <Modal fukict:ref="modal" type="confirm" />
        )}
        {this.state.showModal2 && (
          <Modal fukict:ref="modal" type="alert" />
        )}
        {/* 同名 ref，后渲染的覆盖先渲染的 */}
      </div>
    );
  }

  handleAction() {
    // 访问的是最后渲染的 Modal
    this.refs.modal?.close();
  }
}
```

---

## 脱围机制示例

### 完全脱围 - 父组件精确控制

参见 [模式 3：完全脱围](#模式-3完全脱围父组件精确控制)

### Re-render 脱围 - 自定义更新策略

参见 [模式 2：Re-render 脱围](#模式-2re-render-脱围自定义更新策略)

---

## 生命周期示例

### 基本生命周期

```tsx
class MyComponent extends Widget<{ userId: string }> {
  private timer: number | null = null;

  protected onMounted() {
    console.log('Component mounted, DOM ready');

    // 启动定时器
    this.timer = setInterval(() => {
      this.fetchData();
    }, 5000);

    // 访问 DOM
    const root = this.element;
    console.log('Root element:', root);

    // 访问 refs
    console.log('Child refs:', this.refs);
  }

  protected onUnmounting() {
    console.log('Component unmounting, cleanup');

    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  protected onPropsUpdate(oldProps, newProps) {
    console.log('Props updated:', oldProps, '->', newProps);

    // 默认：自动 re-render
    this.forceUpdate();
  }

  fetchData() {
    // 获取数据...
  }

  render() {
    return <div>User ID: {this.props.userId}</div>;
  }
}
```

---

## List 操作示例

### 方式 1：框架整体 diff（简单更新）

```tsx
interface TodoData {
  id: string;
  text: string;
  completed: boolean;
}

class TodoList extends Widget {
  private todos: TodoData[] = [];

  render() {
    return (
      <ul class="todo-list">
        {this.todos.map(item => (
          <TodoItem
            id={item.id}
            text={item.text}
            completed={item.completed}
          />
        ))}
      </ul>
    );
  }

  addItem(text: string) {
    this.todos.push({
      id: `todo-${Date.now()}`,
      text,
      completed: false,
    });
    this.forceUpdate();
    // ↑ 框架整体 diff 列表，自动创建/更新/删除 TodoItem 实例
  }

  removeItem(id: string) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.forceUpdate();
    // ↑ 框架整体 diff，自动卸载被删除的实例
  }

  updateItem(id: string, updates: Partial<TodoData>) {
    const index = this.todos.findIndex(t => t.id === id);
    this.todos[index] = { ...this.todos[index], ...updates };
    this.forceUpdate();
    // ↑ 框架 diff，自动调用对应实例的 update()
  }

  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.forceUpdate();
  }
}
```

### 方式 2：WidgetList 辅助（精细更新）

```tsx
class OptimizedTodoList extends Widget {
  private list = new WidgetList<TodoItem>();

  render() {
    return <ul class="todo-list" />;
  }

  protected onMounted() {
    // 绑定 DOM 容器（框架管理）
    this.list.attachTo(this.$('.todo-list')!.element);
  }

  addItem(text: string) {
    // 需要 new Widget 实例
    const item = new TodoItem({
      id: `todo-${Date.now()}`,
      text,
      completed: false,
    });

    this.list.add(item);
    // ↑ 自动 mount，最小粒度更新
  }

  insertItem(data: TodoData, index: number) {
    const item = new TodoItem(data);
    this.list.add(item, index); // 插入到指定位置
  }

  removeItem(index: number) {
    this.list.remove(index);
    // ↑ 自动 unmount
  }

  updateItem(index: number, updates: Partial<TodoData>) {
    this.list.update(index, updates);
    // ↑ 调用实例的 update()
  }

  moveItems() {
    // 批量移动
    this.list.move([
      { from: 0, to: 2 },
      { from: 3, to: 1 }
    ]);
  }

  getItem(index: number) {
    return this.list.getItem(index);
  }
}
```

### WidgetList 完整 API

```typescript
class WidgetList<T extends Widget = Widget> {
  /**
   * 绑定到 DOM 容器
   */
  attachTo(container: Element): void;

  /**
   * 添加 widget 到列表
   * @param widget Widget 实例（需要 new Widget()）
   * @param index 可选，插入位置
   */
  add(widget: T, index?: number): void;

  /**
   * 移除指定索引的 widget
   */
  remove(index: number): T | undefined;

  /**
   * 更新指定索引的 widget
   */
  update(index: number, newProps: any): void;

  /**
   * 批量移动 widgets
   * @param operations 移动操作数组
   */
  move(operations: Array<{from: number; to: number}>): void;

  /**
   * 获取指定索引的 widget
   */
  getItem(index: number): T | undefined;

  /**
   * 清空所有 widgets
   */
  clear(): void;

  /**
   * 列表长度
   */
  get length(): number;
}
```

---

## 函数组件示例

### 基本用法

```typescript
const Counter = defineWidget<{
  count: number;
  onMounted?: (instance: any) => void;
  onUnmounting?: () => void;
  onPropsUpdate?: (oldProps: any, newProps: any) => void;
}>(({ count }) => (
  <div>Count: {count}</div>
));

// 使用
const instance = Counter({
  count: 0,
  onMounted: (inst) => {
    console.log('Mounted!', inst);
  },
  onUnmounting: () => {
    console.log('Unmounting!');
  },
  onPropsUpdate: (old, newProps) => {
    console.log('Props updated:', old.count, '->', newProps.count);
    // 如果不提供，默认会自动 re-render
  },
});

await instance.mount(container);

// 更新
instance.update({ count: 1 });

// 卸载
instance.unmount();
```

### 自定义更新策略

```typescript
const SmartComponent = defineWidget<{
  data: Data;
  onPropsUpdate?: (old: any, newProps: any) => void;
}>(({ data }) => (
  <div>{data.value}</div>
));

const instance = SmartComponent({
  data: initialData,
  onPropsUpdate: (old, newProps) => {
    // 自定义更新逻辑
    if (old.data.id !== newProps.data.id) {
      // 需要 re-render
      instance._forceUpdate();
    } else {
      // 手动 DOM 操作，跳过 re-render
      instance.element.textContent = newProps.data.value;
    }
  },
});
```

---

## 完整应用示例

### TodoMVC 完整实现

```tsx
// TodoItem 组件
class TodoItem extends Widget<{
  id: string;
  text: string;
  completed: boolean;
}> {
  toggle() {
    const checkbox = this.$('input[type="checkbox"]')!.element as HTMLInputElement;
    checkbox.checked = !checkbox.checked;
  }

  render() {
    return (
      <li class={this.props.completed ? 'completed' : ''}>
        <input
          type="checkbox"
          checked={this.props.completed}
        />
        <span>{this.props.text}</span>
      </li>
    );
  }
}

// TodoApp 主应用
class TodoApp extends Widget {
  private todos: TodoData[] = [];

  render() {
    return (
      <div class="todo-app">
        <h1>Todos</h1>

        <input
          type="text"
          placeholder="What needs to be done?"
          on:keydown={(e) => this.handleKeyDown(e)}
        />

        <ul class="todo-list">
          {this.todos.map(item => (
            <TodoItem
              id={item.id}
              text={item.text}
              completed={item.completed}
            />
          ))}
        </ul>

        <footer>
          <button on:click={() => this.handleToggleAll()}>
            Toggle All
          </button>
        </footer>
      </div>
    );
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement;
      this.addTodo(input.value);
      input.value = '';
    }
  }

  addTodo(text: string) {
    this.todos.push({
      id: `todo-${Date.now()}`,
      text,
      completed: false,
    });
    this.forceUpdate();
  }

  handleToggleAll() {
    this.todos.forEach(todo => {
      todo.completed = !todo.completed;
    });
    this.forceUpdate();
  }
}

// 启动应用
const app = new TodoApp({});
await app.mount(document.getElementById('root')!);
```

### 复杂应用 - Dashboard（脱围 + WidgetList）

```tsx
class Dashboard extends Widget {
  protected declare refs: {
    header: Header;
    sidebar: Sidebar;
    chart: ChartWidget;
  };

  private dataWidgets = new WidgetList<DataWidget>();
  private refreshTimer: number | null = null;

  protected onMounted() {
    // 启动自动刷新
    this.refreshTimer = setInterval(() => {
      this.refreshData();
    }, 30000);

    // 绑定列表容器
    this.dataWidgets.attachTo(this.$('.widgets-container')!.element);

    // 初始化数据 widgets
    this.initDataWidgets();
  }

  protected onUnmounting() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.dataWidgets.clear();
  }

  render() {
    return (
      <div class="dashboard">
        <Header fukict:ref="header" />

        <div class="dashboard-body">
          <Sidebar fukict:ref="sidebar" />

          <main>
            {/* Chart 脱围，手动控制 */}
            <ChartWidget
              fukict:ref="chart"
              fukict:detach
              data={this.state.chartData}
            />

            {/* 数据 widgets 容器 */}
            <div class="widgets-container" />
          </main>
        </div>
      </div>
    );
  }

  initDataWidgets() {
    // 使用 WidgetList 管理
    this.state.widgets.forEach(config => {
      this.dataWidgets.add(new DataWidget(config));
    });
  }

  async refreshData() {
    const newData = await fetchData();

    // 手动更新 chart（脱围）
    this.refs.chart.updateData(newData.chart);

    // 更新数据 widgets
    newData.widgets.forEach((data, index) => {
      this.dataWidgets.update(index, data);
    });
  }

  addWidget(config: WidgetConfig) {
    this.dataWidgets.add(new DataWidget(config));
  }

  removeWidget(index: number) {
    this.dataWidgets.remove(index);
  }
}

// 使用
const dashboard = new Dashboard({});
await dashboard.mount(container);
```

---

**文档结束**
