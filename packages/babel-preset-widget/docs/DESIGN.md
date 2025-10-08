# @fukict/babel-preset-widget 设计文档

## 包职责

babel-preset-widget 是 Fukict 的零配置编译预设，职责：

1. **零配置**：开箱即用，无需用户配置
2. **自动 defineWidget**：识别函数组件并自动包裹
3. **集成 babel-plugin**：调用基础 JSX 编译
4. **开发体验优化**：displayName 注入、调试信息

## 核心设计理念

### "零配置，开箱即用"

用户只需：

```json
{
  "presets": ["@fukict/babel-preset-widget"]
}
```

就能获得完整的 Fukict 编译能力。

## 预设结构

### 内部组成

```
@fukict/babel-preset-widget
  ├─ plugin: auto-define-widget（自动包裹）
  ├─ plugin: @fukict/babel-plugin（JSX 编译）
  └─ plugin: inject-display-name（开发模式）
```

### 执行顺序

```
1. auto-define-widget
   检测函数组件，包裹 defineWidget
   ↓
2. @fukict/babel-plugin
   JSX 转换为 hyperscript
   ↓
3. inject-display-name（开发模式）
   注入 displayName
```

## 自动 defineWidget 设计

### 检测规则

**识别为函数组件的条件**：

1. 变量声明 + 函数表达式/箭头函数
2. 函数名首字母大写
3. 返回值是 JSX 元素
4. 未被 defineWidget 包裹
5. 未标记 `@nowidget`

**示例**：

```tsx
// ✅ 会被识别
const Greeting = ({ name }) => <div>Hello {name}</div>;
const Button = function ({ text }) {
  return <button>{text}</button>;
};

// ❌ 不会被识别（小写）
const helper = () => <div>test</div>;

// ❌ 不会被识别（已包裹）
const Counter = defineWidget(() => <div />);

// ❌ 不会被识别（显式标记）
/** @nowidget */
const MyFunction = () => <div />;
```

### 转换逻辑

**输入**：

```tsx
const Greeting = ({ name }) => <div>Hello {name}</div>;
```

**输出**：

```tsx
import { defineWidget } from '@fukict/widget';

const Greeting = defineWidget(({ name }) => <div>Hello {name}</div>);
```

### 自动导入 defineWidget

**检测导入**：

```tsx
// 如果用户已导入，不重复导入
import { defineWidget } from '@fukict/widget';
```

**自动注入**：

```tsx
// 如果用户未导入，自动添加
import { defineWidget } from '@fukict/widget';
```

### 处理边缘情况

**导出的函数组件**：

```tsx
export const Greeting = ({ name }) => <div>Hello {name}</div>

// 转换为
export const Greeting = defineWidget(({ name }) => <div>Hello {name}</div>)
```

**默认导出**：

```tsx
export default ({ name }) => <div>Hello {name}</div>;

// 转换为
export default defineWidget(({ name }) => <div>Hello {name}</div>);
```

**函数声明（不转换）**：

```tsx
function Greeting({ name }) {
  return <div>Hello {name}</div>;
}

// 不转换（需要用户手动包裹或重构为箭头函数）
```

**理由**：函数声明的转换复杂度高，可能破坏提升行为。

### @nowidget 标记

**用途**：显式告诉编译器不要自动包裹

```tsx
/** @nowidget */
const MyFunction = () => <div>test</div>;

// 不会被 defineWidget 包裹
```

**使用场景**：

- 返回 JSX 但不是组件的工具函数
- 需要手动控制的情况

## JSX 编译集成

### 调用 babel-plugin

```javascript
// preset 内部实现
module.exports = function () {
  return {
    plugins: [
      // 1. 自动 defineWidget
      [require('./plugins/auto-define-widget')],

      // 2. JSX 编译（基础）
      [
        require('@fukict/babel-plugin'),
        {
          eventPrefix: 'on:', // 内置配置
          development: process.env.NODE_ENV !== 'production',
        },
      ],
    ],
  };
};
```

### 配置传递

**内置配置（用户不可见）**：

- `eventPrefix: 'on:'` - 事件前缀
- `development` - 根据 NODE_ENV 自动判断

## 开发模式增强

### displayName 自动注入

**开发模式下**：

```tsx
const Greeting = defineWidget(({ name }) => <div>Hello {name}</div>);

// 自动注入
Greeting.displayName = 'Greeting';
```

**用途**：

- 调试工具显示组件名
- 错误堆栈更清晰
- devtools 可视化

**生产模式**：

- 不注入（减少体积）

### 组件类型标记

**自动标记组件类型**：

```tsx
const Greeting = defineWidget(...)
Greeting.__COMPONENT_TYPE__ = 'WIDGET_FUNCTION'
```

**用途**：

- runtime 组件检测钩子使用
- 已由 defineWidget 内部处理，preset 无需额外操作

## 预设配置

### 不接受配置（零配置理念）

```json
{
  "presets": ["@fukict/babel-preset-widget"]
}
```

**不是这样**：

```json
{
  "presets": [
    [
      "@fukict/babel-preset-widget",
      {
        "autoDefineWidget": false // ❌ 不提供配置
      }
    ]
  ]
}
```

**理由**：

- preset 就是约定
- 保持简单
- 如果需要自定义，直接用底层 plugin

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
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'fukict-babel',
      transform(code, id) {
        if (!/\.(tsx|jsx)$/.test(id)) return;

        // 使用 Babel 转换
        const result = transformSync(code, {
          presets: ['@fukict/babel-preset-widget'],
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
            presets: ['@fukict/babel-preset-widget'],
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
      config.presets = ['@fukict/babel-preset-widget'];
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
    "jsxImportSource": "@fukict/widget"
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
[@fukict/babel-preset-widget] Warning: Function declaration detected.
Consider using arrow function for auto defineWidget:
  const Greeting = () => <div>Hello</div>
at App.tsx:10
```

### 循环依赖检测

**检测 defineWidget 循环包裹**：

```tsx
const Greeting = defineWidget(defineWidget(() => <div />));
```

**错误**：

```
[@fukict/babel-preset-widget] Error: Nested defineWidget detected.
Remove manual defineWidget wrapping when using preset.
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
import { defineWidget } from '@fukict/widget'
const Greeting = defineWidget(({ name }) => <div>{name}</div>)
```

## 测试策略

### 单元测试

- 函数组件识别
- 自动 defineWidget 包裹
- 边缘情况处理
- @nowidget 标记

### 集成测试

- 与 babel-plugin 配合
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
      presets: ['@fukict/babel-preset-widget'],
    },
  ),
).toMatchSnapshot();
```

## 设计权衡记录

### 1. 为什么不支持函数声明？

**决策**：仅支持箭头函数和函数表达式

**理由**：

- 函数声明转换复杂（提升行为）
- 箭头函数是推荐写法
- 保持实现简单

**权衡**：

- 用户需要调整写法
- 但避免了复杂的边缘情况

### 2. 为什么不允许配置？

**决策**：零配置，不接受任何配置项

**理由**：

- preset 就是约定
- 避免配置地狱
- 保持简单一致

**权衡**：

- 灵活性降低
- 但降低了学习成本

### 3. 为什么通过大写识别组件？

**决策**：首字母大写 = 组件

**理由**：

- 社区约定（React、Vue 同样规则）
- 简单明确
- 编译期可靠识别

**权衡**：

- 强制命名约定
- 但符合最佳实践

### 4. 为什么提供 @nowidget 标记？

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
  "presets": ["@babel/preset-react"] // 零配置
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
  "presets": ["@fukict/babel-preset-widget"] // 零配置 + 自动 defineWidget
}
```

**Fukict 特色**：

- 不仅零配置 JSX 编译
- 还自动包裹函数组件
- 用户体验更好

---

**文档状态**：设计阶段
**最后更新**：2025-01-08
