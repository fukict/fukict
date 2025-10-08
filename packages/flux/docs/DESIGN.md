# @fukict/flux 设计文档

## 包职责

flux 是 Fukict 的状态管理库，职责：

1. **状态管理**：集中式应用状态存储
2. **可预测更新**：显式的状态变更机制
3. **订阅通知**：状态变化自动通知订阅者
4. **模块化**：支持状态模块拆分
5. **开发工具**：时间旅行、状态快照

## 依赖关系

```
@fukict/flux (独立包，无强制依赖)
    ↑ 可选集成
@fukict/widget
```

**依赖说明**：
- flux 核心不依赖任何包，可以独立使用
- 与 widget 集成时，通过手动订阅机制连接
- 用户可以在非 widget 环境中使用 flux

## 不包含的功能

- ❌ 异步处理（用户自行处理，flux 只管状态）
- ❌ 中间件系统（保持简单）
- ❌ 组件渲染（由 widget 提供）
- ❌ 自动响应式（必须手动订阅）

## 核心设计理念

### "单向数据流，显式变更"

flux 遵循单向数据流，所有状态变更都是显式的：

```
State（状态）
  ↓
View（视图）
  ↓
Action（动作）
  ↓
Mutation（变更）
  ↓
State（新状态）
```

**为什么？**
- 可预测：状态变更路径清晰
- 可追踪：所有变更都有记录
- 可调试：时间旅行、状态回滚

## 核心概念

### State（状态）

应用的单一数据源：

```typescript
interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
}
```

**特点**：
- 只读（不可直接修改）
- 通过 mutation 变更
- 集中式存储

### Mutation（变更）

同步修改状态的函数：

```typescript
const mutations = {
  addTodo(state, todo: Todo) {
    state.todos.push(todo)
  },

  removeTodo(state, id: string) {
    state.todos = state.todos.filter(t => t.id !== id)
  }
}
```

**特点**：
- 必须是同步函数
- 接收 state 和 payload
- 直接修改 state（内部使用 Proxy）

### Action（动作）

触发状态变更的接口：

```typescript
const actions = {
  async fetchTodos(context) {
    const todos = await api.getTodos()
    context.commit('setTodos', todos)
  },

  addTodo(context, text: string) {
    const todo = { id: generateId(), text, done: false }
    context.commit('addTodo', todo)
  }
}
```

**特点**：
- 可以是异步
- 通过 `commit` 调用 mutation
- 可以包含业务逻辑

### Getter（计算属性）

从 state 派生的计算值：

```typescript
const getters = {
  completedTodos(state): Todo[] {
    return state.todos.filter(t => t.done)
  },

  activeTodos(state): Todo[] {
    return state.todos.filter(t => !t.done)
  },

  filteredTodos(state, getters): Todo[] {
    switch (state.filter) {
      case 'active': return getters.activeTodos
      case 'completed': return getters.completedTodos
      default: return state.todos
    }
  }
}
```

**特点**：
- 基于 state 计算
- 可以依赖其他 getter
- 自动缓存（state 不变则不重新计算）

## Store 设计

### 创建 Store

```typescript
const store = createStore({
  state: {
    count: 0,
    todos: []
  },

  mutations: {
    increment(state) {
      state.count++
    },

    addTodo(state, todo) {
      state.todos.push(todo)
    }
  },

  actions: {
    async incrementAsync(context) {
      await delay(1000)
      context.commit('increment')
    }
  },

  getters: {
    completedTodos(state) {
      return state.todos.filter(t => t.done)
    }
  }
})
```

### Store API

```typescript
interface Store<S = any> {
  // 状态
  state: S

  // 变更
  commit(type: string, payload?: any): void

  // 动作
  dispatch(type: string, payload?: any): Promise<any>

  // 计算属性
  getters: Record<string, any>

  // 订阅
  subscribe(listener: SubscribeListener): UnsubscribeFn

  // 模块
  registerModule(path: string | string[], module: Module): void
  unregisterModule(path: string | string[]): void

  // 替换（热更新、时间旅行）
  replaceState(state: S): void
}
```

## 响应式设计

### Proxy 拦截用于变更追踪

**重要说明**：Proxy 不是用于自动响应式，而是用于追踪变更历史、实现 devtools 和时间旅行。

**state 是 Proxy 对象**：

```typescript
const state = new Proxy(rawState, {
  get(target, key) {
    // 仅用于追踪访问（非依赖收集）
    if (__DEV__) {
      trackAccess(target, key)
    }
    return Reflect.get(target, key)
  },

  set(target, key, value) {
    // 记录变更历史（用于 devtools、时间旅行）
    if (__DEV__) {
      recordMutation(key, value)
    }

    const result = Reflect.set(target, key, value)

    // 触发订阅（手动订阅的监听器）
    trigger()

    return result
  }
})
```

**Proxy 的用途**：
1. **变更追踪**：记录所有 state 变更历史（devtools）
2. **时间旅行**：支持状态回滚和重放
3. **开发警告**：检测直接修改 state（应该通过 mutation）

**不是自动响应式**：
- 组件不会自动更新
- 必须手动订阅 `store.subscribe()`
- 必须手动调用 `forceUpdate()`

### 订阅通知

**mutation 执行后通知订阅者**：

```typescript
class Store {
  private listeners = new Set<SubscribeListener>()

  commit(type: string, payload?: any) {
    // 执行 mutation
    this.mutations[type](this.state, payload)

    // 通知订阅者
    this.notify(type, payload)
  }

  private notify(type: string, payload: any) {
    this.listeners.forEach(listener => {
      listener({ type, payload, state: this.state })
    })
  }

  subscribe(listener: SubscribeListener): UnsubscribeFn {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
```

## Getter 缓存设计

### 计算缓存

**只在依赖变化时重新计算**：

```typescript
class ComputedGetter {
  private value: any
  private dirty = true
  private deps = new Set<string>()

  constructor(private getter: Function) {}

  get(state: any, getters: any) {
    if (this.dirty) {
      // 追踪依赖
      this.deps.clear()
      trackDeps(this.deps)

      // 重新计算
      this.value = this.getter(state, getters)
      this.dirty = false
    }

    return this.value
  }

  invalidate(changedKey: string) {
    if (this.deps.has(changedKey)) {
      this.dirty = true
    }
  }
}
```

### Getter 依赖追踪

```typescript
const getters = {
  // 依赖 state.todos
  completedTodos(state) {
    return state.todos.filter(t => t.done)
  },

  // 依赖 getters.completedTodos
  completedCount(state, getters) {
    return getters.completedTodos.length
  }
}

// state.todos 变化 → completedTodos 失效 → completedCount 失效
```

## Module 设计

### 模块定义

```typescript
interface Module<S = any, R = any> {
  state?: S | (() => S)
  mutations?: MutationTree<S>
  actions?: ActionTree<S, R>
  getters?: GetterTree<S, R>
  modules?: ModuleTree<R>
  namespaced?: boolean
}
```

### 命名空间

**模块注册**：

```typescript
const store = createStore({
  modules: {
    user: {
      namespaced: true,
      state: { name: '', id: '' },
      mutations: {
        setName(state, name) {
          state.name = name
        }
      },
      actions: {
        async fetchUser(context, id) {
          const user = await api.getUser(id)
          context.commit('setName', user.name)
        }
      }
    },

    todos: {
      namespaced: true,
      state: { items: [] },
      // ...
    }
  }
})
```

**访问方式**：

```typescript
// Mutation
store.commit('user/setName', 'Alice')

// Action
store.dispatch('user/fetchUser', '123')

// State
store.state.user.name

// Getter
store.getters['user/fullName']
```

### 动态注册模块

```typescript
// 运行时注册模块
store.registerModule('cart', {
  namespaced: true,
  state: { items: [] },
  mutations: { ... },
  actions: { ... }
})

// 卸载模块
store.unregisterModule('cart')
```

**用途**：
- 懒加载模块（按需加载）
- 动态功能（插件系统）

## 与 Widget 集成

### 手动订阅（唯一方式）

**重要**：flux 不提供自动响应式，组件必须手动订阅并调用 forceUpdate()

```typescript
class TodoList extends Widget {
  private unsubscribe?: UnsubscribeFn

  onMounted() {
    // 订阅 store
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()  // 状态变化，手动触发更新
    })
  }

  onBeforeUnmount() {
    // 取消订阅
    this.unsubscribe?.()
  }

  render() {
    const todos = store.state.todos
    return <ul>{todos.map(todo => <li>{todo.text}</li>)}</ul>
  }
}
```

**为什么必须手动订阅？**
- flux 不是自动响应式的
- Proxy 仅用于变更追踪（devtools），不会触发组件更新
- 简单直接
- 完全控制
- 无额外抽象
- 易于理解和调试

### 选择性订阅

**只在特定 mutation 时更新**：

```typescript
class TodoList extends Widget {
  onMounted() {
    this.unsubscribe = store.subscribe((mutation) => {
      // 只在 todo 相关 mutation 时更新
      if (mutation.type.startsWith('todo/')) {
        this.forceUpdate()
      }
    })
  }
}
```

**优势**：避免不必要的更新，性能更好

## 时间旅行设计

### 历史记录

```typescript
class Store {
  private history: StateSnapshot[] = []
  private historyIndex = -1

  commit(type: string, payload?: any) {
    // 执行 mutation
    this.mutations[type](this.state, payload)

    // 记录快照
    this.recordSnapshot(type, payload)
  }

  private recordSnapshot(type: string, payload: any) {
    // 移除当前索引后的历史
    this.history = this.history.slice(0, this.historyIndex + 1)

    // 添加新快照
    this.history.push({
      state: cloneDeep(this.state),
      mutation: { type, payload },
      timestamp: Date.now()
    })

    this.historyIndex++
  }
}
```

### 撤销/重做

```typescript
interface Store {
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
}

class Store {
  undo() {
    if (!this.canUndo()) return

    this.historyIndex--
    const snapshot = this.history[this.historyIndex]
    this.replaceState(snapshot.state)
  }

  redo() {
    if (!this.canRedo()) return

    this.historyIndex++
    const snapshot = this.history[this.historyIndex]
    this.replaceState(snapshot.state)
  }

  canUndo(): boolean {
    return this.historyIndex > 0
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }
}
```

### 状态导出/导入

```typescript
interface Store {
  export(): StateSnapshot
  import(snapshot: StateSnapshot): void
}

// 导出当前状态
const snapshot = store.export()
localStorage.setItem('app-state', JSON.stringify(snapshot))

// 导入状态
const snapshot = JSON.parse(localStorage.getItem('app-state'))
store.import(snapshot)
```

**用途**：
- 状态持久化
- 状态分享
- 测试数据准备

## 开发工具支持

### 调试模式

```typescript
const store = createStore({
  state: { ... },
  mutations: { ... },
  debug: true  // 开发模式启用
})

// 输出示例：
// [Flux] Mutation: addTodo
// [Flux] Payload: { id: '1', text: 'Buy milk' }
// [Flux] State before: { todos: [] }
// [Flux] State after: { todos: [{ id: '1', text: 'Buy milk' }] }
```

### Mutation 追踪

```typescript
store.subscribe((mutation, state) => {
  console.log('Mutation:', mutation.type)
  console.log('Payload:', mutation.payload)
  console.log('State:', state)
})
```

### DevTools 集成（未来）

```typescript
// 暴露给 DevTools 的接口
if (window.__FUKICT_DEVTOOLS__) {
  window.__FUKICT_DEVTOOLS__.registerStore(store)
}
```

## 类型安全设计

### 强类型 Store

```typescript
interface RootState {
  count: number
  todos: Todo[]
}

interface RootMutations {
  increment(state: RootState): void
  addTodo(state: RootState, todo: Todo): void
}

interface RootActions {
  incrementAsync(context: ActionContext<RootState>): Promise<void>
}

const store = createStore<RootState, RootMutations, RootActions>({
  state: {
    count: 0,
    todos: []
  },

  mutations: {
    increment(state) {
      state.count++  // ✅ 类型安全
      state.foo++    // ❌ 类型错误
    }
  }
})

// 使用
store.commit('increment')       // ✅ 类型正确
store.commit('nonexistent')     // ❌ 类型错误
```

### Payload 类型推导

```typescript
const store = createStore({
  mutations: {
    addTodo(state: RootState, todo: Todo) {
      state.todos.push(todo)
    }
  }
})

// TypeScript 推导 payload 类型
store.commit('addTodo', { id: '1', text: 'foo', done: false })  // ✅
store.commit('addTodo', { id: 123 })  // ❌ 类型错误
```

## 性能优化

### 批量更新

**问题**：连续多次 commit 导致多次通知

**解决**：批量提交

```typescript
store.batch(() => {
  store.commit('increment')
  store.commit('addTodo', todo1)
  store.commit('addTodo', todo2)
})
// 仅触发一次订阅通知
```

### 选择性订阅

**问题**：订阅整个 store，任何变化都会通知

**解决**：订阅特定 mutation

```typescript
store.subscribe((mutation) => {
  if (mutation.type === 'addTodo') {
    // 只在 addTodo 时更新
    this.forceUpdate()
  }
})
```

### Getter 缓存

**自动缓存计算结果**，依赖未变化时直接返回缓存值。

## 插件系统

### Plugin 接口

```typescript
type Plugin = (store: Store) => void

const logger: Plugin = (store) => {
  store.subscribe((mutation, state) => {
    console.log('Mutation:', mutation)
    console.log('State:', state)
  })
}

const store = createStore({
  state: { ... },
  plugins: [logger]
})
```

### 常用插件

**持久化插件**：

```typescript
const persist: Plugin = (store) => {
  // 从 localStorage 恢复
  const saved = localStorage.getItem('app-state')
  if (saved) {
    store.replaceState(JSON.parse(saved))
  }

  // 订阅变化，保存到 localStorage
  store.subscribe((mutation, state) => {
    localStorage.setItem('app-state', JSON.stringify(state))
  })
}
```

**日志插件**：

```typescript
const logger: Plugin = (store) => {
  store.subscribe((mutation, state) => {
    console.group(mutation.type)
    console.log('Payload:', mutation.payload)
    console.log('State:', state)
    console.groupEnd()
  })
}
```

## API 设计总结

### createStore

```typescript
function createStore<S, M, A, G>(
  options: StoreOptions<S, M, A, G>
): Store<S>

interface StoreOptions<S, M, A, G> {
  state: S | (() => S)
  mutations?: MutationTree<S, M>
  actions?: ActionTree<S, A>
  getters?: GetterTree<S, G>
  modules?: ModuleTree
  plugins?: Plugin[]
  debug?: boolean
}
```

### Store 接口

```typescript
interface Store<S = any> {
  state: S
  getters: Record<string, any>

  commit(type: string, payload?: any): void
  dispatch(type: string, payload?: any): Promise<any>

  subscribe(listener: SubscribeListener): UnsubscribeFn

  registerModule(path: string | string[], module: Module): void
  unregisterModule(path: string | string[]): void

  replaceState(state: S): void

  // 时间旅行
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean

  // 导出/导入
  export(): StateSnapshot
  import(snapshot: StateSnapshot): void

  // 批量更新
  batch(fn: () => void): void
}
```

### 类型定义

```typescript
type MutationTree<S, M = any> = {
  [K in keyof M]: (state: S, payload?: any) => void
}

type ActionTree<S, A = any> = {
  [K in keyof A]: (context: ActionContext<S>, payload?: any) => any
}

type GetterTree<S, G = any> = {
  [K in keyof G]: (state: S, getters: any) => any
}

interface ActionContext<S> {
  state: S
  getters: Record<string, any>
  commit: Commit
  dispatch: Dispatch
}

type Commit = (type: string, payload?: any) => void
type Dispatch = (type: string, payload?: any) => Promise<any>

type SubscribeListener = (mutation: MutationPayload, state: any) => void
type UnsubscribeFn = () => void

interface MutationPayload {
  type: string
  payload: any
}

interface StateSnapshot {
  state: any
  mutation?: MutationPayload
  timestamp: number
}
```

## 设计权衡记录

### 1. 为什么不支持异步 Mutation？

**决策**：Mutation 必须是同步的

**理由**：
- 可预测性：同步变更更容易追踪
- 时间旅行：异步难以记录准确时间点
- 调试友好：堆栈清晰

**权衡**：
- 异步逻辑放在 Action 中
- 增加了一层抽象
- 但保证了可预测性

### 2. 为什么不内置中间件系统？

**决策**：初版不提供中间件

**理由**：
- 保持简单
- 插件系统已足够扩展
- 避免过度设计

**权衡**：
- 某些高级功能受限
- 但降低了学习成本

### 3. 为什么使用 Proxy 而非 Object.defineProperty？

**决策**：使用 Proxy 实现响应式

**理由**：
- 更强大（拦截所有操作）
- 更简洁（不需要递归劫持）
- 现代浏览器支持

**权衡**：
- 不兼容 IE11
- 但 Fukict 本就不考虑 IE

### 4. 为什么推荐手动订阅而非 HOC？

**决策**：初版推荐手动订阅，HOC 作为可选工具

**理由**：
- 手动订阅更直接
- 避免过早抽象
- 用户完全控制

**权衡**：
- 样板代码略多
- 但逻辑更清晰

### 5. 为什么支持时间旅行？

**决策**：内置时间旅行支持

**理由**：
- 调试利器
- 实现成本不高
- 开发体验提升

**权衡**：
- 增加内存占用（存储历史）
- 但可以通过配置禁用

## 对比其他状态管理库

### Vuex
- 完整的状态管理方案
- Mutation/Action 分离
- 模块化支持
- DevTools 集成
- 体积 ~10KB

### Redux
- 纯函数 reducer
- 中间件生态丰富
- 时间旅行调试
- 社区强大
- 体积 ~5KB（不含中间件）

### MobX
- 响应式状态
- 自动追踪依赖
- 简洁 API
- 体积 ~15KB

### Fukict Flux
- 轻量级（目标 < 3KB）
- 单向数据流
- Mutation/Action 分离（类似 Vuex）
- 时间旅行
- 模块化
- 专为 Widget 设计

**Fukict 特色**：
- 更轻量
- 更简洁
- 核心功能完整
- 与 widget 深度集成

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
