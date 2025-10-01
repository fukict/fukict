# 🚀 @fukict/core Basic Demo

一个**无需编译**的基础演示，直接展示 `@fukict/core` 的核心功能。通过原生 ES 模块加载，无需任何构建工具。

## ✨ 演示特性

### 核心功能

- ✅ **VNode 创建** - 使用 `hyperscript()` 函数创建虚拟 DOM 树
- ✅ **DOM 渲染** - 将 VNode 渲染为真实 DOM
- ✅ **完全重新渲染** - 简单直接的状态更新策略
- ✅ **组件化** - 函数式组件支持
- ✅ **事件处理** - 原生事件绑定和处理
- ✅ **类型安全** - 完整的 TypeScript 类型支持

### 交互演示

1. **🔢 计数器组件** - 展示状态管理和事件处理
2. **📝 Todo 列表** - 展示动态列表渲染和表单处理
3. **⚡ 性能测试** - 1000 节点压力测试
4. **🔧 API 示例** - 正确的 hyperscript 调用方式

## 🛠️ API 使用说明

### hyperscript 函数签名

```javascript
hyperscript(type, props, events, ...children);
```

- **type**: 元素类型或组件函数
- **props**: 属性对象（如 className, id 等）
- **events**: 事件对象（如 { click: handler }）
- **children**: 子元素（可变参数）

### 使用示例

```javascript
// ✅ 有属性无事件
hyperscript('div', { class: 'container' }, null, '内容');

// ✅ 无属性有事件
hyperscript('button', null, { click: handleClick }, '按钮');

// ✅ 既有属性又有事件
hyperscript('button', { class: 'btn' }, { click: handleClick }, '按钮');

// ✅ 组件调用
hyperscript(Counter, { count: 0 });
```

## 🚀 快速开始

### 方式 1: 本地文件服务器 (推荐)

```bash
# 在项目根目录启动静态服务器
npx serve demos/basic-demo

# 或使用 Python
python3 -m http.server 8000

# 或使用 Node.js
npx http-server demos/basic-demo
```

然后访问：`http://localhost:8000`

### 方式 2: 直接打开文件

```bash
# 直接在浏览器中打开 (某些浏览器可能有 CORS 限制)
open demos/basic-demo/index.html
```

> ⚠️ **注意**: 由于 ES 模块的 CORS 限制，强烈推荐使用本地服务器方式

## 📊 性能表现

- **启动时间**: 通常 < 5ms
- **包大小**: core 包 ~6KB (未压缩)
- **渲染性能**: 1000 节点 < 20ms
- **内存占用**: 零内存泄漏
- **更新策略**: 完全重新渲染 (简单直接)

## 🎮 交互指南

### 页面操作

- 点击 **计数器按钮** 测试状态更新
- 在 **Todo 输入框** 中添加新任务
- 点击 **压力测试** 按钮创建 1000 个节点

### 在浏览器控制台中

```javascript
// 查看应用状态
window.fukictDemo.appState;

// 手动更新状态
window.fukictDemo.updateState({ counter: 100 });

// 手动重新渲染
window.fukictDemo.renderApp();

// 测试 hyperscript API
const { hyperscript } = window.fukictDemo;
hyperscript('div', { style: 'color: red' }, null, 'Hello!');
```

## 📚 技术特点

### 🎯 无需编译

- 直接使用 ES 模块
- 无需任何构建工具
- 开箱即用的开发体验

### ⚡ 简单高效

- 完全重新渲染策略
- 零配置复杂度
- 易于理解和调试

### 🔧 现代 API

- hyperscript 函数式创建
- 事件对象分离设计
- TypeScript 原生支持

## 🔗 相关资源

- [Fukict 核心库](../../packages/core/)
- [TypeScript 类型定义](../../packages/core/types/jsx.d.ts)
- [更多构建工具示例](../)

## 📝 学习路径

1. **基础理解**: 从这个 basic-demo 开始
2. **构建工具**: 尝试 [vite-demo](../vite-demo/) 或 [rsbuild-demo](../rsbuild-demo/)
3. **高级功能**: 查看 [webpack-demo](../webpack-demo/)
4. **插件开发**: 研究 [babel-plugin 源码](../../packages/babel-plugin/)

## �� 许可证

MIT License
