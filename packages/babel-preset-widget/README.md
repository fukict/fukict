# @fukict/preset-widget

专为 @fukict/widget 设计的零配置 Babel 预设，提供开箱即用的组件开发环境。

## 🎯 设计目标

`@fukict/babel-preset-widget` 是一个用 **TypeScript 编写**的 Babel preset，为基于 Widget 编码范式的项目提供完整的构建配置。使用此 preset，您可以获得：

- **零配置体验**：开箱即用的完整开发环境
- **自动组件注册**：Widget 类和 createWidget 函数自动识别
- **编译时优化**：JSX 静态分析和性能优化
- **类型安全**：完整的 TypeScript 支持

## 特性

- ✅ **TypeScript 编写** - 源码使用 TypeScript，确保类型安全
- ✅ **自动组件识别** - 自动识别 Widget 类和 createWidget 函数
- ✅ **零配置** - 开箱即用，无需复杂配置
- ✅ **调试支持** - 内置调试模式和错误处理
- ✅ **向后兼容** - 与现有 babel 生态完全兼容

## 安装

```bash
pnpm install @fukict/babel-preset-widget @fukict/widget
# 推荐使用 pnpm
pnpm add @fukict/babel-preset-widget @fukict/widget
```

> **注意**：安装 preset 时会自动安装 `@fukict/babel-plugin` 作为依赖，无需手动安装。

## 使用方法

### 基本配置

在您的 `babel.config.js` 中添加 preset：

```javascript
module.exports = {
  presets: ['@fukict/babel-preset-widget'],
};
```

就这么简单！现在您可以直接使用 Widget 组件：

```tsx
import { Widget, createWidget, render } from '@fukict/widget';

// Widget 类 - 自动获得 WIDGET_CLASS 标志
class TodoList extends Widget {
  render() {
    return <div>My Todo List</div>;
  }
}

// createWidget 函数 - 自动获得 WIDGET_FUNCTION 标志
const Button = createWidget(props => {
  return <button>{props.text}</button>;
});

// JSX 中使用 - 自动识别和转换
function App() {
  return (
    <div>
      <TodoList onMounted={instance => console.log('TodoList mounted')} />
      <Button text="Click me" />
    </div>
  );
}

render(<App />, { container: document.getElementById('root')! });
```

### 高级配置

```javascript
module.exports = {
  presets: [
    [
      '@fukict/preset-widget',
      {
        // 自定义 JSX 运行时导入路径
        importSource: '@fukict/runtime',

        // 开发模式调试（默认：跟随 NODE_ENV）
        development: process.env.NODE_ENV === 'development',
      },
    ],
  ],
};
```

## TypeScript 支持

此 preset 是用 TypeScript 编写的，提供了完整的类型安全保障：

```typescript
// 类型定义（内部使用，用户无需关心）
interface PresetOptions {
  development?: boolean;
  importSource?: string;
  typescript?: boolean | object;
}
```

虽然 preset 本身不导出类型定义文件，但您在使用 `@fukict/widget` 时会获得完整的 TypeScript 支持。

## 功能特性

### 自动组件识别

此 preset 会自动识别以下组件类型：

1. **Widget 基类**：所有继承自 `Widget` 的类
2. **createWidget 函数**：通过 `createWidget` 创建的组件工厂

### 自动标志添加

- Widget 类自动获得 `__COMPONENT_TYPE__ = 'WIDGET_CLASS'` 标志
- createWidget 函数自动获得 `__COMPONENT_TYPE__ = 'WIDGET_FUNCTION'` 标志

### JSX 转换

在 JSX 中直接使用组件时，会自动转换为 hyperscript 调用，组件的注册和实例化由运行时处理：

```jsx
// 编译前
<TodoList maxItems={20} />;

// 编译后
hyperscript(
  TodoList,
  {
    maxItems: 20,
  },
  null,
);
```

组件的识别和实例化逻辑交由 @fukict/runtime 的编码范式注册机制处理，babel 插件只负责 JSX 到 hyperscript 的转换。

## 使用示例

```jsx
import { Widget, createWidget } from '@fukict/widget';

// Widget 类组件
class TodoList extends Widget {
  render() {
    return <div>TodoList Component</div>;
  }
}

// createWidget 函数组件
const SimpleButton = createWidget(props => {
  return <button>{props.text}</button>;
});

// 在 JSX 中直接使用
function App() {
  return (
    <div>
      <TodoList
        maxItems={20}
        onMounted={instance => console.log('TodoList mounted:', instance)}
      />
      <SimpleButton
        text="点击我"
        onMounted={instance => console.log('Button mounted:', instance)}
      />
    </div>
  );
}
```

## 与其他工具集成

### Vite

```javascript
// vite.config.js
import * as babel from '@babel/core';

export default {
  plugins: [
    {
      name: 'fukict-babel',
      async transform(code, id) {
        if (!/\.(tsx?|jsx?)$/.test(id)) return;
        if (!/<[A-Za-z]/.test(code)) return;

        const result = await babel.transformAsync(code, {
          filename: id,
          presets: ['@fukict/preset-widget'],
          plugins: ['@babel/plugin-syntax-jsx'],
          sourceMaps: true,
        });

        return {
          code: result?.code || code,
          map: result?.map,
        };
      },
    },
  ],
};
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@fukict/preset-widget'],
          },
        },
      },
    ],
  },
};
```

## 故障排除

### babel-plugin 未找到

如果看到警告：`babel-plugin not found`，请确保已安装：

```bash
pnpm install @fukict/babel-plugin
```

### TypeScript 配置

确保在 `tsconfig.json` 中包含正确的 JSX 配置：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@fukict/runtime"
  }
}
```

## 相关包

- [@fukict/widget](../widget) - Widget 基类和组件工厂
- [@fukict/babel-plugin](../babel-plugin) - 底层 Babel 插件
- [@fukict/runtime](../runtime) - 核心渲染引擎

## 许可证

MIT
