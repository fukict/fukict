# 与 Runtime 集成

## Runtime 挂载机制

### 核心原则

**分离创建和挂载**：
- `createNode()` - 只创建 DOM，不触发生命周期
- `mount()` - 插入 DOM 并触发 `onMount` 钩子

**onMount 调用时机**：
- 在 DOM **插入到文档**后调用
- 保证此时可以访问 DOM 属性（offsetWidth, getBoundingClientRect 等）

### Runtime 挂载流程

```typescript
// runtime/src/renderer/index.ts
export function render(vnode: VNodeChild, container: Element): void {
  container.innerHTML = '';

  // 1. 创建 DOM（不触发生命周期）
  const node = createNode(vnode);

  if (node) {
    // 2. 插入 DOM
    container.appendChild(node);

    // 3. 递归触发 onMount
    if (node instanceof Element && vnode && typeof vnode === 'object') {
      triggerOnMount(node, vnode);
    }
  }
}

// 递归触发所有元素的 onMount
function triggerOnMount(element: Element, vnode: VNode): void {
  // 调用所有 handler 的 onMount
  callOnMount(element, vnode);

  // 递归处理子元素
  if (vnode.children) {
    // ... 递归逻辑
  }
}
```

## Widget 与 Runtime 集成

### ComponentHandler 实现

```typescript
// widget 包加载时自动执行
import { registerComponentHandler } from '@fukict/runtime';

// 注册 Widget 类组件处理器
registerComponentHandler({
  name: 'Widget',
  priority: 100,

  // 1. 检测 Widget 类
  detect(fn) {
    return (
      fn.prototype instanceof Widget || fn.__COMPONENT_TYPE__ === 'WIDGET_CLASS'
    );
  },

  // 2. 渲染 Widget 实例
  render(Component, props, children) {
    // 创建实例
    const instance = new Component({ ...props, children });

    // 调用 render
    const vnode = instance.render();

    // 存储实例引用（供后续生命周期使用）
    vnode.__instance__ = instance;

    return vnode;
  },

  // 3. 提取特殊属性（refs、slots、detach）
  processVNode(vnode) {
    const props = vnode.props;
    if (!props) return vnode;

    // 提取 fukict:ref（类组件）
    if (props['fukict:ref']) {
      const refName = props['fukict:ref'];
      const parent = getCurrentWidget();
      if (parent && vnode.__instance__) {
        // 类组件：直接注册实例
        parent.refs.set(refName, vnode.__instance__);
      }
    }

    // 标记脱围节点（所有节点类型）
    if (props['fukict:detach']) {
      vnode.__detached__ = true;
    }

    return vnode;
  },

  // 4. 挂载时触发生命周期（DOM 已插入）
  onMount(element, vnode) {
    // 脱围组件也正常触发 onMounted
    const instance = vnode.__instance__;
    if (instance) {
      instance.element = element;
      instance.onMounted?.();  // ← 此时 DOM 已插入，可以访问 DOM 属性
    }
  },

  // 5. 跳过 fukict: 前缀属性
  processAttribute(element, key, value) {
    if (key.startsWith('fukict:')) {
      return true; // 已处理（不设置到 DOM）
    }
    return false; // 继续默认逻辑
  },

  // 6. 卸载时清理
  onUnmount(element, vnode) {
    const instance = vnode.__instance__;
    if (instance) {
      instance.onBeforeUnmount?.();

      // 清理 refs
      const parent = getParentWidget(instance);
      if (parent) {
        parent.refs.forEach((ref, name) => {
          if (ref === instance) {
            parent.refs.delete(name);
          }
        });
      }
    }
  },
});

// 注册 defineWidget 函数组件处理器
registerComponentHandler({
  name: 'defineWidget',
  priority: 100,

  // 检测 defineWidget 函数
  detect(fn) {
    return fn.__COMPONENT_TYPE__ === 'WIDGET_FUNCTION';
  },

  // 渲染函数组件
  render(component, props, children) {
    // 直接调用函数
    const vnode = component({ ...props, children });

    // 标记来源（用于调试）
    vnode.__component__ = component;

    return vnode;
  },

  // 函数组件不需要生命周期，其他方法不实现
});
```

### Runtime 对非组件节点的 ref 处理

**runtime 需要处理 DOM 元素和函数组件的 fukict:ref**：

```typescript
// runtime/src/renderer/create.ts
function createElementFromVNode(vnode: VNode): Element {
  const element = dom.createElement(vnode.type as string)

  // ... 设置属性、创建子节点 ...

  // 处理 fukict:ref（仅脱围节点）
  if (vnode.props?.['fukict:ref'] && vnode.__detached__) {
    // 脱围的 DOM 元素/函数组件：注册 DetachedRef
    const parent = getCurrentWidget()
    if (parent) {
      const refName = vnode.props['fukict:ref']
      const detachedRef: DetachedRef = {
        element,
        update: (newVNode: VNode) => {
          // 使用 replaceNode 更新
          const newNode = createNode(newVNode)
          if (newNode) {
            replaceNode(element, newNode, vnode)
            // 更新引用
            detachedRef.element = newNode as Element
          }
        }
      }
      parent.refs.set(refName, detachedRef)
    }
  }

  return element
}
```

**DetachedRef 接口定义**：

```typescript
// widget/src/types.ts
export interface DetachedRef<T extends Element = Element> {
  element: T                        // DOM 元素引用
  update: (newVNode: VNode) => void // 更新函数
}
```

**使用示例**：

```typescript
class Editor extends Widget<{}> {
  protected declare refs: {
    preview: DetachedRef<HTMLDivElement>
  }

  updatePreview = (html: string) => {
    // 通过 DetachedRef 的 update 方法更新
    this.refs.preview.update(
      <div class="preview" innerHTML={html} />
    )
  }

  render() {
    return (
      <div>
        <textarea on:input={this.handleInput} />

        {/* 脱围 DOM 元素 */}
        <div fukict:detach fukict:ref="preview" class="preview" />
      </div>
    );
  }
}
```

## Widget 手动挂载机制

### Widget.mount() 方法

```typescript
class Widget<TProps = {}> {
  /**
   * 手动挂载组件到容器
   * @param container - 容器元素
   */
  public mount(container: Element): void {
    // 1. 渲染 VNode
    const vnode = this.render();
    this.__vnode__ = vnode;

    // 2. 创建 DOM（不触发生命周期）
    const node = createNode(vnode);

    if (node) {
      // 3. 插入 DOM
      container.appendChild(node);

      // 4. 设置 element 引用
      if (node instanceof Element) {
        this.element = node;
      }

      // 5. 手动触发 onMounted（此时 DOM 已插入）
      this.onMounted?.();
    }
  }
}
```

### 手动挂载 vs 自动挂载

| 方式       | 触发时机                  | 使用场景                   | onMounted 调用 |
| ---------- | ------------------------- | -------------------------- | -------------- |
| 自动挂载   | 父组件渲染时自动创建      | 常规子组件                 | 自动           |
| 手动挂载   | 用户调用 `mount()` 时创建 | 延迟加载、条件渲染         | 手动           |

### 脱围机制与挂载

**脱围不影响首次挂载和生命周期**：

```typescript
class Parent extends Widget<{}> {
  protected declare refs: {
    chart: HeavyChart,                     // 类组件：引用实例
    preview: DetachedRef<HTMLDivElement>   // DOM：引用 DetachedRef
  }

  onMounted() {
    // ✅ 脱围组件的 onMounted 已正常触发
    console.log(this.refs.chart.element);  // 有值
  }

  handleUpdate = () => {
    // 手动更新脱围节点
    this.refs.chart.update({ data: 'new' })
    this.refs.preview.update(<div>new content</div>)
  }

  render() {
    return (
      <div>
        {/* 类组件脱围：正常挂载并触发 onMounted */}
        <HeavyChart fukict:detach fukict:ref="chart" />

        {/* DOM 元素脱围：正常挂载 */}
        <div fukict:detach fukict:ref="preview" class="preview" />
      </div>
    );
  }
}
```

**脱围的核心特性**：

- ✅ **首次挂载正常**：自动挂载并触发 onMounted（仅组件）
- ✅ **生命周期正常**：onMounted、onBeforeUnmount 都会触发（仅组件）
- ❌ **不自动更新**：父组件更新时跳过 diff/patch
- ✅ **手动更新可用**：通过 ref 手动更新
- ⚠️ **持久化配置**：一旦脱围，永久生效（除非 forceUpdate）

## 与 scheduler 集成

### 可选集成

```typescript
import { scheduleRender } from '@fukict/scheduler';

// widget 检测 scheduler 是否可用
if (typeof scheduleRender === 'function') {
  // 使用 scheduler 调度渲染
} else {
  // 同步渲染
}
```

### 集成点

- `Widget.forceUpdate()` 可以使用调度器
- `Widget.mount()` 可以使用调度器
- 用户可以选择不使用（同步渲染）

---

**文档状态**：设计阶段
**最后更新**：2025-01-09
