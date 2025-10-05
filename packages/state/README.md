# @fukict/state

轻量级观察者状态管理，专为 fukict 设计。

## 核心特点

- **纯粹的观察者模式** - 不做任何魔法，显式优于隐式
- **极致轻量** - 核心包 < 2KB (gzip)
- **手动控制** - 用户决定何时重渲染，不自动触发
- **TypeScript 优先** - 完整的类型支持
- **可选功能** - 持久化、中间件、派生选择器

## 安装

```bash
pnpm add @fukict/state
```

## 基础用法

### 创建状态容器

```typescript
import { createState } from '@fukict/state';

const appState = createState({
  count: 0,
  user: { name: 'Alice', age: 25 },
  todos: [] as string[],
});
```

### 读取状态

```typescript
// 读取单个字段
const count = appState.get('count'); // 0

// 读取完整状态（只读）
const state = appState.getState(); // { count: 0, user: {...}, todos: [] }
```

### 更新状态

```typescript
// 更新单个字段
appState.set('count', 1);

// 批量更新
appState.setState({
  count: 2,
  user: { name: 'Bob', age: 30 },
});
```

### 订阅变更

```typescript
const unsubscribe = appState.subscribe((state, prevState, changedKeys) => {
  console.log('Changed keys:', changedKeys);
  console.log('New state:', state);
  console.log('Previous state:', prevState);
});

// 取消订阅
unsubscribe();
```

### 批量操作

```typescript
// 批量更新，只触发一次订阅通知
appState.batch(() => {
  appState.set('count', 1);
  appState.set('user', { name: 'Bob', age: 30 });
}); // 只触发一次订阅回调
```

## 与 Widget 集成

### 类组件集成

```typescript
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

class Counter extends Widget {
  // 组件内部状态
  private state = createState({ count: 0 });

  onMounted() {
    // 手动订阅，手动触发重渲染
    this.state.subscribe(() => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div onClick={() => this.increment()}>
        Count: {this.state.get('count')}
      </div>
    );
  }

  private increment() {
    this.state.set('count', this.state.get('count') + 1);
  }

  // 手动重渲染方法
  private forceUpdate() {
    if (!this.vnode || !this.root) return;

    const newVNode = this.render();
    updateDOM(this.vnode, newVNode, this.root);
    this.vnode = newVNode;
  }
}
```

### 全局状态共享

```typescript
// global-state.ts
import { createState } from '@fukict/state';

export const globalState = createState({
  user: null as User | null,
  theme: 'light' as 'light' | 'dark',
  isLoading: false,
});

export function login(user: User) {
  globalState.set('user', user);
}

export function toggleTheme() {
  const current = globalState.get('theme');
  globalState.set('theme', current === 'light' ? 'dark' : 'light');
}
```

```typescript
// components/header.ts
import { globalState } from './global-state';
import { Widget } from '@fukict/widget';

class Header extends Widget {
  onMounted() {
    globalState.subscribe((state, prev, keys) => {
      // 只在关心的字段变化时重渲染
      if (keys.includes('user') || keys.includes('theme')) {
        this.forceUpdate();
      }
    });
  }

  render() {
    const user = globalState.get('user');
    const theme = globalState.get('theme');

    return <header class={theme}>{user?.name}</header>;
  }
}
```

## 高级功能

### 派生选择器

```typescript
const state = createState({
  todos: [
    { id: 1, text: 'Learn fukict', done: false },
    { id: 2, text: 'Build app', done: true },
  ],
});

// 创建派生选择器
const activeTodos = state.select(s => s.todos.filter(t => !t.done));

// 读取派生值
console.log(activeTodos.value); // [{ id: 1, ... }]

// 订阅派生值变更
activeTodos.subscribe(todos => {
  console.log('Active todos:', todos);
});
```

### 持久化

```typescript
const state = createState(
  { count: 0, theme: 'light' },
  {
    persist: {
      key: 'my-app-state',
      storage: localStorage, // 或 sessionStorage
      include: ['theme'], // 只持久化 theme 字段
    },
  }
);

// 状态会自动保存到 localStorage
// 页面刷新后自动恢复
```

#### 持久化选项

```typescript
interface PersistOptions {
  key: string;           // 存储键名
  storage: Storage;      // localStorage 或 sessionStorage
  include?: string[];    // 白名单：仅持久化这些字段
  exclude?: string[];    // 黑名单：排除这些字段
}
```

### 中间件

```typescript
import { createState, createLoggerMiddleware } from '@fukict/state';

const state = createState(
  { count: 0 },
  {
    middleware: [
      // 内置日志中间件
      createLoggerMiddleware({ collapsed: true }),

      // 自定义中间件
      (context) => {
        console.log('State changed:', context.key, context.value);
      },
    ],
  }
);
```

#### 内置中间件

```typescript
import {
  createLoggerMiddleware,
  createFreezeMiddleware,
} from '@fukict/state';

// 日志中间件
createLoggerMiddleware({
  collapsed: true,   // 是否折叠日志
  timestamp: true,   // 是否显示时间戳
});

// 冻结中间件（防止外部修改状态对象）
createFreezeMiddleware();
```

#### 自定义中间件

```typescript
import type { Middleware } from '@fukict/state';

const myMiddleware: Middleware = (context) => {
  const { key, value, prevValue, state, prevState } = context;

  // 自定义逻辑
  console.log(`${String(key)} changed from`, prevValue, 'to', value);
};
```

## API 参考

### `createState<T>(initialState: T, options?: StateOptions): State<T>`

创建状态容器。

**参数：**
- `initialState` - 初始状态对象
- `options` - 可选配置
  - `persist` - 持久化配置
  - `middleware` - 中间件数组

**返回：** State 实例

### State 方法

#### `get<K>(key: K): T[K]`

获取单个字段的值。

#### `set<K>(key: K, value: T[K]): void`

设置单个字段的值。

#### `getState(): Readonly<T>`

获取完整状态对象（只读）。

#### `setState(partial: Partial<T>): void`

批量更新状态（部分更新）。

#### `subscribe(listener: Listener<T>): () => void`

订阅状态变更，返回取消订阅函数。

**Listener 签名：**
```typescript
type Listener<T> = (
  state: Readonly<T>,
  prevState: Readonly<T>,
  changedKeys: (keyof T)[]
) => void;
```

#### `batch(fn: () => void): void`

批量操作，减少订阅通知次数。

#### `select<R>(selector: (state: T) => R): Selector<R>`

创建派生选择器。

#### `reset(): void`

重置到初始状态。

#### `destroy(): void`

销毁状态容器，清理资源。

## 使用场景

### 数据可视化

```typescript
const chartState = createState({
  dataPoints: [] as number[],
  range: { min: 0, max: 100 },
});

class Chart extends Widget {
  onMounted() {
    chartState.subscribe(() => {
      if (this.shouldUpdate()) {
        this.forceUpdate();
      }
    });
  }

  shouldUpdate() {
    // 自定义更新逻辑，例如节流
    return true;
  }
}

// 批量更新，避免多次渲染
chartState.batch(() => {
  chartState.set('dataPoints', newData);
  chartState.set('range', { min: 10, max: 90 });
});
```

### 游戏 UI

```typescript
const gameState = createState({
  player: { hp: 100, mp: 50, x: 0, y: 0 },
  enemies: [] as Enemy[],
});

class HealthBar extends Widget {
  onMounted() {
    gameState.subscribe((state, prev, keys) => {
      // 只在 HP 变化时重渲染
      if (keys.includes('player')) {
        const hpChanged = state.player.hp !== prev.player.hp;
        if (hpChanged) {
          this.forceUpdate();
        }
      }
    });
  }
}
```

## 性能

- **核心包大小**：< 2KB (gzip)
- **订阅通知**：O(n)，n 为监听器数量
- **状态读取**：O(1)
- **批量更新**：多次 set 合并为单次通知

## 设计理念

### 显式优于隐式

用户明确知道何时读取状态（`get`）、何时更新状态（`set`）、何时重渲染（手动调用）。

### 简单优于复杂

没有 Proxy 魔法、没有依赖收集、没有编译时优化，只有纯粹的观察者模式。

### 手动控制优于自动

用户决定何时重渲染、是否节流、是否批量更新，框架不做假设。

### 轻量优于重量

核心功能 < 2KB，可选功能按需引入。

## 与其他方案对比

| 特性 | @fukict/state | Zustand | Jotai | MobX |
|------|--------------|---------|-------|------|
| 体积 | < 2KB | ~1KB | ~3KB | ~16KB |
| 自动渲染 | ❌ 手动 | ✅ 自动 | ✅ 自动 | ✅ 自动 |
| 响应式 | 订阅/发布 | 订阅 | Atom | Proxy |
| 学习成本 | 极低 | 低 | 中 | 高 |
| 框架绑定 | Fukict | React | React | 无 |
| 显式 API | ✅ | ✅ | ⚠️ | ❌ |

## License

MIT
