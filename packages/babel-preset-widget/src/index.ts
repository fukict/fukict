/**
 * @vanilla-dom/babel-preset-widget
 *
 * 专为 @vanilla-dom/widget 优化的 Babel 预设
 * 提供零配置的 JSX 转换和组件注册支持
 */
import type { ConfigAPI, PluginItem } from '@babel/core';

interface PresetOptions {
  /** 是否启用开发模式 */
  development?: boolean;
  /** 自定义 JSX 运行时导入路径 */
  importSource?: string;
  /** TypeScript 配置 */
  typescript?:
    | boolean
    | {
        /** 是否优化枚举 */
        optimizeConstEnums?: boolean;
        /** 允许声明合并 */
        allowDeclareFields?: boolean;
        /** 允许命名空间 */
        allowNamespaces?: boolean;
      };
}

/**
 * Widget 预设 - 提供完整的 Widget 开发环境
 */
export default function presetWidget(
  api: ConfigAPI,
  options: PresetOptions = {},
): {
  presets: PluginItem[];
  plugins: PluginItem[];
} {
  const {
    development = api.env('development'),
    importSource = '@vanilla-dom/core',
    typescript = true,
  } = options;

  const presets: PluginItem[] = [];
  const plugins: PluginItem[] = [];

  // TypeScript 支持
  if (typescript) {
    const tsOptions = typeof typescript === 'object' ? typescript : {};
    presets.push([
      '@babel/preset-typescript',
      {
        optimizeConstEnums: tsOptions.optimizeConstEnums ?? true,
        allowDeclareFields: tsOptions.allowDeclareFields ?? true,
        allowNamespaces: tsOptions.allowNamespaces ?? false,
        // 不转换 JSX，交给我们的插件处理
        isTSX: true,
        allExtensions: true,
        onlyRemoveTypeImports: true,
      },
    ]);
  }

  // 添加 JSX 语法解析支持
  plugins.push('@babel/plugin-syntax-jsx');

  // 添加 vanilla-dom JSX 转换插件
  plugins.push([
    '@vanilla-dom/babel-plugin',
    {
      development,
      importSource,
      // 专为 Widget 优化的配置
      runtime: 'automatic',
    },
  ]);

  return {
    presets,
    plugins,
  };
}

// 仅使用 ES 模块导出，由构建工具处理 CommonJS 兼容性
