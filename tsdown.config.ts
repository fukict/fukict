/**
 * Fukict Packages Build Configuration
 *
 * 从 tsdown.config.yml 读取配置，为不同包提供统一的构建配置
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'tsdown';
import { parse as parseYaml } from 'yaml';

// ============================================================================
// 类型定义
// ============================================================================

interface PackageConfig {
  platform: 'browser' | 'node';
  entry: string | string[];
  format: 'esm' | 'cjs' | ('esm' | 'cjs')[];
  description?: string;
}

interface CommonConfig {
  outDir: string;
  dts: boolean;
  unbundle: boolean;
  sourcemap: boolean;
  splitting: boolean;
  external: string[];
}

interface BuildConfig {
  packages: Record<string, PackageConfig>;
  common: CommonConfig;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 查找 YAML 配置文件路径
 * 支持从根目录或子目录执行
 */
function findConfigPath(): string {
  // 尝试当前目录
  let configPath = resolve(process.cwd(), 'tsdown.config.yml');
  if (existsSync(configPath)) return configPath;

  // 尝试父目录（当从 packages/xxx 目录执行时）
  configPath = resolve(process.cwd(), '..', '..', 'tsdown.config.yml');
  if (existsSync(configPath)) return configPath;

  throw new Error('tsdown.config.yml not found');
}

/**
 * 查找包的 package.json 路径
 * 支持从根目录或包目录执行
 */
function findPackageJsonPath(packageName: string): string {
  // 从根目录调用
  if (existsSync(`packages/${packageName}`)) {
    const packagePath = resolve(`packages/${packageName}`);
    return resolve(packagePath, 'package.json');
  }

  // 从包目录调用
  if (existsSync('package.json')) {
    return resolve('package.json');
  }

  throw new Error(
    `Package not found: ${packageName}. ` +
      `Available packages: runtime, widget, babel-plugin, babel-preset-widget`,
  );
}

/**
 * 创建外部化依赖判断函数
 */
function createExternalFn(patterns: string[]) {
  return (id: string) => {
    return patterns.some(pattern => id.startsWith(pattern));
  };
}

// ============================================================================
// 环境变量和配置加载
// ============================================================================

// 1. 获取包名
const packageName = process.env.PACKAGE_NAME;
if (!packageName) {
  throw new Error('Please specify PACKAGE_NAME environment variable');
}

// 2. 验证 package.json 存在
const packageJsonPath = findPackageJsonPath(packageName);
try {
  JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
} catch (error) {
  throw new Error(`Failed to read package.json: ${(error as Error).message}`);
}

// 3. 读取 YAML 配置
const configPath = findConfigPath();
const configFile = readFileSync(configPath, 'utf-8');
const config = parseYaml(configFile) as BuildConfig;

// 4. 检测构建模式
const isWatchMode =
  process.env.npm_lifecycle_event === 'dev' || process.argv.includes('--watch');

// ============================================================================
// 配置构建
// ============================================================================

function getPackageConfig() {
  // 获取包特定配置
  const packageConfig = config.packages[packageName];
  if (!packageConfig) {
    throw new Error(
      `Package "${packageName}" not found in tsdown.config.yml. ` +
        `Available packages: ${Object.keys(config.packages).join(', ')}`,
    );
  }

  // 获取通用配置
  const commonConfig = config.common || ({} as CommonConfig);

  // 构建最终配置
  return {
    ...commonConfig,
    ...packageConfig,
    clean: !isWatchMode, // watch 模式下不清理，避免频繁删除
    external: createExternalFn(commonConfig.external || []),
    onSuccess: isWatchMode
      ? undefined
      : () => {
          console.log(`✅ ${packageName} 构建完成`);
        },
  };
}

// ============================================================================
// 导出配置
// ============================================================================

export default defineConfig(getPackageConfig() as any);
