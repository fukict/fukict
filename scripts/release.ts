#!/usr/bin/env tsx
/**
 * Fukict Release Tool
 *
 * 交互式发布工具，支持正式发布和预发布版本
 */
import { exec, execSync, spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// 颜色输出
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(
  level: 'info' | 'success' | 'warning' | 'error' | 'title',
  message: string,
): void {
  const symbols = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    title: '',
  };

  if (level === 'title') {
    console.log(
      '\n' + `${colors.bold}${colors.cyan}${message}${colors.reset}` + '\n',
    );
  } else {
    console.log(`${symbols[level]} ${message}`);
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 执行命令并返回结果
 */
async function runCommand(
  command: string,
  description: string,
): Promise<boolean> {
  log('info', `${description}...`);

  try {
    await execAsync(command);
    log('success', `${description} 完成`);
    return true;
  } catch (error) {
    log('error', `${description} 失败`);
    if (error instanceof Error && 'stdout' in error) {
      console.error((error as any).stdout);
      console.error((error as any).stderr);
    }
    return false;
  }
}

/**
 * 执行命令（使用 spawn，支持实时输出）
 */
function runCommandLive(command: string, args: string[]): Promise<boolean> {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', code => {
      resolve(code === 0);
    });
  });
}

/**
 * 确认提示
 */
async function confirm(
  message: string,
  defaultValue: boolean = false,
): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    const prompt = defaultValue ? `${message} [Y/n]: ` : `${message} [y/N]: `;

    rl.question(prompt, answer => {
      rl.close();
      const normalized = answer.toLowerCase().trim();

      if (!normalized) {
        resolve(defaultValue);
      } else {
        resolve(normalized === 'y' || normalized === 'yes');
      }
    });
  });
}

/**
 * 单选菜单
 */
async function selectOption(): Promise<number> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question('请选择 (0-7): ', answer => {
      rl.close();
      const choice = parseInt(answer, 10);
      resolve(choice);
    });
  });
}

/**
 * 检查 git 状态
 */
async function checkGitStatus(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('git status --porcelain');

    if (stdout.trim()) {
      log('warning', '检测到未提交的更改:');
      console.log(stdout);
      return false;
    }
    return true;
  } catch {
    log('error', 'Git 状态检查失败');
    return false;
  }
}

/**
 * 检查 npm 发布权限
 */
async function checkNpmAccess(): Promise<boolean> {
  log('info', '检查 npm 发布权限...');

  // 检查是否登录
  try {
    const { stdout } = await execAsync('npm whoami');
    const npmUser = stdout.trim();
    log('success', `当前 npm 用户: ${npmUser}`);
  } catch {
    log('error', '未登录 npm，请先运行: npm login');
    return false;
  }

  // 检查组织权限
  log('info', '检查 @fukict 组织权限...');
  try {
    await execAsync('npm access list packages @fukict');
    log('success', '@fukict 组织存在且有访问权限');
    return true;
  } catch {
    log('error', '@fukict 组织不存在或无访问权限');
    console.log('\n解决方案:');
    console.log('1. 在 npm 上创建 @fukict 组织:');
    console.log('   https://www.npmjs.com/org/create');
    console.log('');
    console.log('2. 或者修改包名，不使用 scoped package');
    console.log('3. 或者联系 @fukict 组织管理员添加发布权限\n');
    return false;
  }
}

/**
 * 创建并推送 git 标签
 */
async function createAndPushTags(): Promise<boolean> {
  log('info', '创建 git 标签...');

  const packagesDir = resolve(__dirname, '..', 'packages');
  const packages = readdirSync(packagesDir);

  for (const pkg of packages) {
    const packageJsonPath = resolve(packagesDir, pkg, 'package.json');
    if (!existsSync(packageJsonPath)) continue;

    try {
      const packageJson = JSON.parse(
        require('fs').readFileSync(packageJsonPath, 'utf-8'),
      );
      const tagName = `${packageJson.name}@${packageJson.version}`;

      // 检查标签是否已存在
      try {
        execSync(`git tag -l "${tagName}"`, { stdio: 'pipe' });
        const exists = execSync(`git tag -l "${tagName}"`).toString().trim();
        if (exists) {
          log('warning', `标签 ${tagName} 已存在，跳过`);
          continue;
        }
      } catch {
        // 标签不存在，继续创建
      }

      execSync(`git tag "${tagName}"`);
      log('success', `创建标签: ${tagName}`);
    } catch {
      log('error', `创建标签失败: ${pkg}`);
      return false;
    }
  }

  // 推送标签
  if (await confirm('是否推送标签到远程仓库?', true)) {
    return await runCommand('git push --tags', '推送标签到远程仓库');
  } else {
    log('info', '标签已创建但未推送到远程仓库');
    log('info', "可以稍后使用 'git push --tags' 手动推送");
  }

  return true;
}

// ============================================================================
// 发布流程
// ============================================================================

/**
 * 正式发布
 */
async function handleProductionRelease(): Promise<void> {
  log('title', '🎯 正式发布流程');

  console.log('正式发布流程将执行以下步骤:');
  console.log('  1. 检查是否有 changeset 文件');
  console.log('  2. 代码格式化和 lint 检查');
  console.log('  3. 运行测试');
  console.log('  4. 构建所有包');
  console.log('  5. 更新版本号并生成 changelog');
  console.log('  6. 提交版本更改到 git');
  console.log('  7. 发布到 npm');
  console.log('  8. 创建并推送 git 标签\n');

  if (!(await confirm('确认开始正式发布?', false))) {
    log('info', '发布已取消');
    return;
  }

  // 检查 git 状态
  if (!(await checkGitStatus())) {
    if (!(await confirm('工作区有未提交的更改，是否继续?', false))) {
      log('info', '发布已取消');
      return;
    }
  }

  // 检查 npm 权限
  if (!(await checkNpmAccess())) {
    log('error', 'npm 发布权限检查失败');
    return;
  }

  // 检查 changeset
  const changesetDir = resolve(__dirname, '..', '.changeset');
  const changesetFiles = readdirSync(changesetDir).filter(
    f => f.endsWith('.md') && f !== 'README.md',
  );

  if (changesetFiles.length === 0) {
    log('warning', '没有找到 changeset 文件');
    if (await confirm('是否先创建 changeset?', true)) {
      if (!(await runCommandLive('pnpm', ['changeset']))) {
        log('error', '创建 changeset 失败');
        return;
      }
    } else {
      log('error', '正式发布需要先创建 changeset');
      return;
    }
  }

  // 执行发布流程
  const steps = [
    { cmd: 'pnpm format', desc: '代码格式化' },
    { cmd: 'pnpm lint', desc: '代码 lint 检查' },
    { cmd: 'pnpm test', desc: '运行测试' },
    { cmd: 'pnpm build', desc: '构建所有包' },
    { cmd: 'pnpm changeset:version', desc: '更新版本号并生成 changelog' },
    { cmd: 'git add .', desc: '添加所有更改到 git' },
    { cmd: 'git commit -m "chore: release version"', desc: '提交版本更改' },
    { cmd: 'pnpm changeset:publish', desc: '发布到 npm' },
  ];

  for (const step of steps) {
    if (!(await runCommand(step.cmd, step.desc))) {
      log('error', '发布流程中断');
      return;
    }
  }

  // 创建并推送标签
  if (await createAndPushTags()) {
    log('success', '🎉 正式版本发布成功！');
  } else {
    log('error', '发布流程中断');
  }
}

/**
 * 预发布版本
 */
async function handlePreRelease(type: 'alpha' | 'beta' | 'rc'): Promise<void> {
  const typeInfo = {
    alpha: { name: 'Alpha', desc: '开发测试版', emoji: '🧪' },
    beta: { name: 'Beta', desc: '公开测试版', emoji: '🔬' },
    rc: { name: 'RC', desc: '发布候选版', emoji: '🎪' },
  };

  const info = typeInfo[type];
  log('title', `${info.emoji} ${info.name} 版本发布流程`);

  console.log(`${info.name} 版本发布流程:`);
  console.log('  1. 代码格式化和 lint 检查');
  console.log('  2. 运行测试');
  console.log('  3. 构建所有包');
  console.log(`  4. 基于当前更改生成 ${type} 快照版本`);
  console.log(`  5. 直接发布到 npm (带 ${type} 标签)\n`);

  log(
    'warning',
    `注意: 预发布版本会基于当前工作区的更改直接生成，无需预先创建 changeset\n`,
  );

  if (
    !(await confirm(`确认要发布 ${info.name} 版本 (${info.desc}) 吗?`, true))
  ) {
    log('info', '发布已取消');
    return;
  }

  // 检查 npm 权限
  if (!(await checkNpmAccess())) {
    log('error', 'npm 发布权限检查失败');
    return;
  }

  // 执行预发布流程
  const steps = [
    { cmd: 'pnpm format', desc: '代码格式化' },
    { cmd: 'pnpm lint', desc: '代码 lint 检查' },
    { cmd: 'pnpm test', desc: '运行测试' },
    { cmd: 'pnpm build', desc: '构建所有包' },
    { cmd: `pnpm version:${type}`, desc: `发布 ${info.name} 版本` },
  ];

  for (const step of steps) {
    if (!(await runCommand(step.cmd, step.desc))) {
      log('error', '发布流程中断');
      return;
    }
  }

  log('success', `🎉 ${info.name} 版本发布成功！`);
  log('info', `可以通过 npm install @fukict/runtime@${type} 来安装`);
}

/**
 * 创建 changeset
 */
async function handleCreateChangeset(): Promise<void> {
  log('title', '📋 创建 Changeset');

  console.log('Changeset 创建流程:');
  console.log('  1. 检测工作区中已更改的包');
  console.log('  2. 选择需要发布的包和版本类型');
  console.log('  3. 添加变更描述');
  console.log('  4. 生成 .changeset/*.md 文件\n');

  log('info', 'Changeset 会基于当前工作区的文件更改来检测哪些包需要发布\n');

  if (await runCommandLive('pnpm', ['changeset'])) {
    log('success', 'Changeset 创建完成！');
    log('info', '生成的 changeset 文件已保存到 .changeset/ 目录');
    log('info', '可以继续选择其他操作，或提交这些文件到 git');
  }
}

/**
 * 查看发布状态
 */
async function handleStatus(): Promise<void> {
  log('title', '📊 发布状态');
  await runCommand('pnpm changeset status', '检查发布状态');
}

// ============================================================================
// 主菜单
// ============================================================================

function showMenu(): void {
  log('title', '🚀 Fukict 发布工具');

  console.log('请选择发布类型:\n');
  console.log('1) 🎯 正式发布 (Production Release)');
  console.log('2) 🧪 Alpha 版本 (开发测试版)');
  console.log('3) 🔬 Beta 版本 (公开测试版)');
  console.log('4) 🎪 RC 版本 (发布候选版)');
  console.log('5) 📋 仅创建 Changeset');
  console.log('6) 📊 查看发布状态');
  console.log('7) 🔑 检查 npm 发布权限');
  console.log('0) 退出\n');
}

async function main(): Promise<void> {
  // 检查是否在正确的目录
  const rootDir = resolve(__dirname, '..');
  const packageJsonPath = resolve(rootDir, 'package.json');
  const changesetDir = resolve(rootDir, '.changeset');

  if (!existsSync(packageJsonPath) || !existsSync(changesetDir)) {
    log('error', '请在项目根目录运行此脚本');
    process.exit(1);
  }

  while (true) {
    showMenu();
    const choice = await selectOption();

    switch (choice) {
      case 1:
        await handleProductionRelease();
        break;
      case 2:
        await handlePreRelease('alpha');
        break;
      case 3:
        await handlePreRelease('beta');
        break;
      case 4:
        await handlePreRelease('rc');
        break;
      case 5:
        await handleCreateChangeset();
        break;
      case 6:
        await handleStatus();
        break;
      case 7:
        log('title', '🔑 npm 发布权限检查');
        await checkNpmAccess();
        break;
      case 0:
        log('info', '退出发布工具');
        return;
      default:
        log('error', '无效选择，请输入 0-7 之间的数字');
        break;
    }

    console.log('\n按 Enter 键继续...');
    await new Promise(resolve => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('', () => {
        rl.close();
        resolve(void 0);
      });
    });

    console.clear();
  }
}

// 错误处理
process.on('SIGINT', () => {
  log('info', '\n发布流程已中断');
  process.exit(0);
});

// 启动
main().catch(error => {
  log('error', `发布失败: ${error.message}`);
  process.exit(1);
});
