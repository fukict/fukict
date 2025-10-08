# Runtime 扩展机制

## 设计目标

提供集中化的组件处理器注册机制，让外部包（如 widget）能够注册完整的组件处理逻辑。

## 核心理念

**"注册组件处理器，而非分散的钩子"**

runtime 提供注册接口，外部包注册**完整的组件处理器**，包含从检测到卸载的全部逻辑：

```
Widget 包注册一个处理器
  ├─ 检测：如何识别 Widget 类组件
  ├─ 渲染：如何渲染 Widget 实例
  ├─ 挂载：如何触发 onMounted
  ├─ 卸载：如何清理和调用 onBeforeUnmount
  ├─ 属性：如何处理 fukict: 前缀
  └─ VNode：如何提取 fukict:ref
```

## 组件处理器设计

### ComponentHandler 接口

```typescript
interface ComponentHandler {
  // 处理器名称（用于调试）
  name: string

  // 优先级（数字越小越高，默认 100）
  priority?: number

  // 1. 检测：判断 Function 是否为该类型的组件
  detect(fn: Function): boolean

  // 2. 渲染：将组件渲染为 VNode（支持返回 null）
  render(
    component: Function,
    props: Record<string, any>,
    children: VNodeChild[]
  ): VNode | null

  // 3. VNode 后处理（可选）
  processVNode?(vnode: VNode): VNode

  // 4. DOM 挂载前（可选）
  onMount?(element: Element, vnode: VNode): void

  // 5. 属性设置（可选，返回 true 表示已处理）
  processAttribute?(element: Element, key: string, value: any): boolean

  // 6. DOM 卸载（可选）
  onUnmount?(element: Element, vnode: VNode): void
}
```

### 注册 API

```typescript
// 注册组件处理器
runtime.registerComponentHandler(handler: ComponentHandler): UnregisterFn

// 取消注册
const unregister = runtime.registerComponentHandler(handler)
unregister()
```

## Widget 注册示例

### Widget 类组件处理器

```typescript
import { registerComponentHandler } from '@fukict/runtime'
import { Widget } from './Widget'

registerComponentHandler({
  name: 'Widget',
  priority: 100,

  // 检测 Widget 类
  detect(fn) {
    return fn.prototype instanceof Widget ||
           fn.__COMPONENT_TYPE__ === 'WIDGET_CLASS'
  },

  // 渲染 Widget 实例
  render(Component, props, children) {
    // 创建实例
    const instance = new Component({ ...props, children })

    // 调用 render
    const vnode = instance.render()

    // 存储实例引用（供后续生命周期使用）
    vnode.__instance__ = instance

    return vnode
  },

  // 提取特殊属性
  processVNode(vnode) {
    const props = vnode.props
    if (!props) return vnode

    // 提取 fukict:ref
    if (props['fukict:ref']) {
      const refName = props['fukict:ref']
      const parent = getCurrentWidget()
      if (parent && vnode.__instance__) {
        parent.refs.set(refName, vnode.__instance__)
      }
    }

    // 提取 fukict:slot
    if (props['fukict:slot']) {
      // 标记 slot 信息
      vnode.__slot__ = props['fukict:slot']
    }

    return vnode
  },

  // 挂载时触发生命周期
  onMount(element, vnode) {
    const instance = vnode.__instance__
    if (instance) {
      instance.element = element
      instance.onMounted?.()
    }
  },

  // 跳过 fukict: 前缀属性
  processAttribute(element, key, value) {
    if (key.startsWith('fukict:')) {
      return true  // 已处理（不设置到 DOM）
    }
    return false  // 继续默认逻辑
  },

  // 卸载时清理
  onUnmount(element, vnode) {
    const instance = vnode.__instance__
    if (instance) {
      instance.onBeforeUnmount?.()

      // 清理 refs
      const parent = getParentWidget(instance)
      if (parent) {
        parent.refs.forEach((ref, name) => {
          if (ref === instance) {
            parent.refs.delete(name)
          }
        })
      }
    }
  }
})
```

### defineWidget 函数组件处理器

```typescript
registerComponentHandler({
  name: 'defineWidget',
  priority: 100,

  // 检测 defineWidget 函数
  detect(fn) {
    return fn.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION'
  },

  // 渲染函数组件
  render(component, props, children) {
    // 直接调用函数
    const vnode = component({ ...props, children })

    // 标记来源（用于调试）
    vnode.__component__ = component

    return vnode
  },

  // 函数组件不需要生命周期
  // 其他方法留空或不实现
})
```

## 处理器执行流程

### 渲染 `<MyWidget count={1}>child</MyWidget>`

```
1. hyperscript(MyWidget, { count: 1 }, null, 'child')
   创建 VNode: { type: MyWidget, props: { count: 1 }, children: ['child'] }
   ↓
2. render(vnode, container)
   检测 type 是 Function
   ↓
3. 遍历所有注册的处理器（按优先级）
   调用 handler.detect(MyWidget)
   → Widget 处理器返回 true（检测到是 Widget 类）
   ↓
4. 使用 Widget 处理器的 render 方法
   handler.render(MyWidget, props, children)
   → 创建实例 new MyWidget(props)
   → 调用 instance.render()
   → 返回 VNode: { type: 'div', ... }
   ↓
5. 调用 Widget 处理器的 processVNode（如果有）
   handler.processVNode(vnode)
   → 提取 fukict:ref
   ↓
6. type 是 'div'（string），创建 DOM
   createElement('div')
   ↓
7. 设置属性：class="widget"
   遍历处理器调用 processAttribute
   → Widget 处理器：检查不是 fukict: → 返回 false
   → runtime 默认逻辑：setAttribute('class', 'widget')
   ↓
8. 递归渲染子节点
   ↓
9. 调用 Widget 处理器的 onMount
   handler.onMount(element, vnode)
   → 调用 instance.onMounted()
   ↓
10. 插入 DOM 树
    appendChild(container, element)
```

## 处理器优先级

**执行规则**：

1. **detect** - 按优先级顺序，第一个返回 true 的处理器被选中
2. **render** - 使用被选中的处理器的 render 方法
3. **processVNode** - 按优先级顺序，所有处理器依次执行（链式）
4. **processAttribute** - 按优先级顺序，第一个返回 true 的终止
5. **onMount/onUnmount** - 按优先级顺序，所有处理器都执行

**优先级值**：
- 数字越小，优先级越高
- 默认：100
- 推荐范围：
  - widget: 100
  - devtools: 10（需要先于 widget 拦截）
  - 用户自定义: 50-200

## 多处理器共存

### 示例：Widget 类 + defineWidget 函数 + 第三方组件

```typescript
// Widget 类处理器（优先级 100）
registerComponentHandler({
  name: 'Widget',
  priority: 100,
  detect: (fn) => fn.prototype instanceof Widget,
  render: (C, props, children) => {
    const instance = new C(props)
    return instance.render()
  }
})

// defineWidget 函数处理器（优先级 100）
registerComponentHandler({
  name: 'defineWidget',
  priority: 100,
  detect: (fn) => fn.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION',
  render: (fn, props, children) => fn({ ...props, children })
})

// 第三方组件处理器（优先级 200）
registerComponentHandler({
  name: 'ThirdParty',
  priority: 200,
  detect: (fn) => fn.__IS_THIRD_PARTY__,
  render: (fn, props, children) => {
    // 第三方逻辑
  }
})
```

**检测顺序**：
```
1. Widget 处理器 detect → false
2. defineWidget 处理器 detect → false
3. ThirdParty 处理器 detect → true (选中)
```

## API 设计

### registerComponentHandler

```typescript
function registerComponentHandler(
  handler: ComponentHandler
): UnregisterFn

interface ComponentHandler {
  name: string
  priority?: number

  // 必需
  detect(fn: Function): boolean
  render(component: Function, props: any, children: VNodeChild[]): VNode | null

  // 可选
  processVNode?(vnode: VNode): VNode
  onMount?(element: Element, vnode: VNode): void
  processAttribute?(element: Element, key: string, value: any): boolean
  onUnmount?(element: Element, vnode: VNode): void
}

type UnregisterFn = () => void
```

### 便捷工具（可选）

```typescript
// 获取所有处理器
runtime.getHandlers(): ComponentHandler[]

// 根据名称获取处理器
runtime.getHandler(name: string): ComponentHandler | undefined
```

## 设计权衡记录

### 1. 为什么用集中注册而非分散注册？

**决策**：注册完整的 ComponentHandler，而非分别注册各个扩展点

**理由**：
- 概念清晰：注册的是"如何处理某种组件"
- 代码聚合：相关逻辑在一起，易于维护
- 类型安全：一个接口包含所有方法，TypeScript 类型推导更好

**对比**：
```typescript
// ❌ 分散注册（6 次调用）
runtime.registerComponentDetector(detector)
runtime.registerComponentRenderer(renderer)
runtime.registerVNodeProcessor(processor)
runtime.registerPreMountHandler(onMount)
runtime.registerAttributeHandler(attrHandler)
runtime.registerUnmountHandler(onUnmount)

// ✅ 集中注册（1 次调用）
runtime.registerComponentHandler({
  detect,
  render,
  processVNode,
  onMount,
  processAttribute,
  onUnmount
})
```

### 2. 为什么可选方法用 `?`？

**决策**：除了 `detect` 和 `render` 必需，其他都是可选

**理由**：
- 简单组件不需要所有功能
- defineWidget 函数组件不需要生命周期
- 灵活性更高

### 3. 为什么保留 priority？

**决策**：每个处理器有优先级

**理由**：
- 支持多种组件类型共存
- 可以控制检测顺序
- devtools 可以插入到 widget 之前

### 4. 为什么 processAttribute 返回 boolean？

**决策**：返回 true 表示已处理，终止后续

**理由**：
- 避免重复处理同一属性
- 性能优化（跳过不必要的遍历）
- 明确的控制流

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
