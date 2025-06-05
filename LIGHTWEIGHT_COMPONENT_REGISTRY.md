# 轻量级组件范式注册方案

## 🎯 设计原则

在 `@vanilla-dom/core` 现有能力基础上，**最小化扩展**，只增加编码范式注册能力，解决组件组合困难的问题。

## 📦 当前 Core 能力

```typescript
// core 已有的能力
- VNode 数据结构
- ComponentFunction 类型  
- render() 渲染函数
- updateDOM() 更新算法
- DOM 工具集
```

## 🔧 轻量级扩展

### 在 core 中只需新增一个文件：`component-registry.ts`

```typescript
// packages/core/src/component-registry.ts

// 组件实例统一接口
export interface ComponentInstance {
  mount(container: Element): void | Promise<void>;
  update?(props: any): void;
  destroy?(): void;
  element?: Element | null;
}

// 组件工厂注册接口
export interface ComponentFactory {
  name: string;
  
  // 创建组件实例
  create(factory: Function, props: any): ComponentInstance;
  
  // 检测是否是该范式的组件
  detect(value: any): boolean;
}

// 注册中心
const factoryRegistry = new Map<string, ComponentFactory>();

// 注册组件工厂
export function registerComponentFactory(factory: ComponentFactory): void {
  factoryRegistry.set(factory.name, factory);
}

// 智能组件创建（在 VNode 渲染时使用）
export function createSmartComponent(value: any, props: any): ComponentInstance | null {
  for (const factory of factoryRegistry.values()) {
    if (factory.detect(value)) {
      return factory.create(value, props);
    }
  }
  return null;
}

// 在 JSX 中组合组件的辅助函数
export function embedComponent(component: any, props: any = {}): VNode {
  return {
    type: '__embedded_component__',
    props: { component, componentProps: props },
    events: null,
    children: []
  };
}
```

### 修改渲染器，增加组件处理

```typescript
// packages/core/src/renderer.ts（新增几行代码）

import { createSmartComponent } from './component-registry.js';

// 在 createDOMFromTree 函数中新增处理
function createDOMFromTree(vnode: VNode): Element {
  // ... 现有逻辑 ...
  
  // 新增：处理嵌入的组件
  if (vnode.type === '__embedded_component__') {
    const { component, componentProps } = vnode.props!;
    const instance = createSmartComponent(component, componentProps);
    
    if (instance) {
      const container = document.createElement('div');
      instance.mount(container);
      return instance.element || container.firstElementChild as Element;
    }
  }
  
  // ... 现有逻辑 ...
}
```

## 📝 Widget 包的适配

### 注册 Widget 工厂

```typescript
// packages/widget/src/component-factory.ts
import { ComponentFactory, registerComponentFactory } from '@vanilla-dom/core';

const widgetFactory: ComponentFactory = {
  name: 'widget',
  
  detect(value: any): boolean {
    // 检测 createWidget 返回的函数
    return typeof value === 'function' && value.__widget_type__ === 'simple';
  },
  
  create(factory: Function, props: any) {
    return factory(props); // createWidget 返回的就是 ComponentInstance
  }
};

const widgetClassFactory: ComponentFactory = {
  name: 'widget-class',
  
  detect(value: any): boolean {
    // 检测 Widget 基类
    return typeof value === 'function' && value.prototype instanceof Widget;
  },
  
  create(WidgetClass: any, props: any) {
    return new WidgetClass(props);
  }
};

// 自动注册
registerComponentFactory(widgetFactory);
registerComponentFactory(widgetClassFactory);
```

### 修改 createWidget 返回值

```typescript
// packages/widget/src/simple.ts（微调）
export const createWidget = <T extends WidgetProps>(
  renderFn: SimpleWidgetRender<T>
) => {
  const factory = (props: T): SimpleWidgetInstance => {
    // ... 现有逻辑 ...
  };
  
  // 新增：标记类型，供注册中心识别
  factory.__widget_type__ = 'simple';
  
  return factory;
};
```

## 🚀 使用效果

### 解决组合困难问题

```tsx
// 之前：组合困难
private renderTodoItems() {
  const container = this.$('#todo-items-container');
  if (container) {
    this.todos.forEach(todo => {
      const todoWidget = TodoItemWidget({ item: todo, ... });
      const tempDiv = document.createElement('div');
      todoWidget.mount(tempDiv);
      if (tempDiv.firstElementChild) {
        container.element?.appendChild(tempDiv.firstElementChild);
      }
    });
  }
}
```

```tsx
// 现在：无缝组合
import { embedComponent } from '@vanilla-dom/core';

render() {
  return (
    <div className="todo-example">
      <ul className="todo-items">
        {this.todos.map(todo => 
          embedComponent(TodoItemWidget, { 
            item: todo, 
            onToggle: this.handleToggle.bind(this),
            onDelete: this.handleDelete.bind(this)
          })
        )}
      </ul>
    </div>
  );
}
```

### 混合范式无缝使用

```tsx
// 在同一个 JSX 中混合使用不同范式
const App = () => (
  <div>
    <h1>我的应用</h1>
    
    {/* Widget 基类组件 */}
    {embedComponent(TodoList, { todos: myTodos })}
    
    {/* createWidget 组件 */}
    {embedComponent(SimpleCounter, { count: 5 })}
    
    {/* 第三方范式组件 */}
    {embedComponent(SignalComponent, { signal: mySignal })}
  </div>
);
```

## 📊 改动量对比

| 包 | 新增文件 | 修改文件 | 新增代码行数 |
|----|---------|---------|-------------|
| core | `component-registry.ts` | `renderer.ts` | ~60 行 |
| widget | `component-factory.ts` | `simple.ts` | ~30 行 |
| **总计** | **2 个文件** | **2 个文件** | **~90 行** |

## 🎯 核心优势

1. **最小化侵入** - core 包只新增一个文件，现有 API 完全不变
2. **向后兼容** - 现有代码无需修改，可渐进式升级  
3. **开放扩展** - 任何第三方都能注册自己的组件工厂
4. **统一组合** - 通过 `embedComponent` 统一所有范式的组合方式
5. **类型安全** - 基于现有的 VNode 类型系统

## 🔄 迁移路径

1. **Phase 1**: core 增加 component-registry.ts
2. **Phase 2**: widget 包注册工厂
3. **Phase 3**: 更新使用方式（可选，向后兼容）

这样既保持了 core 的轻量级，又解决了组件组合的核心问题！ 