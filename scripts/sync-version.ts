#!/usr/bin/env tsx
/**
 * Sync version from @fukict/basic to root package.json
 * Also extracts metadata for packages
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

/**
 * 同步版本号
 */
function syncVersion(): boolean {
  const rootPackageJsonPath = resolve(__dirname, '..', 'package.json');
  const basicPackageJsonPath = resolve(
    __dirname,
    '..',
    'packages',
    'basic',
    'package.json',
  );

  if (!existsSync(basicPackageJsonPath)) {
    log('red', '❌ @fukict/basic package.json not found');
    return false;
  }

  // 读取 basic 包的版本
  const basicPackageJson = JSON.parse(
    readFileSync(basicPackageJsonPath, 'utf-8'),
  ) as PackageJson;
  const basicVersion = basicPackageJson.version;

  // 读取根目录 package.json
  const rootPackageJson = JSON.parse(
    readFileSync(rootPackageJsonPath, 'utf-8'),
  ) as PackageJson;
  const rootVersion = rootPackageJson.version;

  if (basicVersion === rootVersion) {
    log('cyan', `ℹ️  Version already synced: ${basicVersion}`);
    return true;
  }

  // 更新根目录版本
  rootPackageJson.version = basicVersion;

  // 写回文件（保持格式）
  writeFileSync(
    rootPackageJsonPath,
    JSON.stringify(rootPackageJson, null, 2) + '\n',
    'utf-8',
  );

  log('green', `✅ Synced version: ${rootVersion} → ${basicVersion}`);

  return true;
}

/**
 * 提取 metadata
 */
function extractMetadata(): boolean {
  try {
    log('blue', '📦 Extracting metadata...');
    execSync('tsx scripts/extract-metadata.ts', {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
    });
    return true;
  } catch {
    log('red', '❌ Failed to extract metadata');
    return false;
  }
}

async function main(): Promise<void> {
  log('blue', '🔄 Syncing version and extracting metadata...\n');

  // 1. 同步版本
  if (!syncVersion()) {
    process.exit(1);
  }

  console.log();

  // 2. 提取 metadata
  if (!extractMetadata()) {
    process.exit(1);
  }

  console.log();
  log('green', '✅ Done!');
}

main().catch((error: unknown) => {
  const errorMessage =
    error instanceof Error ? error.message : String(error || 'Unknown error');
  log('red', `❌ Error: ${errorMessage}`);
  process.exit(1);
});
