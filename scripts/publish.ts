#!/usr/bin/env tsx
/**
 * Publish workflow script
 *
 * Flow: npm whoami → changeset:version → sync:version → format → git add (interactive)
 *       → lint → test → build → git commit → tag → push → changeset:publish
 */
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { confirm, interactiveGitAdd, log } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 运行命令
 */
function runCommand(command: string, description: string): boolean {
  log('info', `${description}...`);
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
    });
    log('success', `${description} 完成`);
    return true;
  } catch {
    log('error', `${description} 失败`);
    return false;
  }
}

/**
 * 检查 npm 登录状态
 */
function checkNpmLogin(): boolean {
  log('info', '检查 npm 登录状态...');
  try {
    const user = execSync('npm whoami', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
    }).trim();
    log('success', `当前 npm 用户: ${user}`);
    return true;
  } catch {
    log('error', '未登录 npm，请先运行: npm login');
    return false;
  }
}

/**
 * 获取当前版本
 */
function getCurrentVersion(): string {
  try {
    const packageJson = execSync('cat package.json', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
    });
    const parsed = JSON.parse(packageJson) as { version: string };
    return parsed.version;
  } catch {
    return 'unknown';
  }
}

/**
 * 获取当前分支名
 */
function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * 主流程
 */
async function main(): Promise<void> {
  log('title', '🚀 发布流程');

  console.log('流程步骤:');
  console.log('  1. 检查 npm 登录状态 (npm whoami)');
  console.log('  2. 更新版本号 (pnpm changeset:version)');
  console.log('  3. 同步版本和提取 metadata (pnpm sync:version)');
  console.log('  4. 格式化代码 (pnpm format)');
  console.log('  5. 暂存文件 (git add - 交互式)');
  console.log('  6. 代码检查 (pnpm lint)');
  console.log('  7. 运行测试 (pnpm test)');
  console.log('  8. 构建项目 (pnpm build)');
  console.log('  9. 提交代码 (git commit -m "chore: release <version>")');
  console.log('  10. 创建和推送 tags (pnpm tag)');
  console.log('  11. 推送分支到远程 (git push)');
  console.log('  12. 发布到 npm (pnpm changeset:publish)');
  console.log();

  if (!(await confirm('确认开始发布流程?', false))) {
    log('info', '流程已取消');
    return;
  }

  // 1. 检查 npm 登录状态
  if (!checkNpmLogin()) {
    process.exit(1);
  }

  console.log();

  // 2. 更新版本号 (changeset:version)
  log('info', '开始更新版本号...');
  if (!runCommand('pnpm changeset:version', '更新版本号')) {
    process.exit(1);
  }

  console.log();

  // 3. 同步版本和提取 metadata
  if (!runCommand('pnpm sync:version', '同步版本和提取 metadata')) {
    process.exit(1);
  }

  const version = getCurrentVersion();
  log('info', `当前版本: ${version}`);

  console.log();

  // 4. 格式化代码
  if (!runCommand('pnpm format', '格式化代码')) {
    process.exit(1);
  }

  console.log();

  // 5. 交互式暂存文件（在 format 之后）
  if (!(await interactiveGitAdd())) {
    process.exit(1);
  }

  console.log();

  // 6. 代码检查
  if (!runCommand('pnpm lint', '代码检查')) {
    process.exit(1);
  }

  console.log();

  // 7. 运行测试
  if (!runCommand('pnpm test', '运行测试')) {
    process.exit(1);
  }

  console.log();

  // 8. 构建项目
  if (!runCommand('pnpm build', '构建项目')) {
    process.exit(1);
  }

  console.log();

  // 9. 提交代码
  const commitMessage = `chore: release ${version}`;
  if (!runCommand(`git commit -m "${commitMessage}"`, '提交代码')) {
    log('warning', '提交失败（可能没有需要提交的内容）');
  }

  console.log();

  // 10. 创建和推送 tags（tag.ts 内部会推送到远程）
  if (!runCommand('pnpm tag', '创建和推送 tags')) {
    log('warning', 'Tag 创建失败，但继续执行');
  }

  console.log();

  // 11. 推送分支到远程
  const branch = getCurrentBranch();
  if (await confirm(`推送分支 ${branch} 到远程?`, true)) {
    if (!runCommand('git push', '推送分支到远程')) {
      log('error', '推送失败');
      process.exit(1);
    }
  } else {
    log('warning', '跳过推送分支，请手动推送');
  }

  console.log();

  // 12. 发布到 npm
  if (await confirm('发布到 npm?', true)) {
    if (!runCommand('pnpm changeset:publish', '发布到 npm')) {
      log('error', '发布失败');
      process.exit(1);
    }
  } else {
    log('warning', '跳过发布到 npm');
  }

  console.log();
  log('success', `✅ 发布流程完成！版本: ${version}`);
  log('info', '后续步骤:');
  log('info', '  - 检查 npm 包是否发布成功');
  log('info', '  - 确认 GitHub tags 是否推送成功');
  log('info', '  - 如有需要，发布 GitHub Release');
}

// 错误处理
process.on('SIGINT', () => {
  log('info', '\n流程已中断');
  process.exit(0);
});

// 启动
main().catch((error: unknown) => {
  const errorMessage =
    error instanceof Error ? error.message : String(error || 'Unknown error');
  log('error', `流程失败: ${errorMessage}`);
  process.exit(1);
});
