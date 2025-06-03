# Changelog

All notable changes to `@vanilla-dom/core` will be documented in this file.

## [0.1.0] - 2024-12-19

### Added

#### 🎉 Initial Release

- **核心渲染引擎**

  - `render()` - 将 VNode 渲染到 DOM 容器
  - `createDOMFromTree()` - VNode 树转 DOM 元素
  - `updateDOM()` - 基于 diff 的精确更新
  - `hydrate()` - DOM 水合支持（基础实现）

- **DOM 工具集**

  - `createElement()`, `createTextNode()`, `createFragment()`
  - `appendChild()`, `insertBefore()`, `removeNode()`, `replaceNode()`
  - `setProperty()`, `updateProperty()`, `removeProperty()`
  - `clearChildren()`, `batchUpdate()`

- **JSX 运行时支持**

  - `jsx()` - JSX 工厂函数
  - `h()` - VNode 创建辅助函数
  - `Fragment` - JSX Fragment 支持
  - 兼容性导出：`jsxs`, `jsxDEV`

- **TypeScript 支持**

  - 完整的类型定义：`VNode`, `VNodeChild`, `ComponentFunction`
  - 全局 JSX 命名空间声明
  - 内置 HTML 元素类型支持
  - 事件处理器类型安全

- **性能优化**
  - WeakMap 映射管理 VNode ↔ DOM 关系
  - 批量更新机制
  - 精确属性更新
  - 事件监听器自动管理

### Technical Details

- **构建系统**: tsup + TypeScript
- **包格式**: ESM
- **目标环境**: ES2020, 现代浏览器
- **包大小**: ~6KB (未压缩), 预计 < 3KB gzipped
- **依赖**: 零运行时依赖

### Browser Support

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79
