# Vanilla DOM 开放编码范式注册架构

## 🎯 设计愿景

让 `@vanilla-dom/core` + `@vanilla-dom/babel-plugin` 成为一个**开放平台**，任何第三方库都能注册自己的编码范式，实现与 JSX 的无缝衔接。

## 🏗️ 核心架构

```
┌─────────────────────────────────────────────────────────┐
│                   编译时层 (Build Time)                  │
├─────────────────────────────────────────────────────────┤
│  @vanilla-dom/babel-plugin                             │
│  ┌─────────────────────────────────────────────────────┐│
│  │            范式注册中心 (Registry)                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ││
│  │  │   widget    │  │   signal    │  │   custom    │  ││
│  │  │   范式转换   │  │   范式转换   │  │   范式转换   │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   运行时层 (Runtime)                    │
├─────────────────────────────────────────────────────────┤
│  @vanilla-dom/core                                     │
│  ┌─────────────────────────────────────────────────────┐│
│  │            运行时注册中心 (Runtime Registry)         ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ││
│  │  │   widget    │  │   signal    │  │   custom    │  ││
│  │  │   运行时     │  │   运行时     │  │   运行时     │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🔧 编码范式注册接口

### 1. Babel Plugin 范式注册

```typescript
// @vanilla-dom/babel-plugin/src/registry.ts
export interface ParadigmTransformer {
  name: string;
  
  // 识别范式标识符
  identify(node: t.Node, context: TransformContext): boolean;
  
  // 转换 JSX 为对应范式的调用
  transform(jsxElement: t.JSXElement, context: TransformContext): t.Expression;
  
  // 导入依赖管理
  imports: {
    source: string;
    specifiers: Array<{
      imported: string;
      local?: string;
    }>;
  };
}

// 注册范式
export function registerParadigm(transformer: ParadigmTransformer): void;
```

### 2. Runtime 范式注册

```typescript
// @vanilla-dom/core/src/paradigm-registry.ts
export interface RuntimeParadigm {
  name: string;
  
  // 组件实例化
  createInstance(factory: Function, props: any): ComponentInstance;
  
  // 组件组合（仅 Base Function 需要）
  compose?(parent: Element, child: ComponentInstance): void;
  
  // 组件更新
  update?(instance: ComponentInstance, newProps: any): void;
  
  // 生命周期钩子
  lifecycle?: {
    beforeMount?(instance: ComponentInstance): void;
    afterMount?(instance: ComponentInstance): void;
    beforeDestroy?(instance: ComponentInstance): void;
  };
}

// 注册运行时范式
export function registerRuntimeParadigm(paradigm: RuntimeParadigm): void;
```

## 📝 Widget 范式实现示例

### 编译时转换

```typescript
// @vanilla-dom/widget/babel-transformer.ts
import { ParadigmTransformer } from '@vanilla-dom/babel-plugin';

export const widgetTransformer: ParadigmTransformer = {
  name: 'widget',
  
  identify(node, context) {
    // 识别 createWidget 调用
    return (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'createWidget'
    );
  },
  
  transform(jsxElement, context) {
    // 转换 JSX 为 createWidget 调用
    return t.callExpression(
      t.identifier('__widget_create'),
      [context.convertJSXToVNode(jsxElement)]
    );
  },
  
  imports: {
    source: '@vanilla-dom/widget/runtime',
    specifiers: [
      { imported: '__widget_create' }
    ]
  }
};
```

### 运行时实现

```typescript
// @vanilla-dom/widget/runtime.ts
import { RuntimeParadigm } from '@vanilla-dom/core';

export const widgetRuntime: RuntimeParadigm = {
  name: 'widget',
  
  createInstance(factory, props) {
    return factory(props);
  },
  
  compose(parent, child) {
    // 解决 Base Function 组合困难的问题
    if (child.element) {
      parent.appendChild(child.element);
    } else if ((child as any).mount) {
      (child as any).mount(parent);
    }
  },
  
  update(instance, newProps) {
    if (instance.update) {
      instance.update(newProps);
    }
  }
};
```

## 🚀 第三方范式扩展示例

### Signal 范式
```typescript
// @my-org/signal-paradigm
export const signalTransformer: ParadigmTransformer = {
  name: 'signal',
  
  identify(node, context) {
    return (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'createSignalComponent'
    );
  },
  
  transform(jsxElement, context) {
    return t.callExpression(
      t.identifier('__signal_create'),
      [context.convertJSXToVNode(jsxElement)]
    );
  },
  
  imports: {
    source: '@my-org/signal-paradigm/runtime',
    specifiers: [{ imported: '__signal_create' }]
  }
};
```

## 🔌 使用方式

### 1. Babel 配置
```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['@vanilla-dom/babel-plugin', {
      paradigms: [
        '@vanilla-dom/widget/babel-transformer',
        '@my-org/signal-paradigm/babel-transformer'
      ]
    }]
  ]
};
```

### 2. 运行时注册
```typescript
// main.ts
import { registerRuntimeParadigm } from '@vanilla-dom/core';
import { widgetRuntime } from '@vanilla-dom/widget/runtime';
import { signalRuntime } from '@my-org/signal-paradigm/runtime';

registerRuntimeParadigm(widgetRuntime);
registerRuntimeParadigm(signalRuntime);
```

### 3. 无缝使用
```tsx
// App.tsx - 混合使用不同范式
import { createWidget } from '@vanilla-dom/widget';
import { createSignalComponent } from '@my-org/signal-paradigm';

const Counter = createWidget((props) => (
  <div className="counter">
    <span>{props.count}</span>
  </div>
));

const SignalCounter = createSignalComponent((props) => (
  <div className="signal-counter">
    <span>{props.signal.value}</span>
  </div>
));

// 在同一个 JSX 中无缝组合
const App = () => (
  <div>
    <Counter count={5} />
    <SignalCounter signal={mySignal} />
  </div>
);
```

## 🎯 解决的核心问题

### 1. **组合困难** - 通过统一的 compose 接口解决
```typescript
// core 自动处理组件组合
function renderChildren(parent: Element, children: any[]) {
  children.forEach(child => {
    const paradigm = getParadigm(child);
    if (paradigm.compose) {
      paradigm.compose(parent, child);
    } else {
      // 默认处理
      defaultCompose(parent, child);
    }
  });
}
```

### 2. **类型安全** - 通过注册机制保证类型一致性
```typescript
declare module '@vanilla-dom/core' {
  interface ParadigmRegistry {
    widget: typeof widgetRuntime;
    signal: typeof signalRuntime;
  }
}
```

### 3. **开发体验** - 统一的编译时和运行时处理
- 编译时：所有范式的 JSX 都能正确转换
- 运行时：所有范式的组件都能正确实例化和组合

## 📦 包结构调整

```
@vanilla-dom/core
├── src/
│   ├── vnode.ts           # VNode 基础
│   ├── render.ts          # 核心渲染逻辑
│   └── paradigm-registry.ts  # 新增：运行时范式注册

@vanilla-dom/babel-plugin
├── src/
│   ├── transform.ts       # JSX 转换核心
│   └── paradigm-registry.ts  # 新增：编译时范式注册

@vanilla-dom/widget
├── src/
│   ├── widget.ts          # Widget 基类
│   ├── simple.ts          # createWidget
│   ├── babel-transformer.ts  # 新增：编译时转换器
│   └── runtime.ts         # 新增：运行时实现
```

## 🚀 迁移路径

1. **Phase 1**: 实现范式注册机制
2. **Phase 2**: Widget 包适配新架构
3. **Phase 3**: 开放 API，支持第三方范式
4. **Phase 4**: 社区生态建设

这样的设计让 Vanilla DOM 成为真正的**开放平台**，而不是封闭的框架！ 