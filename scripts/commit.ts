#!/usr/bin/env tsx
/**
 * Commit workflow script
 *
 * Flow: format → lint → test → git add (interactive) → changeset → commit
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
 * 格式化代码
 */
async function formatCode(): Promise<boolean> {
  if (!runCommand('pnpm format', '格式化代码')) {
    return false;
  }
  return true;
}

/**
 * 创建 changeset
 */
async function createChangeset(): Promise<boolean> {
  if (!(await confirm('是否创建 changeset?', true))) {
    log('info', '跳过创建 changeset');
    return true;
  }

  return runCommand('pnpm changeset', '创建 changeset');
}

/**
 * 提交代码
 */
async function commitCode(): Promise<boolean> {
  // 检查是否有已暂存的文件
  try {
    const staged = execSync('git diff --cached --name-only', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
    }).trim();

    if (!staged) {
      log('warning', '没有已暂存的文件，无需提交');
      return true;
    }
  } catch {
    log('error', '检查暂存文件失败');
    return false;
  }

  if (!(await confirm('是否使用 commitizen 提交?', true))) {
    log('info', '跳过提交');
    return true;
  }

  return runCommand('git cz', '提交代码');
}

/**
 * 主流程
 */
async function main(): Promise<void> {
  log('title', '📝 提交流程');

  console.log('流程步骤:');
  console.log('  1. 格式化代码 (pnpm format)');
  console.log('  2. 代码检查 (pnpm lint)');
  console.log('  3. 运行测试 (pnpm test)');
  console.log('  4. 暂存文件 (git add - 交互式)');
  console.log('  5. 创建 changeset (pnpm changeset - 可选)');
  console.log('  6. 提交代码 (pnpm commit)');
  console.log();

  if (!(await confirm('确认开始提交流程?', true))) {
    log('info', '流程已取消');
    return;
  }

  // 1. 格式化代码
  if (!(await formatCode())) {
    process.exit(1);
  }

  console.log();

  // 2. 代码检查
  if (!runCommand('pnpm lint', '代码检查')) {
    process.exit(1);
  }

  console.log();

  // 3. 运行测试
  if (!runCommand('pnpm test', '运行测试')) {
    process.exit(1);
  }

  console.log();

  // 4. 交互式添加文件
  if (!(await interactiveGitAdd())) {
    process.exit(1);
  }

  console.log();

  // 5. 创建 changeset
  if (!(await createChangeset())) {
    process.exit(1);
  }

  // 5.1 自动 add .changeset 目录中的变动
  try {
    const changesetStatus = execSync('git status --porcelain .changeset', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
    }).trim();

    if (changesetStatus) {
      log('info', '添加 changeset 文件到暂存区...');
      execSync('git add .changeset', {
        cwd: resolve(__dirname, '..'),
      });
      log('success', 'Changeset 文件已添加');
    }
  } catch {
    // 如果没有 changeset 变动，忽略错误
  }

  console.log();

  // 6. 提交代码
  if (!(await commitCode())) {
    process.exit(1);
  }

  console.log();
  log('success', '✅ 提交流程完成！');
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
