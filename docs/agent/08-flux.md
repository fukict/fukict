# Flux 状态管理

官方全局状态管理，提供订阅机制。

## 适用场景

- **全局性状态**：跨组件共享，不依赖组件实例
- **脱围组件订阅**：脱围组件精确订阅，最少运行时更新
- **非实例上下文**：不属于任何组件实例的状态

## 安装

```bash
pnpm add @fukict/flux
```

## 基础用法

```tsx
import { defineStore } from '@fukict/flux';

const counterStore = defineStore<{ count: number }>({
  state: { count: 0 },
  actions: {
    increment: state => ({ count: state.count + 1 }),
    add: (state, amount: number) => ({ count: state.count + amount }),
  },
});

counterStore.actions.increment();
console.log(counterStore.state.count);
```

## 组件订阅

```tsx
class Counter extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = counterStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div>
        <p>{counterStore.state.count}</p>
        <button on:click={() => counterStore.actions.increment()}>+1</button>
      </div>
    );
  }
}
```

## 精确订阅

只订阅特定字段：

```tsx
class UserAvatar extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    // 只在 user 变化时更新
    this.unsubscribe = userStore.subscribe(
      state => state.user,
      () => this.update(),
    );
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    return <img src={userStore.state.user?.avatar} />;
  }
}
```

## 异步 Actions

```tsx
const userStore = defineStore<{
  user: null | { name: string };
  loading: boolean;
  error: null | Error;
}>({
  state: { user: null, loading: false, error: null },
  asyncActions: {
    async fetchUser(ctx, id: string) {
      ctx.setState({ loading: true, error: null });
      try {
        const user = await fetch(`/api/users/${id}`).then(r => r.json());
        ctx.setState({ user, loading: false });
      } catch (error) {
        ctx.setState({ error: error as Error, loading: false });
      }
    },
  },
});

// 使用
class UserProfile extends Fukict {
  mounted() {
    userStore.asyncActions.fetchUser(this.props.userId);
  }

  render() {
    const { loading, user, error } = userStore.state;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error</div>;
    return <div>{user?.name}</div>;
  }
}
```

## 脱围 + Flux（核心模式）

**Fukict 的核心优势**：脱围组件 + Flux 精确订阅 = 最少运行时更新

```tsx
// Store（全局状态）
const todoStore = defineStore<{ todos: Todo[] }>({
  state: { todos: [] },
  actions: {
    addTodo: (state, text: string) => ({
      todos: [...state.todos, { id: Date.now(), text }],
    }),
    removeTodo: (state, id: number) => ({
      todos: state.todos.filter(t => t.id !== id),
    }),
  },
});

// 列表项（脱围 + 精确订阅）
class TodoItem extends Fukict<{ todoId: number }> {
  private unsubscribe?: () => void;

  mounted() {
    // 只订阅自己相关的数据
    this.unsubscribe = todoStore.subscribe(
      state => state.todos.find(t => t.id === this.props.todoId),
      () => this.update(),
    );
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const todo = todoStore.state.todos.find(t => t.id === this.props.todoId);
    if (!todo) return null;

    return (
      <div fukict:detach={true}>
        <span>{todo.text}</span>
        <button on:click={() => todoStore.actions.removeTodo(todo.id)}>
          删除
        </button>
      </div>
    );
  }
}

// 列表容器
class TodoList extends Fukict {
  render() {
    return (
      <div>
        {todoStore.state.todos.map(todo => (
          <TodoItem key={todo.id} todoId={todo.id} fukict:detach={true} />
        ))}
      </div>
    );
  }
}
```

**性能对比**：

| 场景                  | React 全量更新   | Fukict 脱围 + Flux |
| --------------------- | ---------------- | ------------------ |
| 1000 项列表，1 项变化 | 1000 个组件 diff | 只有 1 个组件更新  |
| 父组件状态变化        | 所有子组件重渲染 | 脱围子组件不受影响 |

## API 参考

### `defineStore(config)`

```ts
defineStore<T, A, AA>({
  state: initialState,
  actions: { ... },
  asyncActions: { ... },
})
```

### Store 实例

| 属性/方法                 | 说明             |
| ------------------------- | ---------------- |
| `state`                   | 当前状态（只读） |
| `actions`                 | 同步 actions     |
| `asyncActions`            | 异步 actions     |
| `subscribe(fn)`           | 订阅全部变化     |
| `subscribe(selector, fn)` | 精确订阅         |
| `getState()`              | 获取状态快照     |
| `setState(partial)`       | 直接设置状态     |
