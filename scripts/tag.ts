#!/usr/bin/env tsx
/**
 * Fukict Tag Tool
 *
 * 为项目创建和推送 git tag
 * Tag 格式: fukict@<version> (从根目录 package.json 读取版本号)
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { confirm, log } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查 git 状态
 */
function checkGitStatus(): boolean {
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf-8',
    }).trim();

    if (status) {
      log('warning', '检测到未提交的更改:');
      console.log(status);
      return false;
    }
    return true;
  } catch {
    log('error', 'Git 状态检查失败');
    return false;
  }
}

/**
 * 检查是否在 git 仓库中
 */
function checkGitRepo(): boolean {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    log('error', '当前目录不是 git 仓库');
    return false;
  }
}

/**
 * 获取项目版本
 */
function getProjectVersion(): string | null {
  const packageJsonPath = resolve(__dirname, '..', 'package.json');

  if (!existsSync(packageJsonPath)) {
    log('error', 'package.json 不存在');
    return null;
  }

  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content) as {
      name: string;
      version: string;
    };

    return packageJson.version;
  } catch {
    log('error', '无法读取 package.json');
    return null;
  }
}

/**
 * 检查 tag 是否存在
 */
function tagExists(tagName: string): boolean {
  try {
    const result = execSync(`git tag -l "${tagName}"`, {
      encoding: 'utf-8',
    }).trim();
    return result === tagName;
  } catch {
    return false;
  }
}

/**
 * 创建 git tag
 */
function createTag(tagName: string): boolean {
  try {
    execSync(`git tag "${tagName}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 推送指定 tag 到远程
 */
function pushTag(tagName: string): boolean {
  try {
    execSync(`git push origin "${tagName}"`, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// 主要功能
// ============================================================================

/**
 * 主函数
 */
async function main(): Promise<void> {
  log('title', '🏷️  Fukict Tag 工具');

  // 检查是否在 git 仓库中
  if (!checkGitRepo()) {
    process.exit(1);
  }

  // 检查是否在正确的目录
  const rootDir = resolve(__dirname, '..');
  const packageJsonPath = resolve(rootDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    log('error', '请在项目根目录运行此脚本');
    process.exit(1);
  }

  // 获取项目版本
  const version = getProjectVersion();

  if (!version) {
    process.exit(1);
  }

  const tagName = `fukict@${version}`;

  log('info', `项目版本: ${version}`);
  log('info', `Tag 名称: ${tagName}`);
  console.log();

  // 检查 tag 是否已存在
  if (tagExists(tagName)) {
    log('warning', `Tag 已存在: ${tagName}`);

    if (!(await confirm('是否删除已存在的 tag 并重新创建?', false))) {
      log('info', '操作已取消');
      process.exit(0);
    }

    // 删除本地 tag
    try {
      execSync(`git tag -d "${tagName}"`, { stdio: 'ignore' });
      log('success', `删除本地 tag: ${tagName}`);
    } catch {
      log('error', '删除本地 tag 失败');
      process.exit(1);
    }

    // 删除远程 tag
    if (await confirm('是否同时删除远程 tag?', true)) {
      try {
        execSync(`git push origin --delete "${tagName}"`, { stdio: 'inherit' });
        log('success', `删除远程 tag: ${tagName}`);
      } catch {
        log('warning', '删除远程 tag 失败（可能不存在）');
      }
    }

    console.log();
  }

  // 检查 git 状态
  if (!checkGitStatus()) {
    log('warning', '工作区有未提交的更改');

    if (!(await confirm('是否继续创建 tag?', false))) {
      log('info', '操作已取消');
      process.exit(0);
    }
  }

  // 确认创建 tag
  if (!(await confirm(`创建 tag ${tagName}?`, true))) {
    log('info', '操作已取消');
    process.exit(0);
  }

  // 创建 tag
  if (createTag(tagName)) {
    log('success', `创建 tag: ${tagName}`);
  } else {
    log('error', 'Tag 创建失败');
    process.exit(1);
  }

  console.log();

  // 推送 tag
  if (await confirm('推送 tag 到远程仓库?', true)) {
    log('info', '推送 tag 到远程...');

    if (pushTag(tagName)) {
      log('success', '✅ Tag 推送成功！');
    } else {
      log('error', 'Tag 推送失败');
      log('info', `可以稍后手动推送: git push origin ${tagName}`);
      process.exit(1);
    }
  } else {
    log('info', 'Tag 已创建但未推送到远程');
    log('info', `可以稍后手动推送: git push origin ${tagName}`);
  }

  console.log();
  log('success', '🎉 完成！');
}

// 错误处理
process.on('SIGINT', () => {
  log('info', '\n操作已中断');
  process.exit(0);
});

// 启动
main().catch((error: unknown) => {
  const errorMessage =
    error instanceof Error ? error.message : String(error || 'Unknown error');
  log('error', `操作失败: ${errorMessage}`);
  process.exit(1);
});
