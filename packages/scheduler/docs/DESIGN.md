# @fukict/scheduler 设计文档

## 包职责

scheduler 是 Fukict 的渲染调度器，职责：

1. **任务调度**：控制渲染任务的执行时机
2. **优先级管理**：高优先级任务优先执行
3. **浏览器空闲利用**：利用 requestIdleCallback
4. **帧对齐**：利用 requestAnimationFrame
5. **任务取消**：支持取消待执行任务

## 不包含的功能

- ❌ 渲染逻辑（由 widget 提供）
- ❌ DOM 操作（由 runtime 提供）
- ❌ 组件管理（由 widget 提供）

## 核心设计理念

### "独立调度器，可选使用"

scheduler 是完全独立的包：

```
@fukict/scheduler (独立包，无依赖)
    ↑ 可选使用
@fukict/widget
```

**为什么独立？**
- 不是所有场景都需要调度
- 某些场景需要同步渲染（如测试）
- 用户可以自定义调度策略

## 调度策略设计

### 优先级级别

```typescript
enum Priority {
  Immediate = 1,    // 立即执行（同步）
  High = 2,         // 高优先级（尽快）
  Normal = 3,       // 正常优先级（默认）
  Low = 4,          // 低优先级（空闲时）
  Idle = 5          // 空闲优先级（完全空闲时）
}
```

### 调度策略

**Immediate**：
- 同步执行，不调度
- 用于紧急更新（如用户输入）

**High**：
- 使用 `requestAnimationFrame`
- 在下一帧执行
- 用于动画、交互反馈

**Normal**：
- 使用 `setTimeout(0)` 或 `Promise.resolve()`
- 在当前任务后执行
- 用于常规更新

**Low**：
- 使用 `requestIdleCallback`
- 在浏览器空闲时执行
- 用于非紧急更新

**Idle**：
- 使用 `requestIdleCallback` + 长超时
- 完全空闲时执行
- 用于后台任务、预加载

## 任务队列设计

### 优先级队列

```
任务队列（按优先级排序）:

[Immediate] → 立即执行
    ↓
[High] → RAF 队列
    ↓
[Normal] → 微任务队列
    ↓
[Low] → Idle 队列
    ↓
[Idle] → 后台队列
```

### 队列数据结构

```typescript
interface Task {
  id: number               // 任务 ID
  callback: () => void     // 任务函数
  priority: Priority       // 优先级
  expiration?: number      // 过期时间（超时强制执行）
  cancelled: boolean       // 是否已取消
}

// 每个优先级一个队列
const queues: Map<Priority, Task[]> = new Map()
```

### 任务调度器

```typescript
class Scheduler {
  private taskId = 0
  private queues = new Map<Priority, Task[]>()
  private rafScheduled = false
  private idleScheduled = false

  // 调度任务
  schedule(callback: () => void, priority: Priority): TaskId {
    const task = {
      id: ++this.taskId,
      callback,
      priority,
      cancelled: false
    }

    // 加入对应优先级队列
    this.enqueue(task)

    // 触发调度
    this.flush(priority)

    return task.id
  }

  // 取消任务
  cancel(taskId: TaskId): void {
    // 标记为已取消
    for (const queue of this.queues.values()) {
      const task = queue.find(t => t.id === taskId)
      if (task) {
        task.cancelled = true
      }
    }
  }
}
```

## 调度执行设计

### Immediate（同步执行）

```typescript
if (priority === Priority.Immediate) {
  callback()  // 立即执行
  return
}
```

### High（requestAnimationFrame）

```typescript
if (priority === Priority.High) {
  if (!this.rafScheduled) {
    this.rafScheduled = true
    requestAnimationFrame(() => {
      this.rafScheduled = false
      this.flushQueue(Priority.High)
    })
  }
}
```

### Normal（微任务）

```typescript
if (priority === Priority.Normal) {
  queueMicrotask(() => {
    this.flushQueue(Priority.Normal)
  })
}
```

### Low/Idle（requestIdleCallback）

```typescript
if (priority === Priority.Low || priority === Priority.Idle) {
  if (!this.idleScheduled) {
    this.idleScheduled = true
    requestIdleCallback((deadline) => {
      this.idleScheduled = false
      this.flushIdleQueue(deadline)
    }, {
      timeout: priority === Priority.Idle ? 5000 : 1000
    })
  }
}
```

## 任务过期处理

### 为什么需要过期？

**问题**：低优先级任务可能一直得不到执行

**解决**：设置过期时间，超时后提升优先级

```typescript
interface Task {
  expiration?: number  // 过期时间戳
}

// 创建任务时设置过期
const task = {
  ...
  expiration: Date.now() + getTimeoutForPriority(priority)
}

// 执行前检查过期
function flushQueue(priority: Priority) {
  const queue = this.queues.get(priority)
  const now = Date.now()

  for (const task of queue) {
    if (task.cancelled) continue

    // 检查是否过期
    if (task.expiration && now > task.expiration) {
      // 过期，立即执行
      task.callback()
    }
  }
}
```

### 过期时间设置

```typescript
function getTimeoutForPriority(priority: Priority): number {
  switch (priority) {
    case Priority.Immediate: return 0
    case Priority.High: return 250        // 250ms
    case Priority.Normal: return 5000     // 5s
    case Priority.Low: return 10000       // 10s
    case Priority.Idle: return Infinity   // 永不过期
  }
}
```

## 与 widget 集成

### 可选集成

widget 检测 scheduler 是否可用：

```typescript
// widget 内部
import * as scheduler from '@fukict/scheduler'

function scheduleUpdate(callback: () => void, priority: Priority) {
  if (scheduler && typeof scheduler.schedule === 'function') {
    // 使用 scheduler
    return scheduler.schedule(callback, priority)
  } else {
    // 同步执行
    callback()
  }
}
```

### Widget.forceUpdate 集成

```typescript
class Widget {
  forceUpdate(priority: Priority = Priority.Normal) {
    const updateTask = () => {
      // 执行 diff/patch
      const newVNode = this.render()
      patchDOM(this.vnode, newVNode, this.root)
      this.vnode = newVNode
    }

    // 使用 scheduler（如果可用）
    scheduleUpdate(updateTask, priority)
  }
}
```

### 用户控制优先级

```typescript
class Counter extends Widget {
  handleClick = () => {
    this.count++
    // 高优先级更新（交互反馈）
    this.forceUpdate(Priority.High)
  }

  loadData = async () => {
    const data = await fetch('/api/data')
    this.data = data
    // 低优先级更新（非紧急）
    this.forceUpdate(Priority.Low)
  }
}
```

## API 设计

### 核心 API

```typescript
// 调度任务
function schedule(
  callback: () => void,
  priority?: Priority
): TaskId

// 取消任务
function cancel(taskId: TaskId): void

// 批量调度（同优先级）
function batchSchedule(
  callbacks: Array<() => void>,
  priority?: Priority
): TaskId[]

// 刷新所有任务（用于测试）
function flushAll(): void

// 清空所有任务
function clearAll(): void
```

### 配置 API

```typescript
interface SchedulerConfig {
  // 是否启用调度（false 则同步执行）
  enabled?: boolean

  // 自定义优先级超时时间
  timeouts?: {
    [Priority.High]?: number
    [Priority.Normal]?: number
    [Priority.Low]?: number
  }

  // 是否启用过期检查
  expiration?: boolean
}

function configure(config: SchedulerConfig): void
```

### 工具 API

```typescript
// 获取当前配置
function getConfig(): SchedulerConfig

// 获取待执行任务数量
function getPendingCount(priority?: Priority): number

// 是否有待执行任务
function hasPending(priority?: Priority): boolean
```

## 浏览器兼容性

### requestIdleCallback Polyfill

```typescript
const requestIdleCallback =
  window.requestIdleCallback ||
  function(callback: IdleRequestCallback, options?: { timeout?: number }) {
    const start = Date.now()
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      })
    }, 1) as any
  }

const cancelIdleCallback =
  window.cancelIdleCallback ||
  function(id: number) {
    clearTimeout(id)
  }
```

### requestAnimationFrame

现代浏览器都支持，无需 polyfill。

## 性能优化

### 批量执行

同优先级的任务批量执行，减少调度次数：

```typescript
function flushQueue(priority: Priority) {
  const queue = this.queues.get(priority)

  // 批量执行（避免多次 RAF/Idle）
  while (queue.length > 0) {
    const task = queue.shift()
    if (!task.cancelled) {
      task.callback()
    }
  }
}
```

### 时间切片（未来）

```typescript
function flushIdleQueue(deadline: IdleDeadline) {
  const queue = this.queues.get(Priority.Low)

  // 在空闲时间内执行尽可能多的任务
  while (queue.length > 0 && deadline.timeRemaining() > 0) {
    const task = queue.shift()
    if (!task.cancelled) {
      task.callback()
    }
  }

  // 如果还有任务，继续调度
  if (queue.length > 0) {
    this.flush(Priority.Low)
  }
}
```

## 测试支持

### 同步模式

```typescript
// 测试时禁用调度
configure({ enabled: false })

// 所有任务同步执行
schedule(() => console.log('task'), Priority.Low)
// 立即输出 'task'
```

### 手动刷新

```typescript
// 调度任务（不执行）
schedule(() => console.log('task 1'), Priority.Normal)
schedule(() => console.log('task 2'), Priority.Normal)

// 手动刷新所有任务
flushAll()
// 输出 'task 1', 'task 2'
```

## 调试支持

### 调试模式

```typescript
// 启用调试日志
schedule.debug = true

// 输出示例：
// [Scheduler] Schedule task #1 (priority: Normal)
// [Scheduler] Execute task #1
// [Scheduler] Task #1 completed in 5ms
```

### 性能监控

```typescript
// 任务执行时间统计
interface TaskStats {
  taskId: number
  priority: Priority
  startTime: number
  endTime: number
  duration: number
}

function getStats(): TaskStats[]
```

## 使用示例

### 基本使用

```typescript
import { schedule, Priority } from '@fukict/scheduler'

// 调度渲染任务
const taskId = schedule(() => {
  console.log('Render!')
}, Priority.Normal)

// 取消任务
cancel(taskId)
```

### 与 widget 集成

```typescript
class MyWidget extends Widget {
  handleClick = () => {
    // 高优先级更新
    this.forceUpdate(Priority.High)
  }

  loadData = () => {
    // 低优先级更新
    this.forceUpdate(Priority.Low)
  }
}
```

### 批量调度

```typescript
import { batchSchedule, Priority } from '@fukict/scheduler'

const tasks = [
  () => updateComponent1(),
  () => updateComponent2(),
  () => updateComponent3()
]

batchSchedule(tasks, Priority.Normal)
```

## 体积目标

- **核心功能**: < 1.5KB gzipped
- **包含 polyfill**: < 2KB gzipped

## 设计权衡记录

### 1. 为什么是独立包？

**决策**：scheduler 独立于 widget

**理由**：
- 不是所有场景都需要
- SSR/测试需要同步执行
- 用户可以自定义调度策略

**权衡**：
- 需要额外安装
- 但提供了选择权

### 2. 为什么有 5 个优先级？

**决策**：Immediate、High、Normal、Low、Idle

**理由**：
- 覆盖常见场景
- 区分度合适
- 不过于复杂

**权衡**：
- 比 React 的 5 个级别简单
- 但够用

### 3. 为什么不实现时间切片？

**决策**：初版不实现时间切片

**理由**：
- 增加复杂度
- 大部分场景不需要
- 可以后续版本添加

**权衡**：
- 长任务可能阻塞
- 但降低了初版复杂度

### 4. 为什么提供同步模式？

**决策**：可以配置禁用调度

**理由**：
- 测试需要同步执行
- 调试更方便
- 某些特殊场景需要确定性执行顺序

**权衡**：
- 增加了配置项
- 但提供了必要的灵活性

## 对比 React Scheduler

### React Scheduler
- 复杂的时间切片
- 5 个优先级
- 紧密集成 Fiber
- 体积较大

### Fukict Scheduler
- 简单的优先级队列
- 5 个优先级
- 独立包，可选使用
- 体积小（< 2KB）

**Fukict 特色**：
- 更简单
- 更轻量
- 更灵活（可选）

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
