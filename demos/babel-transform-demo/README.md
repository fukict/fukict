# 🔧 Babel Transform Demo

这个demo用于测试和验证 `@vanilla-dom/babel-plugin` 的 JSX 转换效果，确保 JSX 语法能正确转换为 `hyperscript` 函数调用。

## ✨ 功能

- 🧪 **转换测试** - 测试各种 JSX 语法的转换效果
- ⚡ **事件分离** - 验证 `on:event` 语法是否正确转换为事件对象
- 🔧 **API 验证** - 检查是否生成正确的4参数 hyperscript 调用
- 📦 **自动导入** - 验证是否自动添加运行时导入语句

## 🚀 使用方法

1. **安装依赖**:

   ```bash
   pnpm install
   ```

2. **运行转换测试**:

   ```bash
   npm run test
   ```

3. **仅转换代码**:

   ```bash
   npm run transform
   ```

4. **清理输出**:
   ```bash
   npm run clean
   ```

## 📝 测试用例

`src/test.jsx` 包含以下测试用例：

### 1. 基础元素转换

```jsx
<div className="container">Hello World</div>
```

转换为：

```js
hyperscript('div', { className: 'container' }, null, 'Hello World');
```

### 2. 事件处理转换

```jsx
<button on:click={() => console.log('clicked')}>Click me</button>
```

转换为：

```js
hyperscript(
  'button',
  null,
  { click: () => console.log('clicked') },
  'Click me',
);
```

### 3. 复合属性和事件

```jsx
<input
  type="text"
  className="form-input"
  on:change={handleChange}
  on:focus={handleFocus}
/>
```

转换为：

```js
hyperscript(
  'input',
  {
    type: 'text',
    className: 'form-input',
  },
  {
    change: handleChange,
    focus: handleFocus,
  },
);
```

### 4. 嵌套结构

```jsx
<div className="app">
  <h1>Title</h1>
  <p>Content</p>
</div>
```

转换为：

```js
hyperscript(
  'div',
  { className: 'app' },
  null,
  hyperscript('h1', null, null, 'Title'),
  hyperscript('p', null, null, 'Content'),
);
```

### 5. Fragment 语法

```jsx
<>
  <span>Item 1</span>
  <span>Item 2</span>
</>
```

转换为：

```js
hyperscript(
  Fragment,
  null,
  null,
  hyperscript('span', null, null, 'Item 1'),
  hyperscript('span', null, null, 'Item 2'),
);
```

### 6. 组件调用

```jsx
<Counter count={5} onIncrement={handleIncrement} />
```

转换为：

```js
hyperscript(Counter, { count: 5, onIncrement: handleIncrement });
```

## 🎯 期望的转换结果

### 关键转换规则

1. **属性分离**: 普通属性放在第2个参数
2. **事件分离**: `on:event` 事件放在第3个参数
3. **子元素**: 子元素作为第4个及后续参数
4. **空参数**: 没有属性或事件时使用 `null` 占位

### 自动导入注入

转换后的文件顶部应自动添加：

```js
import { Fragment, hyperscript } from '@vanilla-dom/core';
```

## 📊 验证要点

### ✅ 正确转换

- 函数名使用 `hyperscript`
- 参数顺序：type, props, events, children
- 事件对象正确提取
- 自动导入语句添加

### ❌ 常见错误

- 参数顺序错误
- 事件未分离到第3个参数
- 缺失自动导入
- Fragment 处理不正确

## 📁 文件结构

```
babel-transform-demo/
├── src/
│   └── test.jsx          # 测试的JSX源文件
├── dist/
│   └── test.js           # 转换后的JS文件
├── babel.config.js       # Babel配置
├── test-runner.mjs       # 测试脚本
├── package.json
└── README.md
```

## 🔧 Babel 配置

```js
// babel.config.js
module.exports = {
  plugins: ['@babel/plugin-syntax-jsx', '@vanilla-dom/babel-plugin'],
};
```

## 🧪 测试脚本

`test-runner.mjs` 执行以下验证：

1. **转换完成** - 检查是否生成输出文件
2. **导入注入** - 验证自动导入语句
3. **函数调用** - 确认使用 hyperscript 函数
4. **参数结构** - 检查4参数结构
5. **事件分离** - 验证事件对象提取

## 🔍 调试技巧

### 查看转换结果

```bash
# 转换后直接查看输出
npm run transform && cat dist/test.js
```

### 对比转换前后

```bash
# 使用 diff 工具对比
diff -u src/test.jsx dist/test.js
```

### 验证语法正确性

```bash
# 检查生成代码的语法
node -c dist/test.js
```

## 🔗 相关资源

- [Babel 插件开发文档](https://babeljs.io/docs/en/plugins)
- [AST Explorer](https://astexplorer.net/) - 在线 AST 查看器
- [Vanilla DOM 核心库](../../packages/core/)
- [Babel 插件源码](../../packages/babel-plugin/)

## �� 许可证

MIT License
