import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'tsdown';

// 从命令行参数获取包名
const packageName = process.env.PACKAGE_NAME;
if (!packageName) {
  throw new Error('Please specify PACKAGE_NAME environment variable');
}

// 当从子目录调用时，相对路径会不同
let packagePath: string, packageJsonPath: string;
if (existsSync(`packages/${packageName}`)) {
  // 从根目录调用
  packagePath = resolve(`packages/${packageName}`);
  packageJsonPath = resolve(packagePath, 'package.json');
} else if (existsSync('package.json')) {
  // 从包目录调用
  packagePath = resolve('.');
  packageJsonPath = resolve('package.json');
} else {
  throw new Error(
    `Package not found: ${packageName}. Available packages: core, widget, babel-plugin, babel-preset-widget`,
  );
}

let _packageJson: any;
try {
  _packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
} catch (error) {
  throw new Error(`Failed to read package.json: ${(error as Error).message}`);
}

// 获取构建模式
const isWatchMode =
  process.env.npm_lifecycle_event === 'dev' || process.argv.includes('--watch');
const isDev = process.env.NODE_ENV === 'development' || isWatchMode;

// 根据不同包的特点配置构建选项
const getPackageConfig = () => {
  const baseConfig = {
    outDir: 'dist',
    dts: true,
    clean: !isWatchMode, // watch 模式下不清理，避免频繁删除
    unbundle: true,
    sourcemap: isDev, // 开发模式生成 sourcemap
    minify: !isDev, // 生产模式压缩
    splitting: false, // 禁用代码分割
    external: (id: string) => {
      // 外部化以下类型的依赖
      if (id.startsWith('../types/')) return true;
      if (id.startsWith('@fukict/')) return true;
      if (id.startsWith('@babel/')) return true;
      return false;
    },
    // 构建完成回调
    onSuccess: isWatchMode
      ? undefined
      : () => {
          console.log(`✅ ${packageName} 构建完成`);
        },
  };

  switch (packageName) {
    case 'core':
    case 'widget':
      return {
        ...baseConfig,
        entry: ['src/index.ts'],
        format: 'esm',
      };
    case 'babel-plugin':
    case 'babel-preset-widget':
      return {
        ...baseConfig,
        entry: 'src/index.ts',
        format: ['esm', 'cjs'],
        platform: 'node',
      };

    default:
      throw new Error(`Unknown package: ${packageName}`);
  }
};

export default defineConfig(getPackageConfig() as any);
