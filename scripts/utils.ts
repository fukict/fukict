/**
 * 共享工具函数
 * 用于所有构建脚本
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PackageConfig {
  description?: string;
  metadata?: boolean;
}

export interface BuildConfig {
  packages: Record<string, PackageConfig>;
}

/**
 * 读取 build.config.yml 配置
 */
export function loadConfig(): BuildConfig {
  const configPath = resolve(__dirname, '..', 'build.config.yml');
  if (!existsSync(configPath)) {
    throw new Error('build.config.yml not found');
  }

  const configContent = readFileSync(configPath, 'utf-8');
  return parseYaml(configContent) as BuildConfig;
}

/**
 * 获取所有可用的包列表
 */
export function getAvailablePackages(): string[] {
  const config = loadConfig();
  return Object.keys(config.packages);
}

/**
 * 获取指定包的配置
 */
export function getPackageConfig(packageName: string): PackageConfig | null {
  const config = loadConfig();
  return config.packages[packageName] || null;
}

// ============================================================================
// Git 工具函数
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

/**
 * 日志输出
 */
export function log(
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

/**
 * 确认提示
 */
export async function confirm(
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
 * 多选提示
 */
export async function multiSelect(
  message: string,
  options: string[],
): Promise<number[]> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`\n${message}`);
  options.forEach((option, index) => {
    console.log(`  ${index + 1}) ${option}`);
  });
  console.log(`  ${colors.cyan}a) 全选${colors.reset}`);
  console.log();

  return new Promise(resolve => {
    rl.question('请选择文件（用空格分隔多个数字，或输入 a 全选）: ', answer => {
      rl.close();
      const normalized = answer.trim().toLowerCase();

      // 全选
      if (normalized === 'a') {
        resolve(options.map((_, index) => index));
        return;
      }

      // 解析选择的数字
      const selected = normalized
        .split(/\s+/)
        .map(s => parseInt(s, 10) - 1)
        .filter(n => !isNaN(n) && n >= 0 && n < options.length);

      resolve(selected);
    });
  });
}

/**
 * 获取未暂存的文件
 */
export function getUnstagedFiles(): string[] {
  try {
    const output = execSync('git status --porcelain', {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
    });

    return output
      .split('\n')
      .filter(line => line.trim())
      .filter(line => {
        // 过滤已暂存的文件（状态码第二位不为空格的是未暂存的）
        const status = line.substring(0, 2);
        return status[1] !== ' ' && status[1] !== '';
      })
      .map(line => line.substring(3));
  } catch {
    return [];
  }
}

/**
 * 交互式添加文件到 git
 */
export async function interactiveGitAdd(): Promise<boolean> {
  const unstagedFiles = getUnstagedFiles();

  if (unstagedFiles.length === 0) {
    log('info', '没有需要暂存的文件');
    return true;
  }

  console.log(`\n发现 ${unstagedFiles.length} 个未暂存的文件`);

  const selectedIndices = await multiSelect('选择要暂存的文件:', unstagedFiles);

  if (selectedIndices.length === 0) {
    log('info', '未选择任何文件');
    return true;
  }

  const selectedFiles = selectedIndices.map(i => unstagedFiles[i]);

  log('info', `暂存 ${selectedFiles.length} 个文件...`);
  for (const file of selectedFiles) {
    try {
      execSync(`git add "${file}"`, {
        cwd: resolve(__dirname, '..'),
      });
      log('success', `  ${file}`);
    } catch {
      log('error', `  ${file} 暂存失败`);
      return false;
    }
  }

  return true;
}
