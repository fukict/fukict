# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 重要：项目正在重构中

当前项目正在进行架构重构，所有旧代码已移至 `old/` 目录。

**重构状态**：设计阶段
**当前任务**：参考 `REFACTOR_TODO.md`

## 开发工作流规范

### 强制规则

1. **任务完成后必须更新 TODO**
   - 每完成 `REFACTOR_TODO.md` 中的一个任务，立即标记为已完成
   - 如果任务拆分或变更，必须更新 TODO 文档

2. **功能边界变更必须更新文档**
   - 包职责变更 → 更新对应包的 `DESIGN.md`
   - API 变更 → 更新对应包的 `API.md`
   - 架构变更 → 更新根目录 `docs/` 下的架构文档

3. **设计决策必须记录**
   - 所有重要设计决策必须在 `DESIGN.md` 中记录
   - 包含：决策背景、考虑的方案、最终选择、理由

4. **设计文档专注设计，不涉及代码**
   - `DESIGN.md` 只描述设计思路、架构、机制
   - 不要包含代码实现细节
   - 代码示例放在 `EXAMPLES.md`

## 项目架构（重构后）

### 核心包

**@fukict/runtime** - 轻量级 DOM 渲染引擎
- **职责**：VNode 到 DOM 的转换和基础渲染
- **核心特性**：
  - VNode 创建（hyperscript / JSX runtime）
  - DOM 创建和挂载
  - **注册机制**（核心中的核心）：开放钩子让其他包扩展渲染能力
  - 基础 DOM 操作工具
- **不包含**：状态管理、生命周期、组件抽象
- **大小目标**：< 5KB gzipped

**@fukict/widget** - 组件抽象层
- **职责**：提供组件编程范式
- **核心特性**：
  - Widget 类组件（生命周期、状态、refs、slots）
  - defineWidget 函数组件
  - 通过 runtime 注册机制扩展渲染能力
  - 组件挂载/卸载/更新管理
  - 数组节点渲染
  - 脱围渲染（fukict:detach）
- **依赖**：@fukict/runtime（peer）
- **大小目标**：< 8KB gzipped

**@fukict/scheduler** - 调度器（从 widget 剥离）
- **职责**：渲染任务调度
- **核心特性**：
  - 优先级队列
  - requestIdleCallback / requestAnimationFrame
  - 任务取消
- **依赖**：无（可选集成 widget）
- **大小目标**：< 2KB gzipped

**@fukict/babel-plugin** - JSX 编译优化
- **职责**：JSX 语法转换
- **核心特性**：
  - 事件分离（on: 前缀）
  - 静态优化
  - 组件类型识别

**@fukict/babel-preset-widget** - 零配置预设
- **职责**：简化 Babel 配置
- **包含**：@babel/plugin-syntax-jsx + @fukict/babel-plugin

**@fukict/router** - 路由管理
- **职责**：单页应用路由
- **依赖**：@fukict/widget（peer）

**@fukict/flux** - 状态管理（重命名自 state）
- **职责**：应用级状态管理
- **依赖**：@fukict/widget（可选）

### 预留包

**@fukict/create** - 脚手架工具（未实现）
**@fukict/devtools** - 开发者工具（未实现）

### 包依赖关系

```
@fukict/runtime (核心，无依赖)
    ↑ dependencies
@fukict/widget (用户安装这个)
    ↑ peerDependencies
@fukict/router
@fukict/flux (可选依赖 widget)

@fukict/scheduler (独立)

@fukict/babel-plugin (独立)
    ↑
@fukict/babel-preset-widget
```

### 用户使用方式

**安装**：
```bash
# 最小安装（runtime 自动安装）
pnpm add @fukict/widget

# 完整功能
pnpm add @fukict/widget @fukict/scheduler @fukict/router @fukict/flux

# 开发工具
pnpm add -D @fukict/babel-preset-widget
```

**引用**：
```typescript
// ✅ 推荐：仅从 widget 引用
import { Widget, render, h } from '@fukict/widget'

// ❌ 不推荐：直接引用 runtime
// import { render } from '@fukict/runtime'
```

## 文档管理结构

### 根目录文档 `docs/`
- `ARCHITECTURE.md` - 整体架构设计
- `GETTING_STARTED.md` - 快速开始
- `CORE_CONCEPTS.md` - 核心概念
- `API_INDEX.md` - API 索引

### 包级别文档 `packages/*/docs/`
- `DESIGN.md` - 设计文档（专注设计思路，不含代码）
- `API.md` - API 文档
- `EXAMPLES.md` - 使用示例
- `CHANGELOG.md` - 变更日志

## 重构关键设计问题

### 1. runtime 注册机制（最核心）

需要思考：
- 如何设计通用的钩子注册接口？
- 如何保证钩子执行顺序？
- 如何处理钩子返回值？
- 如何支持异步钩子？
- 如何避免钩子冲突？

### 2. widget 扩展机制

需要思考：
- 如何通过注册机制完全控制组件渲染？
- 如何实现组件实例的生命周期管理？
- 如何实现 refs 自动注册和清理？
- 如何实现 slots 的高效提取和渲染？
- 如何实现脱围渲染？

### 3. 数组节点渲染

需要思考：
- 如何注册数组节点的渲染逻辑？
- 是否需要 key 优化？如何设计？
- 如何与 widget 的 diff 机制配合？

### 4. 包导出策略

需要思考：
- runtime 应该导出哪些 API？
- widget 应该重新导出哪些 runtime API？
- 如何防止用户直接使用 runtime？
- 如何保持类型完整性？

## Common Commands

### 重构阶段

```bash
# 查看重构任务
cat REFACTOR_TODO.md

# 当前不可用（等待重构完成）
# pnpm build
# pnpm test
```

## 重要约束

1. **当前处于设计阶段**：先完成所有设计文档，再开始实现
2. **设计优先于实现**：不要急于编码，先把设计打磨好
3. **注册机制是核心**：花最多时间设计 runtime 的注册机制
4. **文档驱动开发**：每个包先写 DESIGN.md，再写代码
5. **逐个攻破**：按 REFACTOR_TODO.md 的顺序，逐个完成任务

## Absolute Rules for Claude Code

**CRITICAL: 重构期间必须遵守的规则**

1. **禁止直接编写实现代码**：
   - 当前阶段只做设计，不写实现
   - 先完成 REFACTOR_TODO.md 阶段一、二、三的所有任务
   - 只有设计评审通过后，才能进入阶段五（实施）

2. **每完成一个任务必须更新 TODO**：
   - 完成任务后立即在 REFACTOR_TODO.md 标记为已完成
   - 格式：`- [x] 任务描述`

3. **设计文档不要包含代码**：
   - DESIGN.md 专注于设计思路、架构、机制
   - 不要写实现代码，不要写代码示例
   - 代码示例放在 EXAMPLES.md

4. **功能边界变更必须同步文档**：
   - 包职责变更 → 更新 DESIGN.md
   - API 变更 → 更新 API.md
   - 架构变更 → 更新 docs/ARCHITECTURE.md

5. **重点关注注册机制**：
   - runtime 的注册机制是整个框架的核心
   - 必须反复推敲，确保设计足够灵活和强大
   - 设计时考虑：组件渲染、生命周期、数组节点、脱围渲染等扩展点

6. **设计决策必须有理由**：
   - 每个设计决策必须在文档中说明理由
   - 包含：问题背景、考虑的方案、最终选择、选择理由

## 参考资料

- 旧实现代码：`old/packages/` 目录
- 旧文档：`old/docs/` 目录
- 架构分析：参考之前的问题分析（已记录在聊天历史中）

---

**当前状态**：🟡 设计阶段
**下一步**：完成 REFACTOR_TODO.md 的阶段一任务
