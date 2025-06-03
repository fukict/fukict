# **Vanilla DOM 库设计与实施计划**

## **项目概述**

构建一个专注于 **Web 客户端渲染** 的高性能 DOM 库，采用编译时优化 + 运行时渲染的分离架构，通过 JSX 语法和原生 DOM 操作，实现轻量且高效的前端渲染解决方案。

### **核心理念**

- **编译时优化**：通过 Babel 插件将 JSX 转换为优化的节点树数据结构
- **运行时轻量**：专注于高效的 DOM 创建与更新，核心包 < 10KB
- **纯客户端**：不涉及 SSR，专注 Web 浏览器环境
- **类型安全**：完整 TypeScript 支持，开箱即用的 JSX 类型体验

---

## **架构设计**

### **Package 1: `@vanilla-dom/core`**

_核心运行时包_

**职责**：接收编译后的节点树，转换为真实 DOM，并提供完整的类型支持

**核心功能**：

- **渲染引擎**：
  - `render(nodeTree, container)`: 渲染节点树到指定容器
  - `createDOMFromTree(nodeTree)`: 节点树转 DOM 元素
  - `updateDOM(oldTree, newTree, domNode)`: 基于 diff 的精确更新
  - `hydrate(nodeTree, existingDOM)`: 节点树与现有 DOM 绑定
- **DOM 工具集**：
  - `insertBefore`, `removeNode`, `replaceNode` 等基础操作
  - `batchUpdate`: 批量更新优化
  - `createFragment`: 文档片段管理
  - 浏览器兼容性处理
- **TypeScript 支持**：
  - 全局 JSX 命名空间声明（`.tsx` 文件无需导入）
  - 完整的 JSX 类型定义：`JSX.Element`, `JSX.IntrinsicElements`
  - 节点树数据结构类型：`VNode`, `VNodeTree`
  - 预设 `tsconfig.json` 配置模板

---

### **Package 2: `@vanilla-dom/babel-plugin`**

_编译时 JSX 转换插件_

**职责**：将 JSX 语法编译为优化的节点树数据结构

**核心功能**：

- JSX 语法转换为纯数据的节点树
- 静态分析与编译时优化
- 支持指令式语法（如 `on:*` 等）
- 与 TypeScript 编译器集成

**转换示例**：

```jsx
// 源码
<div class="container" onClick={handler}>
  <span>{text}</span>
</div>

// 编译后
{
  type: "div",
  props: {
    class: "container",
    onClick: handler
  },
  children: [
    {
      type: "span",
      props: {},
      children: [{ type: "text", value: text }]
    }
  ]
}
```

---

### **Package 3: `@vanilla-dom/widget`**

_可选的组件化抽象层_

**职责**：提供组件编程范式（可选使用）

**核心功能**：

- `Widget` 抽象类
- 标准生命周期：`mount`, `update`, `unmount`
- 状态管理集成接口
- 团队开发规范约束

---

## **技术设计**

### **编译时策略**

- **静态模板提取**：识别静态 HTML 部分，生成可复用模板
- **动态插值标记**：标记需要运行时更新的节点位置
- **事件优化**：自动识别可委托的事件处理

### **运行时策略**

- **模板克隆**：复用静态模板，减少 DOM 创建开销
- **精确更新**：只更新变化的节点属性/内容
- **内存优化**：自动清理事件监听器和引用

### **TypeScript 集成**

- **零配置体验**：`.tsx` 文件无需手动导入即可使用 JSX
- **全局类型声明**：在 core 包中提供 JSX 命名空间
- **预设配置**：提供标准 `tsconfig.json` 和 Babel 配置
- **IDE 友好**：完整的类型提示和错误检查

### **开发工具链**

- **语言**：TypeScript
- **构建**：Rollup/Vite
- **测试**：Vitest + jsdom
- **基准测试**：与主流库性能对比

---

## **实施计划**

| 阶段            | 时间    | 目标                                   | 交付物                |
| --------------- | ------- | -------------------------------------- | --------------------- |
| P1 - 架构设计   | 第 1 周 | 确定编译转换规则与运行时 API           | API 文档、编译示例    |
| P2 - Babel插件  | 第 2 周 | 实现 JSX → 节点树编译转换              | `babel-plugin` 包     |
| P3 - 核心运行时 | 第 3 周 | 实现渲染引擎、DOM工具集、TS配置        | `core` 包             |
| P4 - 联调测试   | 第 4 周 | 集成测试，开发 Demo 应用验证完整工具链 | 工具链验证、Demo 应用 |
| P5 - 组件抽象   | 第 5 周 | 实现可选的组件化开发模式               | `widget` 包           |
| P6 - 性能优化   | 第 6 周 | 基准测试、性能优化、与主流库对比       | 性能报告、优化版本    |

---

## **预期效果**

### **性能优势**

- **编译时优化**：比纯运行时库更高效
- **轻量级体积**：核心运行时 < 10KB gzipped
- **高性能渲染**：接近手写 DOM 操作的性能
- **精确更新**：细粒度的 DOM 操作，减少不必要渲染

### **开发体验**

- **零配置启动**：`.tsx` 文件开箱即用
- **类型安全**：完整 TypeScript 支持
- **渐进式集成**：可与现有项目逐步集成
- **现代化工具链**：与主流开发工具良好集成

### **技术特色**

- **纯客户端专注**：无 SSR 包袱，专为浏览器优化
- **架构清晰**：编译时与运行时职责分离
- **扩展性强**：模块化设计，支持按需使用

---

## **参考资源**

- [SolidJS dom-expressions](https://github.com/ryansolid/dom-expressions)
- [babel-plugin-jsx-dom-expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/babel-plugin-jsx-dom-expressions)

---

_计划版本：v2.0 | 最后更新：2024_
