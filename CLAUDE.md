# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fukict 是一个专注于性能场景的轻量级 DOM 渲染库 (< 10KB)，采用编译时优化策略，通过 JSX 编译期转换减少运行时开销。适用于数据可视化、游戏UI、大量DOM操作等性能敏感场景。

## Runtime Architecture

Fukict 采用 monorepo 架构，由以下核心包组成：

### `@fukict/runtime` (packages/runtime/)

- **职责**: 轻量级 VNode 到 DOM 渲染引擎
- **核心模块**:
  - `renderer.ts`: VNode 树到真实 DOM 的转换引擎，支持增量更新
  - `jsx-runtime.ts`: JSX 运行时支持
  - `dom-utils.ts`: 精确 DOM 操作工具集
  - `pattern-registry.ts`: 组件编码范式注册机制
- **关键特性**:
  - WeakMap 实现 VNode-DOM 双向映射，自动垃圾回收
  - 多入口导出 (renderer, jsx-runtime, dom-utils 等)
  - RefCallback 机制支持 DOM 引用

### `@fukict/babel-plugin` (packages/babel-plugin/)

- **职责**: JSX 编译时转换，将 JSX 语法转换为优化的 VNode 结构
- **输出**: ESM + CJS 双格式
- **配置**: 在 Vite/Webpack 中需要配置 `@babel/plugin-syntax-jsx` 和本插件

### `@fukict/widget` (packages/widget/)

- **职责**: 组件编码范式抽象层，提供类组件和函数组件支持
- **核心功能**:
  - `class-widget.ts`: 类组件基类 Widget<Props>
  - `functional-widget.ts`: createWidget<Props> 函数组件工厂
  - `scheduler.ts`: 渲染调度器配置
  - `pattern-handlers.ts`: 自动注册 Widget 编码范式到 runtime
- **依赖**: 依赖 `@fukict/runtime` 的 pattern-registry 机制

### `@fukict/babel-preset-widget` (packages/babel-preset-widget/)

- **职责**: Widget 零配置预设，简化 Babel 配置

## Common Commands

### 构建

```bash
# 构建所有包（推荐）
pnpm build                                    # 清理 + 提取 metadata + 构建包 + 构建 demos
pnpm build:pkg                                # 仅构建包

# 监听模式开发
pnpm build:pkg:watch                          # 监听所有包
tsx scripts/build-package.ts --pkg-name runtime --watch  # 监听单个包

# 仅构建特定包
tsx scripts/build-package.ts --pkg-name runtime widget --no-watch

# 提取包 metadata
pnpm extract-metadata                         # 提取 version + dependencies 到各包的 src/metadata.ts
```

### 测试

```bash
# 运行所有包测试
pnpm test

# 单包测试
cd packages/runtime && pnpm test
cd packages/widget && pnpm test:watch
```

### 代码质量

```bash
pnpm lint           # ESLint 检查
pnpm lint:fix       # 自动修复
pnpm format         # Prettier 格式化
```

### 发布

```bash
pnpm release        # 交互式发布工具（TypeScript 实现）
pnpm changeset      # 手动创建 changeset

# 或直接执行 TypeScript 脚本
npx tsx scripts/release.ts
```

### Demo 开发

```bash
cd demos/vite-demo && pnpm dev         # Vite 热重载
cd demos/webpack-demo && pnpm start    # Webpack 开发服务器
cd demos/rsbuild-demo && pnpm dev      # Rsbuild 快速构建
```

## Development Workflow

### 包开发标准流程

1. 确认工作目录：使用 `pwd` 确认在正确的包目录下 (packages/{name}/)
2. 修改源码：编辑 `src/` 下文件
3. 运行测试：`pnpm test` (使用 Vitest + jsdom 环境)
4. 构建：`tsx scripts/build-package.ts --pkg-name {name} --no-watch`
5. 在 demo 中验证：链接到 demos/ 项目测试

**注意**：构建前会自动提取 metadata.ts (version + dependencies)

### 添加新包

新包必须遵循以下结构：

```
packages/{name}/
├── src/index.ts        # 主导出入口
├── tests/*.test.ts     # Vitest 测试用例
├── package.json        # 必须包含正确的 exports 字段
└── vitest.config.ts    # 测试配置（可选）
```

**同时需要在 `tsdown.config.yml` 中添加包配置**：

```yaml
packages:
  { name }:
    platform: browser # 或 node
    entry: 'src/index.ts'
    format: esm # 或 ['esm', 'cjs']
    description: '包描述'
```

package.json 核心字段：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "name": "@fukict/{name}",
  "scripts": {
    "test": "vitest --run"
  },
  "type": "module",
  "types": "./dist/index.d.ts"
}
```

### 添加新 Demo

Demo 用于展示不同工具链集成，每个 demo 必须：

- 包含 Counter、Todo List、性能测试等通用功能
- 独立工作，不依赖其他 demo
- 正确配置 Babel 处理 JSX (使用 `@fukict/babel-plugin` 或 `@fukict/babel-preset-widget`)

## Critical Configuration Notes

### Vite 项目配置

**必须禁用 esbuild JSX 转换**，让 Babel 接管：

```js
// vite.config.js
export default defineConfig({
  esbuild: {
    jsx: 'preserve', // 关键：让 babel 处理
  },
  plugins: [
    {
      name: 'fukict-babel',
      async transform(code, id) {
        if (!/\.(tsx?|jsx?)$/.test(id)) return;
        if (!/<[A-Za-z]/.test(code)) return;

        const result = await babel.transformAsync(code, {
          plugins: ['@babel/plugin-syntax-jsx', '@fukict/babel-plugin'],
        });
        return result;
      },
    },
  ],
});
```

### Widget 使用注意事项

使用 `@fukict/widget` 时：

- 类组件：继承 `Widget<Props>` 并实现 `render()` 方法
- 函数组件：使用 `createWidget<Props>` 工厂函数
- Babel 配置：使用 `@fukict/babel-preset-widget` 简化配置
- Widget 自动注册到 runtime 的 pattern-registry，无需手动注册

## Performance Principles

- **编译时优化优先**：利用 Babel 插件在构建时优化 VNode 结构
- **精确 DOM 操作**：使用 dom-utils 提供的细粒度 API
- **自动内存管理**：WeakMap 确保 VNode-DOM 映射自动回收
- **Bundle 大小监控**：runtime 包必须保持 < 10KB 压缩后体积
- **Tree Shaking 支持**：所有包使用 ESM，sideEffects: false

## Release Process

使用 changesets 管理版本（TypeScript 交互式工具）：

1. **正式发布**: `pnpm release` → 选择 "1) 正式发布"

   - 流程：格式化 → lint → 测试 → 构建 → 版本更新 → 发布 npm → git 标签
   - 需要先创建 changeset

2. **预发布**: `pnpm release` → 选择 "2/3/4) Alpha/Beta/RC"

   - 无需 changeset，基于当前更改直接生成快照版本

3. **手动流程**:
   ```bash
   pnpm changeset              # 创建变更记录
   pnpm changeset:version      # 更新版本号
   pnpm build                  # 构建
   pnpm changeset:publish      # 发布
   ```

**发布工具功能**：

- 自动检查 git 状态和 npm 权限
- 交互式菜单选择发布类型
- 自动执行完整发布流程
- 支持创建和推送 git 标签

## Toolchain

- **包管理器**: pnpm (强制，engines 字段限定)
- **构建工具**: tsdown (统一构建，支持 watch 模式)
- **构建配置**: tsdown.config.yml (YAML 格式，易于扩展)
- **脚本执行**: tsx (TypeScript 脚本直接执行)
- **测试框架**: Vitest (jsdom 环境)
- **类型检查**: TypeScript 5.6+
- **代码规范**: ESLint 9 + Prettier
- **版本管理**: changesets

## Important Constraints

1. **目录路径**：编辑文件前必须 `pwd` 确认当前目录，避免在根目录编辑包文件
2. **包名验证**：构建脚本会自动验证包名，仅允许 runtime|widget|babel-plugin|babel-preset-widget
3. **依赖管理**：禁止使用 npm/yarn，必须使用 pnpm
4. **Node 版本**：>=16.0.0
5. **TypeScript 覆盖**：所有包必须 100% TypeScript 编写
6. **测试覆盖**：新功能必须包含测试用例
7. **Metadata 文件**：src/metadata.ts 由脚本自动生成，不要手动编辑

## Widget 组件编码范式

Widget 是 fukict 的可选组件抽象层，提供状态管理和生命周期：

```tsx
// 类组件
class Counter extends Widget<{ initialCount: number }> {
  render() {
    return <div>{this.props.initialCount}</div>;
  }
}

// 函数组件
const Counter = createWidget<{ initialCount: number }>(
  ({ initialCount }) => <div>{initialCount}</div>
);
```

关键机制：

- Widget 通过 `pattern-handlers.ts` 自动注册到 runtime 的 `pattern-registry`
- Runtime 的 `renderer.ts` 通过 `isRegisteredComponent` 和 `renderRegisteredComponent` 调用 Widget 渲染逻辑
- 这种设计实现了 runtime 和 widget 的解耦，runtime 仅提供注册机制，不依赖 widget 实现
