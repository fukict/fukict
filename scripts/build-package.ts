#!/usr/bin/env tsx
/**
 * Fukict 包构建工具 - TypeScript 版本
 * 支持交互模式和命令行模式
 *
 * 从 tsdown.config.yml 动态读取可用包列表
 */
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { getAvailablePackages, getPackageConfig } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AVAILABLE_PACKAGES = getAvailablePackages();
type PackageName = string;

// 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface BuildOptions {
  packages: PackageName[];
  watch: boolean;
}

function parseArguments(args: string[]): BuildOptions {
  const options: BuildOptions = {
    packages: [],
    watch: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '--all':
        options.packages = [...AVAILABLE_PACKAGES];
        log('green', '🚀 使用 --all 参数，构建所有包');
        break;

      case '--watch':
        options.watch = true;
        break;

      case '--no-watch':
        options.watch = false;
        break;

      case '--pkg-name': {
        i++;
        while (i < args.length && !args[i].startsWith('--')) {
          const pkg = args[i] as PackageName;
          if (AVAILABLE_PACKAGES.includes(pkg)) {
            options.packages.push(pkg);
          } else {
            log('red', `❌ 未知包: ${pkg}`);
            log('yellow', `可用包: ${AVAILABLE_PACKAGES.join(', ')}`);
            process.exit(1);
          }
          i++;
        }
        i--;
        break;
      }

      case '--help':
      case '-h':
        showHelp();
        return { packages: [], watch: false };

      default:
        log('red', `❌ 未知选项: ${arg}`);
        showHelp();
        process.exit(1);
    }

    i++;
  }

  return options;
}

function showHelp(): void {
  console.log(`
${colors.blue}Usage: tsx scripts/build-package.ts [options]${colors.reset}

Options:
  --all                  构建所有包
  --pkg-name <packages>  指定包名 (${AVAILABLE_PACKAGES.join(', ')})
  --watch               启用监听模式
  --no-watch            禁用监听模式
  --help                显示帮助

Examples:
  tsx scripts/build-package.ts --all --no-watch
  tsx scripts/build-package.ts --pkg-name runtime --watch
  tsx scripts/build-package.ts --pkg-name runtime widget --no-watch
  `);
}

async function buildPackage(
  packageName: PackageName,
  watch: boolean,
): Promise<boolean> {
  const packagePath = resolve(__dirname, '..', 'packages', packageName);
  const packageJsonPath = resolve(packagePath, 'package.json');

  if (!existsSync(packageJsonPath)) {
    log('red', `❌ Package not found: ${packageName}`);
    return false;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const packageInfo = `${packageJson.name}@${packageJson.version}`;

  log('blue', `🚀 ${watch ? 'Watching' : 'Building'} package: ${packageName}`);
  log('yellow', `📦 Package: ${packageInfo}`);
  log('yellow', `🔧 Mode: ${watch ? 'watch' : 'build'}`);
  console.log('');

  return new Promise(resolve => {
    const args = watch ? ['--watch'] : [];
    const child = spawn('npx', ['tsc', ...args], {
      cwd: packagePath,
      stdio: 'inherit',
    });

    child.on('close', code => {
      if (code === 0) {
        log(
          'green',
          `✅ Successfully ${watch ? 'started watching' : 'built'} ${packageName}`,
        );
        resolve(true);
      } else {
        log('red', `❌ Failed to ${watch ? 'watch' : 'build'} ${packageName}`);
        resolve(false);
      }
    });
  });
}

async function buildPackages(options: BuildOptions): Promise<void> {
  const { packages, watch } = options;

  if (packages.length === 0) {
    // 如果是 --help 命令，静默退出
    return;
  }

  log('blue', `📦 构建包: ${packages.join(', ')}`);
  log('blue', `🔧 模式: ${watch ? 'watch' : 'build'}`);
  console.log('');

  if (watch && packages.length > 1) {
    log('blue', '🔄 启动并行监听模式...');
    log('yellow', '💡 按 Ctrl+C 停止所有监听');
    console.log('');

    const processes: ReturnType<typeof spawn>[] = [];

    for (const pkg of packages) {
      const packagePath = resolve(__dirname, '..', 'packages', pkg);

      // 使用 tsc 监听
      const child = spawn('npx', ['tsc', '--watch'], {
        cwd: packagePath,
        stdio: 'inherit',
      });

      processes.push(child);
      log('green', `✅ Started watcher for: ${pkg}`);
    }

    // 捕获退出信号
    const cleanup = () => {
      log('yellow', '\n🛑 停止所有监听...');
      processes.forEach(p => p.kill());
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // 等待所有进程
    await Promise.all(
      processes.map(p => new Promise(res => p.on('close', res))),
    );
  } else {
    // 顺序构建
    const failedPackages: PackageName[] = [];

    for (const pkg of packages) {
      const success = await buildPackage(pkg, watch);
      if (!success) {
        failedPackages.push(pkg);
      }
      console.log('');
    }

    if (failedPackages.length > 0) {
      log('red', `❌ 构建失败: ${failedPackages.join(', ')}`);
      process.exit(1);
    } else {
      log('green', `✅ 成功构建所有包: ${packages.join(', ')}`);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  await buildPackages(options);
}

main().catch(error => {
  log('red', `❌ 构建失败: ${error.message}`);
  process.exit(1);
});
