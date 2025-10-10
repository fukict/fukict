# @fukict/babel-preset 设计文档

## 包职责

babel-preset 是 Fukict 的零配置编译预设，职责：

1. **零配置**：开箱即用，无需用户配置
2. **内置 JSX 编译**：集成 babel-plugin，无需额外依赖
3. **自动组件识别**：识别函数组件并自动包裹 `defineFukict`
4. **开发体验优化**：displayName 注入、调试信息

## 核心设计理念

### "零配置，开箱即用"

用户只需：

```json
{
  "presets": ["@fukict/babel-preset"]
}
```

就能获得完整的 Fukict 编译能力，无需配置其他插件。

## 架构变更说明

### 与旧版本的区别

**旧架构**：

- `@fukict/babel-preset-widget` 依赖 `@fukict/babel-plugin`
- 服务于 `@fukict/widget` + `@fukict/runtime` 双包架构

**新架构**：

- `@fukict/babel-preset` 内置 babel-plugin 逻辑
- 服务于 `@fukict/basic` 单包架构
- 更简洁，减少包依赖

## 预设结构

### 内部组成

```
@fukict/babel-preset
  ├─ JSX 编译逻辑（内置，不依赖外部 plugin）
  ├─ 自动 defineFukict 包裹
  └─ 开发模式增强（displayName、调试信息）
```

### 执行流程

```
1. 检测函数组件
   判断是否需要 defineFukict 包裹
   ↓
2. JSX 转换
   将 JSX 转换为 hyperscript 调用
   ↓
3. 开发模式增强（仅开发模式）
   注入 displayName 和调试信息
```

## 自动 defineFukict 设计

### 检测规则

**识别为函数组件的条件**：

1. 变量声明 + 函数表达式/箭头函数
2. 函数名首字母大写
3. 返回值是 JSX 元素
4. 未被 `defineFukict` 包裹
5. 未标记 `@nofukict`

**示例**：

```tsx
// ✅ 会被识别并包裹
const Greeting = ({ name }) => <div>Hello {name}</div>;
const Button = function ({ text }) {
  return <button>{text}</button>;
};

// ❌ 不会被识别（小写开头）
const helper = () => <div>test</div>;

// ❌ 不会被识别（已包裹）
const Counter = defineFukict(() => <div />);

// ❌ 不会被识别（显式标记）
/** @nofukict */
const MyFunction = () => <div />;
```

### 转换逻辑

**输入**：

```tsx
const Greeting = ({ name }) => <div>Hello {name}</div>;
```

**输出**：

```tsx
import { defineFukict } from '@fukict/basic';

const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);
```

### 自动导入 defineFukict

**检测导入**：

```tsx
// 如果用户已导入，不重复导入
import { defineFukict } from '@fukict/basic';
```

**自动注入**：

```tsx
// 如果用户未导入，自动添加
import { defineFukict } from '@fukict/basic';
```

### 处理边缘情况

**导出的函数组件**：

```tsx
export const Greeting = ({ name }) => <div>Hello {name}</div>

// 转换为
export const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>)
```

**默认导出**：

```tsx
export default ({ name }) => <div>Hello {name}</div>;

// 转换为
export default defineFukict(({ name }) => <div>Hello {name}</div>);
```

**函数声明（不转换）**：

```tsx
function Greeting({ name }) {
  return <div>Hello {name}</div>;
}

// 不转换（需要用户手动包裹或重构为箭头函数）
```

**理由**：函数声明的转换复杂度高，可能破坏提升行为。

### @nofukict 标记

**用途**：显式告诉编译器不要自动包裹

```tsx
/** @nofukict */
const MyFunction = () => <div>test</div>;

// 不会被 defineFukict 包裹
```

**使用场景**：

- 返回 JSX 但不是组件的工具函数
- 需要手动控制的情况

## JSX 编译设计

### 内置 JSX 编译逻辑

preset 内置了 JSX → hyperscript 的转换逻辑，无需依赖外部 `@fukict/babel-plugin`。

**基本转换规则**：

```tsx
// JSX
<div class="container" on:click={handleClick}>
  Hello {name}
</div>;

// 编译为
hyperscript(
  'div',
  { class: 'container', 'on:click': handleClick },
  'Hello ',
  name,
);
```

### 事件处理

**`on:` 前缀事件作为 props**：

```tsx
<button on:click={handleClick} on:mouseenter={handleEnter}>
  Click
</button>;

// 编译为
hyperscript(
  'button',
  { 'on:click': handleClick, 'on:mouseenter': handleEnter },
  'Click',
);
```

**runtime 负责分离**：

runtime（@fukict/basic）在渲染时分离 `on:` 前缀的属性并绑定事件。

### 属性处理

**className → class**：

```tsx
<div className="box" />;

// 编译为
hyperscript('div', { class: 'box' });
```

**style 对象**：

```tsx
<div style={{ color: 'red', fontSize: 16 }} />;

// 保持对象形式，runtime 处理
hyperscript('div', { style: { color: 'red', fontSize: 16 } });
```

**布尔属性**：

```tsx
<input disabled />
<input disabled={true} />
<input disabled={false} />

// 编译为
hyperscript('input', { disabled: true })
hyperscript('input', { disabled: true })
hyperscript('input', { disabled: false })
```

### Fragment 支持

```tsx
<>
  <div>First</div>
  <div>Second</div>
</>;

// 编译为
hyperscript(
  Fragment,
  null,
  hyperscript('div', null, 'First'),
  hyperscript('div', null, 'Second'),
);
```

**Fragment 定义**：

```typescript
// 从 @fukict/basic 导入
import { Fragment } from '@fukict/basic';
```

## 开发模式增强

### displayName 自动注入

**开发模式下**：

```tsx
const Greeting = defineFukict(({ name }) => <div>Hello {name}</div>);

// 自动注入
Greeting.displayName = 'Greeting';
```

**用途**：

- 调试工具显示组件名
- 错误堆栈更清晰
- devtools 可视化

**生产模式**：

- 不注入（减少体积）

### 调试信息注入（未来）

**开发模式下可选**：

```tsx
hyperscript(
  'div',
  {
    __source: {
      fileName: 'App.tsx',
      lineNumber: 10,
    },
  },
  'Hello',
);
```

**初版不实现**：保持简单

## 预设配置

### 不接受配置（零配置理念）

```json
{
  "presets": ["@fukict/babel-preset"]
}
```

**不是这样**：

```json
{
  "presets": [
    [
      "@fukict/babel-preset",
      {
        "autoDefineFukict": false // ❌ 不提供配置
      }
    ]
  ]
}
```

**理由**：

- preset 就是约定
- 保持简单
- 如果需要自定义，直接手动写编译逻辑

### 环境变量控制

**通过 NODE_ENV 自动判断**：

```bash
NODE_ENV=development  # 开发模式：注入 displayName
NODE_ENV=production   # 生产模式：不注入，减少体积
```

## 与工具链集成

### Vite

**vite.config.ts**：

```typescript
import { transformSync } from '@babel/core';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'fukict-babel',
      transform(code, id) {
        if (!/\.(tsx|jsx)$/.test(id)) return;

        const result = transformSync(code, {
          presets: ['@fukict/babel-preset'],
          filename: id,
        });

        return {
          code: result.code,
          map: result.map,
        };
      },
    },
  ],
});
```

### Webpack

**webpack.config.js**：

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@fukict/babel-preset'],
          },
        },
      },
    ],
  },
};
```

### Rsbuild

**rsbuild.config.ts**：

```typescript
export default {
  tools: {
    babel: config => {
      config.presets = ['@fukict/babel-preset'];
      return config;
    },
  },
};
```

### TypeScript

**tsconfig.json**：

```json
{
  "compilerOptions": {
    "jsx": "preserve", // 保留 JSX，交给 Babel
    "jsxImportSource": "@fukict/basic"
  }
}
```

## 错误处理

### 编译错误提示

**无法识别的组件模式**：

```tsx
function Greeting() {
  // 函数声明不支持
  return <div>Hello</div>;
}
```

**警告**：

```
[@fukict/babel-preset] Warning: Function declaration detected.
Consider using arrow function for auto defineFukict:
  const Greeting = () => <div>Hello</div>
at App.tsx:10
```

### 循环依赖检测

**检测 defineFukict 循环包裹**：

```tsx
const Greeting = defineFukict(defineFukict(() => <div />));
```

**错误**：

```
[@fukict/babel-preset] Error: Nested defineFukict detected.
Remove manual defineFukict wrapping when using preset.
at App.tsx:5
```

## 性能考虑

### 编译性能

- 单次 AST 遍历
- 最小化转换次数
- 缓存识别结果

### 输出代码

**最小化额外代码**：

```tsx
// 输入
const Greeting = ({ name }) => <div>{name}</div>

// 输出（仅添加必要的包裹）
import { defineFukict } from '@fukict/basic'
const Greeting = defineFukict(({ name }) => <div>{name}</div>)
```

## 测试策略

### 单元测试

- 函数组件识别
- 自动 defineFukict 包裹
- JSX 编译
- 边缘情况处理
- @nofukict 标记

### 集成测试

- 与 @fukict/basic 配合
- 与构建工具集成
- 开发/生产模式切换

### Snapshot 测试

```typescript
expect(
  transform(
    `
    const Greeting = ({ name }) => <div>{name}</div>
  `,
    {
      presets: ['@fukict/babel-preset'],
    },
  ),
).toMatchSnapshot();
```

## 设计权衡记录

### 1. 为什么内置 JSX 编译而不依赖 babel-plugin？

**决策**：preset 内置 JSX 编译逻辑，不依赖外部 plugin

**理由**：

- 减少包依赖
- 更好的集成控制
- 避免版本不一致问题
- 用户只需安装一个包

**权衡**：

- 增加了 preset 的复杂度
- 但用户体验更好

### 2. 为什么不支持函数声明？

**决策**：仅支持箭头函数和函数表达式

**理由**：

- 函数声明转换复杂（提升行为）
- 箭头函数是推荐写法
- 保持实现简单

**权衡**：

- 用户需要调整写法
- 但避免了复杂的边缘情况

### 3. 为什么不允许配置？

**决策**：零配置，不接受任何配置项

**理由**：

- preset 就是约定
- 避免配置地狱
- 保持简单一致

**权衡**：

- 灵活性降低
- 但降低了学习成本

### 4. 为什么通过大写识别组件？

**决策**：首字母大写 = 组件

**理由**：

- 社区约定（React、Vue 同样规则）
- 简单明确
- 编译期可靠识别

**权衡**：

- 强制命名约定
- 但符合最佳实践

### 5. 为什么提供 @nofukict 标记？

**决策**：提供逃生舱口

**理由**：

- 某些函数返回 JSX 但不是组件
- 用户需要完全控制的场景
- 避免误判

**权衡**：

- 增加了一个概念
- 但提供了必要的灵活性

## 对比其他框架

### React

```json
{
  "presets": ["@babel/preset-react"] // 零配置，但不自动包裹组件
}
```

### Vue

```json
{
  "presets": ["@vue/babel-preset-app"] // 零配置
}
```

### Fukict

```json
{
  "presets": ["@fukict/babel-preset"] // 零配置 + 自动 defineFukict + 内置编译
}
```

**Fukict 特色**：

- 不仅零配置 JSX 编译
- 还自动包裹函数组件
- 内置所有编译逻辑，无需额外 plugin
- 用户体验最佳

---

**文档状态**：设计阶段
**最后更新**：2025-10-11
