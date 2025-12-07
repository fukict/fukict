# 贡献指南

本指南描述 Fukict 项目的提交和发布流程。

## 提交流程

日常开发中提交代码的流程。

### 自动化流程（推荐）

```bash
pnpm commit
```

该命令会自动执行以下步骤：

1. 格式化代码 (`pnpm format`)
2. 代码检查 (`pnpm lint`)
3. 运行测试 (`pnpm test`)
4. 交互式暂存文件 (`git add` - 多选交互)
5. 创建 changeset (`pnpm changeset` - 可选，有交互)
6. 提交代码 (`pnpm commit` - commitizen 交互)

### 手动流程

```bash
# 1. 格式化代码
pnpm format

# 2. 代码检查
pnpm lint

# 3. 运行测试
pnpm test

# 4. 暂存文件（如有格式化变动）
git add <files>

# 5. 创建 changeset（描述本次变更）
pnpm changeset

# 6. 提交代码
pnpm commit
```

## 发布流程

将新版本发布到 npm 的完整流程。

### 自动化流程（推荐）

```bash
pnpm publish
```

该命令会自动执行以下步骤：

1. 检查 npm 登录状态 (`npm whoami`)
2. 更新版本号 (`pnpm changeset:version` - 有交互)
3. 同步版本和提取 metadata (`pnpm sync:version`)
4. 格式化代码 (`pnpm format`)
5. 暂存文件 (`git add` - 交互式)
6. 代码检查 (`pnpm lint`)
7. 运行测试 (`pnpm test`)
8. 构建项目 (`pnpm build`)
9. 提交代码 (`git commit -m "chore: release <version>"`)
10. 创建和推送 tags (`pnpm tag`)
11. 推送分支到远程 (`git push`)
12. 发布到 npm (`pnpm changeset:publish`)

### 手动流程

```bash
# 1. 检查 npm 登录状态
npm whoami
# 如未登录：npm login

# 2. 更新版本号
pnpm changeset:version

# 3. 同步版本和提取 metadata
pnpm sync:version

# 4. 格式化代码
pnpm format

# 5. 暂存文件（交互式）
git add <files>

# 6. 代码检查
pnpm lint

# 7. 运行测试
pnpm test

# 8. 构建项目
pnpm build

# 9. 提交代码
git commit -m "chore: release <version>"

# 10. 创建和推送 tags
pnpm tag

# 11. 推送分支到远程
git push

# 12. 发布到 npm
pnpm changeset:publish
```

## 不同类型版本发布

### 版本类型对比

| 版本类型   | 命令                 | 用途                     | 需要 changeset | 版本示例                     | 安装命令                          |
| ---------- | -------------------- | ------------------------ | -------------- | ---------------------------- | --------------------------------- |
| **正式版** | `pnpm publish`       | 生产环境稳定版本         | ✅ 需要        | `1.0.0`                      | `npm install @fukict/basic`       |
| **Alpha**  | `pnpm version:alpha` | 开发测试版，功能不完整   | ❌ 不需要      | `1.0.0-alpha-20250101120000` | `npm install @fukict/basic@alpha` |
| **Beta**   | `pnpm version:beta`  | 公开测试版，功能基本完整 | ❌ 不需要      | `1.0.0-beta-20250101120000`  | `npm install @fukict/basic@beta`  |
| **RC**     | `pnpm version:rc`    | 发布候选版，准备正式发布 | ❌ 不需要      | `1.0.0-rc-20250101120000`    | `npm install @fukict/basic@rc`    |

### 正式版本发布

```bash
# 1. 创建 changeset（选择版本类型）
pnpm changeset
# 选择：
# - patch: 1.0.0 → 1.0.1 (bug 修复)
# - minor: 1.0.0 → 1.1.0 (新功能，向后兼容)
# - major: 1.0.0 → 2.0.0 (破坏性变更)

# 2. 执行发布流程
pnpm publish
```

### 预发布版本

预发布版本无需创建 changeset，直接基于当前更改生成快照版本并发布：

```bash
# Alpha 版本
pnpm version:alpha

# Beta 版本
pnpm version:beta

# RC 版本
pnpm version:rc
```

## 语义化版本说明

Fukict 遵循[语义化版本](https://semver.org/lang/zh-CN/)规范：

- **MAJOR（主版本号）**: 不兼容的 API 变更
- **MINOR（次版本号）**: 向下兼容的功能新增
- **PATCH（修订号）**: 向下兼容的问题修正

## 常见操作

### 查看发布状态

```bash
pnpm changeset status
```

### 查看所有 tags

```bash
git tag
```

### 删除 tag

```bash
# 删除本地 tag
git tag -d fukict@1.0.0

# 删除远程 tag
git push origin --delete fukict@1.0.0
```

### 检查 npm 发布权限

```bash
# 查看当前登录用户
npm whoami

# 查看包的访问权限
npm access list packages @fukict
```

## 注意事项

1. **提交前必须格式化**：确保代码符合项目规范
2. **正式版本需要 changeset**：用于生成 CHANGELOG
3. **预发布版本无需 changeset**：直接基于当前更改生成快照版本
4. **版本同步**：`sync:version` 会将 `@fukict/basic` 的版本同步到根目录 `package.json`
5. **Tag 命名**：使用 `fukict@<version>` 格式（例如 `fukict@1.0.0`）
6. **发布前检查**：lint、test、build 都必须通过才能发布
7. **npm 权限**：确保有 `@fukict` 组织的发布权限

## 脚本命令说明

| 命令                     | 说明                                         |
| ------------------------ | -------------------------------------------- |
| `pnpm commit`            | 提交流程（格式化 → 暂存 → changeset → 提交） |
| `pnpm publish`           | 发布流程（完整的发布步骤）                   |
| `pnpm tag`               | 创建和推送 git tag                           |
| `pnpm sync:version`      | 同步版本号和提取 metadata                    |
| `pnpm changeset`         | 创建变更记录                                 |
| `pnpm changeset:version` | 更新版本号                                   |
| `pnpm changeset:publish` | 发布到 npm                                   |
| `pnpm version:alpha`     | 发布 alpha 版本                              |
| `pnpm version:beta`      | 发布 beta 版本                               |
| `pnpm version:rc`        | 发布 rc 版本                                 |
| `pnpm format`            | 格式化代码                                   |
| `pnpm lint`              | 代码检查                                     |
| `pnpm test`              | 运行测试                                     |
| `pnpm build`             | 构建项目                                     |
