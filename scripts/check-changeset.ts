/**
 * 检查 changeset 文件
 *
 * 确保每次提交都有且仅有一个新增的 changeset 文件
 */
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { log } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

/**
 * 获取暂存区中新增的 changeset 文件
 */
function getStagedChangesetFiles(): string[] {
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
 * 主函数
 */
function main(): void {
  log('info', '检查 changeset 文件...');

  const stagedChangesets = getStagedChangesetFiles();

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

main();
