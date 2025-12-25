/**
 * 检查 changeset 文件
 *
 * 两种模式：
 * 1. pre-commit 模式（无参数）：
 *    - 如果暂存区有删除的 changeset 文件（发布提交），跳过检查
 *    - 否则确保每次提交都有且仅有一个新增的 changeset 文件
 * 2. commit-msg 模式（传入 commit message 文件路径）：
 *    - 如果 commit message 以 "chore: release" 开头，检查 .changeset 目录下是否还有残留的 changeset 文件
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { log } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

/**
 * 获取暂存区中新增的 changeset 文件
 */
function getStagedAddedChangesetFiles(): string[] {
  try {
    // 获取暂存区中新增的文件 (A = Added)
    const output = execSync('git diff --cached --name-only --diff-filter=A', {
      encoding: 'utf-8',
      cwd: rootDir,
    });

    return output
      .split('\n')
      .filter(line => line.trim())
      .filter(file => {
        // 匹配 .changeset/*.md 但排除 README.md
        return (
          file.startsWith('.changeset/') &&
          file.endsWith('.md') &&
          !file.endsWith('README.md')
        );
      });
  } catch {
    return [];
  }
}

/**
 * 获取暂存区中删除的 changeset 文件
 */
function getStagedDeletedChangesetFiles(): string[] {
  try {
    // 获取暂存区中删除的文件 (D = Deleted)
    const output = execSync('git diff --cached --name-only --diff-filter=D', {
      encoding: 'utf-8',
      cwd: rootDir,
    });

    return output
      .split('\n')
      .filter(line => line.trim())
      .filter(file => {
        // 匹配 .changeset/*.md 但排除 README.md
        return (
          file.startsWith('.changeset/') &&
          file.endsWith('.md') &&
          !file.endsWith('README.md')
        );
      });
  } catch {
    return [];
  }
}

/**
 * 获取 .changeset 目录下的所有 changeset 文件（排除 README.md）
 */
function getExistingChangesetFiles(): string[] {
  const changesetDir = resolve(rootDir, '.changeset');

  if (!existsSync(changesetDir)) {
    return [];
  }

  return readdirSync(changesetDir).filter(file => {
    return file.endsWith('.md') && file !== 'README.md';
  });
}

/**
 * pre-commit 模式：检查新增的 changeset 文件
 */
function checkPreCommit(): void {
  // 检查是否有删除的 changeset 文件（发布提交）
  const deletedChangesets = getStagedDeletedChangesetFiles();
  if (deletedChangesets.length > 0) {
    log(
      'info',
      '检测到发布提交（有删除的 changeset 文件），跳过 changeset 检查',
    );
    return;
  }

  log('info', '检查 changeset 文件...');

  const stagedChangesets = getStagedAddedChangesetFiles();

  if (stagedChangesets.length === 0) {
    log('error', '没有检测到新增的 changeset 文件');
    log('info', '请先运行 pnpm changeset 创建变更记录');
    process.exit(1);
  }

  if (stagedChangesets.length > 1) {
    log(
      'error',
      `检测到 ${stagedChangesets.length} 个新增的 changeset 文件，但只允许 1 个`,
    );
    log('info', '新增的文件:');
    stagedChangesets.forEach(file => {
      log('info', `  - ${file}`);
    });
    log('info', '请确保每次提交只包含一个 changeset 文件');
    process.exit(1);
  }

  log('success', `检测到 changeset 文件: ${stagedChangesets[0]}`);
}

/**
 * commit-msg 模式：检查发布提交时是否有残留的 changeset 文件
 */
function checkCommitMsg(commitMsgFile: string): void {
  // 读取 commit message
  const commitMsg = readFileSync(commitMsgFile, 'utf-8').trim();

  // 如果不是发布提交，跳过检查
  if (!commitMsg.startsWith('chore: release')) {
    return;
  }

  log('info', '检测到发布提交，检查 changeset 残留文件...');

  const existingChangesets = getExistingChangesetFiles();

  if (existingChangesets.length > 0) {
    log('error', `发布提交时 .changeset 目录下不应该有残留的 changeset 文件`);
    log('info', '残留的文件:');
    existingChangesets.forEach(file => {
      log('info', `  - .changeset/${file}`);
    });
    log('info', '请先运行 pnpm changeset:version 消费这些 changeset 文件');
    process.exit(1);
  }

  log('success', '发布提交检查通过，无残留 changeset 文件');
}

/**
 * 主函数
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0]) {
    // commit-msg 模式：传入 commit message 文件路径
    checkCommitMsg(args[0]);
  } else {
    // pre-commit 模式
    checkPreCommit();
  }
}

main();
