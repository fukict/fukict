# 发版指南

## 快速发版

```bash
# 一键发版（推荐）
pnpm release

# 或使用别名
pnpm publish
```

## 发版类型

### 🎯 正式发版

用于生产环境的稳定版本发布

```bash
pnpm release  # 选择 1) 正式发布
```

**流程**：格式化 → lint → 测试 → 构建 → 版本更新 → 发布 npm → git 标签

### 🧪 预发布版本

用于测试的版本发布

```bash
pnpm release  # 选择 2/3/4
```

- **Alpha**: 开发测试版，功能不完整
- **Beta**: 公开测试版，功能基本完整
- **RC**: 发布候选版，准备正式发布

**流程**：格式化 → lint → 测试 → 构建 → 生成快照版本 → 直接发布

## 手动操作

### 创建变更记录

```bash
pnpm changeset
```

选择要更新的包和版本类型（patch/minor/major），添加变更描述

### 查看发布状态

```bash
pnpm changeset status
```

### 手动发布流程

```bash
# 1. 创建 changeset
pnpm changeset

# 2. 更新版本
pnpm changeset:version

# 3. 构建并发布
pnpm build
pnpm changeset:publish
```

## 版本说明

- **patch** (1.0.0 → 1.0.1): bug 修复
- **minor** (1.0.0 → 1.1.0): 新功能，向后兼容
- **major** (1.0.0 → 2.0.0): 破坏性变更

## 常见问题

### npm 权限错误

```bash
# 检查登录状态
npm whoami

# 登录 npm
npm login

# 检查组织权限
pnpm release  # 选择 7) 检查权限
```

### 组织不存在

如遇到 `@fukict` 组织不存在错误：

1. 在 [npm](https://www.npmjs.com/org/create) 创建组织
2. 或修改包名去掉 `@fukict/` 前缀

### 未提交的更改

发布前请先提交所有代码更改：

```bash
git add .
git commit -m "feat: 新功能描述"
```

## 注意事项

- 正式发版需要先创建 changeset
- 预发布版本无需 changeset，基于当前更改直接生成
- 所有发版都会自动执行测试和构建
- 发版后会自动创建 git 标签
