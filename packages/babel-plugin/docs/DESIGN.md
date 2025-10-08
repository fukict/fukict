# @fukict/babel-plugin 设计文档

## 包职责

babel-plugin 是 Fukict 的 JSX 编译器，职责：

1. **JSX 语法转换**：将 JSX 转换为 hyperscript 调用
2. **事件分离**：将 `on:` 前缀事件编译为独立参数
3. **静态优化**：常量提升、属性预处理
4. **配合 runtime**：输出 runtime 兼容的代码

## 不包含的功能

- ❌ 组件概念（不知道 Widget 类和函数组件）
- ❌ 自动 defineWidget（由 babel-preset-widget 处理）
- ❌ 运行时逻辑（纯编译期工具）

## 核心设计理念

### "JSX → hyperscript，runtime 内部处理事件"

babel-plugin 只做 JSX → hyperscript 转换，事件作为 props 的一部分：

```
输入：JSX 语法
  ↓
babel-plugin 编译
  ↓
输出：hyperscript(type, props, ...children)
  ↓
runtime 内部分离 on: 前缀的事件
```

**为什么不在编译期分离事件？**
- 简化 hyperscript API（只需要 props 参数）
- runtime 分离开销很小（只在渲染时一次）
- 用户手写代码更简单

## JSX 转换设计

### 基本转换规则

**输入 JSX**：
```tsx
<div class="container" on:click={handleClick}>
  Hello {name}
</div>
```

**输出（编译后）**：
```javascript
hyperscript(
  'div',
  { class: 'container', 'on:click': handleClick },
  'Hello ', name
)
```

### 转换流程

```
1. 解析 JSX 语法树
   ↓
2. 提取元素类型（tag name 或组件）
   ↓
3. 收集所有属性到 props 对象
   - on: 前缀事件作为普通 props
   - 其他属性也是 props
   ↓
4. 处理子节点（递归）
   ↓
5. 生成 hyperscript 调用
```

## 事件处理设计

### 事件作为 props

**编译方式**：

```tsx
// JSX
<button on:click={handleClick} on:mouseenter={handleEnter}>
  Click
</button>

// 编译为
hyperscript(
  'button',
  { 'on:click': handleClick, 'on:mouseenter': handleEnter },
  'Click'
)
```

**runtime 处理**：

runtime 在渲染时分离 `on:` 前缀的属性并绑定事件：

```typescript
// runtime 内部
for (const [key, value] of Object.entries(props)) {
  if (key.startsWith('on:')) {
    const eventName = key.slice(3)
    element.addEventListener(eventName, value)
  } else {
    element.setAttribute(key, value)
  }
}
```

**为什么不在编译期分离？**
- 简化 hyperscript API（统一用 props）
- runtime 分离开销很小（仅在渲染时一次）
- 用户手写 hyperscript 更简单

## 属性处理

### props 对象构建

**规则**：
1. 所有 JSX 属性都进入 props
2. 包括 `on:` 前缀的事件
3. 排除 `children`（作为独立参数）

**示例**：
```tsx
<div class="box" id="main" on:click={fn} style={{ color: 'red' }}>
  content
</div>

// 编译为
hyperscript(
  'div',
  {
    class: 'box',
    id: 'main',
    'on:click': fn,
    style: { color: 'red' }
  },
  'content'
)
```

### 特殊属性处理

**className → class**：
```tsx
<div className="box" />
// 编译为
hyperscript('div', { class: 'box' }, null)
```

**style 对象**：
```tsx
<div style={{ color: 'red', fontSize: 16 }} />
// 保持对象形式，runtime 处理
hyperscript('div', { style: { color: 'red', fontSize: 16 } }, null)
```

**布尔属性**：
```tsx
<input disabled />
<input disabled={true} />
<input disabled={false} />

// 编译为
hyperscript('input', { disabled: true }, null)
hyperscript('input', { disabled: true }, null)
hyperscript('input', { disabled: false }, null)
```

## 子节点处理

### children 扁平化

**JSX 语法**：
```tsx
<div>
  Hello
  {name}
  <span>World</span>
  {items.map(item => <li>{item}</li>)}
</div>
```

**编译为**：
```javascript
hyperscript(
  'div',
  null,
  'Hello',
  name,
  hyperscript('span', null, 'World'),
  items.map(item => hyperscript('li', null, item))
)
```

**处理规则**：
1. 文本节点直接作为字符串
2. 表达式 `{expr}` 保持原样
3. JSX 元素递归编译
4. 数组保持数组形式（runtime 处理扁平化）

### 空子节点过滤

**编译期不过滤**：
```tsx
<div>
  {false}
  {null}
  {undefined}
  {true && <span>show</span>}
</div>

// 编译为（保持原样）
hyperscript(
  'div',
  null,
  null,
  false,
  null,
  undefined,
  true && hyperscript('span', null, null, 'show')
)
```

**原因**：
- 条件渲染需要运行时判断
- 编译期无法确定值
- 由 runtime 在渲染时过滤

## Fragment 支持

### JSX Fragment 语法

```tsx
<>
  <div>First</div>
  <div>Second</div>
</>

// 或
<Fragment>
  <div>First</div>
  <div>Second</div>
</Fragment>
```

**编译为**：
```javascript
hyperscript(
  Fragment,
  null,
  hyperscript('div', null, 'First'),
  hyperscript('div', null, 'Second')
)
```

**Fragment 定义**：
```typescript
// 从 runtime 导入
import { Fragment } from '@fukict/runtime'
```

## 组件处理

### 函数组件（不知道是否为 Widget）

```tsx
<MyComponent count={1} on:click={fn}>
  <div>child</div>
</MyComponent>

// 编译为
hyperscript(
  MyComponent,
  { count: 1, 'on:click': fn },
  hyperscript('div', null, 'child')
)
```

**babel-plugin 不区分**：
- 是 Widget 类还是函数组件
- 是 defineWidget 还是普通函数
- 统一作为函数引用传递给 hyperscript

**组件识别由 runtime 钩子处理**：
- runtime 通过组件检测钩子识别
- widget 注册钩子处理 Widget 类和函数组件

## 静态优化

### 常量提升（未来）

**目标**：提升静态 props 为常量

```tsx
function App() {
  return (
    <div>
      <Header title="固定标题" />
      <Content data={dynamicData} />
    </div>
  )
}

// 优化后
const _static_props_1 = { title: "固定标题" }

function App() {
  return hyperscript(
    'div',
    null,
    null,
    hyperscript(Header, _static_props_1, null),
    hyperscript(Content, { data: dynamicData }, null)
  )
}
```

**初版不实现**：
- 增加复杂度
- 性能提升有限
- 可以后续版本添加

### 静态子节点优化（未来）

**目标**：标记静态子树，跳过 diff

```tsx
<div>
  <h1>固定标题</h1>  {/* 静态 */}
  <p>{dynamic}</p>    {/* 动态 */}
</div>

// 优化：标记静态节点
const _static_1 = { __static__: true, vnode: ... }
```

**初版不实现**：保持简单

## 编译选项

### 配置项

```typescript
interface BabelPluginOptions {
  // JSX 编译目标
  runtime?: 'classic' | 'automatic'  // 默认 automatic

  // 导入来源
  importSource?: string  // 默认 '@fukict/runtime'

  // 事件前缀
  eventPrefix?: string  // 默认 'on:'

  // 开发模式
  development?: boolean  // 注入 displayName 等
}
```

### runtime 模式

**automatic（推荐）**：
```tsx
// 用户代码
<div>Hello</div>

// 编译后（自动导入）
import { jsx as _jsx } from '@fukict/runtime/jsx-runtime'
_jsx('div', { children: 'Hello' })
```

**classic**：
```tsx
// 用户代码
import { h } from '@fukict/runtime'
<div>Hello</div>

// 编译后（使用用户导入的 h）
h('div', null, null, 'Hello')
```

**Fukict 使用 classic 模式**：
- 更接近 hyperscript 语义
- 参数顺序明确（type, props, events, children）
- 方便调试

### 开发模式增强

**development: true 时**：

1. **注入 displayName**：
```javascript
const MyComponent = () => <div />
MyComponent.displayName = 'MyComponent'
```

2. **注入 __source 信息**（调试用）：
```javascript
hyperscript(
  'div',
  { __source: { fileName: 'App.tsx', lineNumber: 10 } },
  null,
  'Hello'
)
```

**生产模式移除**：减少体积

## 与 runtime 配合

### hyperscript 接口契约

babel-plugin 输出必须符合 runtime 的 hyperscript 接口：

```typescript
// runtime 定义
function hyperscript(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: VNodeChild[]
): VNode
```

### 导入声明

**自动注入导入**：
```javascript
// 如果用户没有导入，自动添加
import { hyperscript } from '@fukict/runtime'
```

**或使用别名**：
```javascript
import { h as _h } from '@fukict/runtime'
// 使用 _h 调用
```

## 错误处理

### 编译期错误

**无效的 JSX**：
```tsx
<div on:={fn} />  // 空事件名
```

**提示**：
```
Babel plugin error: Empty event name after 'on:'
at App.tsx:10:5
```

**类型错误（配合 TypeScript）**：
```tsx
<div unknown-attr="value" />
```

**不报错**：
- babel-plugin 不做类型检查
- 由 TypeScript 处理

## 性能考虑

### 编译性能

- 单次遍历 AST
- 最小化节点操作
- 避免重复计算

### 输出代码性能

- 最小化函数调用
- props/events 为 null 时传 null（不创建空对象）
- 子节点直接展开为参数（不创建数组）

## 与其他工具集成

### TypeScript

**tsconfig.json**：
```json
{
  "compilerOptions": {
    "jsx": "preserve",  // 保留 JSX，交给 Babel 处理
    "jsxImportSource": "@fukict/widget"
  }
}
```

**或使用 react-jsx 模式（借用 React 的 JSX 转换）**：
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@fukict/widget"
  }
}
```

### Vite

**vite.config.ts**：
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from '@fukict/widget'`
  },
  // 或使用 babel 插件
  plugins: [
    {
      name: 'fukict',
      config() {
        return {
          esbuild: false  // 禁用 esbuild jsx
        }
      }
    }
  ]
})
```

### Webpack

**webpack.config.js**：
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@fukict/babel-preset-widget']
          }
        }
      }
    ]
  }
}
```

### Rsbuild

**rsbuild.config.ts**：
```typescript
export default {
  tools: {
    babel: (config) => {
      config.presets.push('@fukict/babel-preset-widget')
      return config
    }
  }
}
```

## 测试策略

### 单元测试

- JSX 语法转换
- 事件分离
- 属性处理
- 子节点处理
- Fragment 支持

### 集成测试

- 与 runtime 集成
- 与 TypeScript 集成
- 与构建工具集成

### Snapshot 测试

```typescript
expect(
  transform('<div on:click={fn}>Hello</div>')
).toMatchSnapshot()
```

## 设计权衡记录

### 1. 为什么用 classic 模式而非 automatic？

**决策**：使用 classic 模式（手动导入 h）

**理由**：
- hyperscript 参数顺序明确
- 更接近底层语义
- 方便调试和理解

**权衡**：
- 需要手动导入（但 widget 会重新导出）
- 但更灵活，可以使用别名

### 2. 为什么事件前缀是 on:？

**决策**：使用 `on:` 前缀而非 `on` 前缀

**理由**：
- 与普通属性明确区分（onClick vs on:click）
- 避免命名冲突
- 编译期容易识别

**权衡**：
- 语法略显冗长
- 但更清晰

### 3. 为什么不在编译期过滤空值？

**决策**：保留 null/undefined/boolean，由 runtime 处理

**理由**：
- 条件渲染需要运行时判断
- 编译期无法确定值
- 保持编译器简单

**权衡**：
- 输出代码包含无效值
- 但逻辑正确，runtime 会过滤

### 4. 为什么不实现静态优化？

**决策**：初版不实现常量提升、静态标记

**理由**：
- 增加复杂度
- 性能提升有限（现代引擎已优化）
- 可以后续添加

**权衡**：
- 性能不是最优
- 但保持简单

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
