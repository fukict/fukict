# 状态管理

## 组件内状态

```tsx
class Counter extends Fukict {
  count = 0;

  render() {
    return (
      <div>
        <p>{this.count}</p>
        <button on:click={() => this.increment()}>+1</button>
      </div>
    );
  }

  increment() {
    this.count++;
    this.update();
  }
}
```

## Store 模式

```tsx
class Store<T> {
  private state: T;
  private listeners = new Set<() => void>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  get(): T {
    return this.state;
  }

  setState(partial: Partial<T>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }
}

// 使用
interface AppState {
  user: { name: string } | null;
  theme: 'light' | 'dark';
}

export const appStore = new Store<AppState>({
  user: null,
  theme: 'light',
});
```

## 组件订阅 Store

```tsx
class Header extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = appStore.subscribe(() => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { user } = appStore.get();
    return <header>{user?.name || 'Guest'}</header>;
  }
}
```

## 精确订阅

```tsx
class AdvancedStore<T> {
  subscribeKey<K extends keyof T>(key: K, listener: () => void): () => void {
    let currentValue = this.state[key];

    const wrappedListener = () => {
      if (this.state[key] !== currentValue) {
        currentValue = this.state[key];
        listener();
      }
    };

    this.listeners.add(wrappedListener);
    return () => this.listeners.delete(wrappedListener);
  }
}

// 使用：只在 user 变化时更新
class Avatar extends Fukict {
  private unsubscribe?: () => void;

  mounted() {
    this.unsubscribe = appStore.subscribeKey('user', () => {
      this.update();
    });
  }

  beforeUnmount() {
    this.unsubscribe?.();
  }

  render() {
    const { user } = appStore.get();
    if (!user) return null;
    return <img src={`/avatar/${user.name}`} />;
  }
}
```
