/**
 * 共享工具函数
 * 用于所有构建脚本
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
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
