import type { PluginObj } from '@babel/core';

export interface PluginOptions {
  // 是否开启开发模式（用于调试和错误边界）
  development?: boolean;
  // 自定义 JSX 运行时导入路径
  importSource?: string;
  // 是否自动注入 JSX 运行时导入
  runtime?: 'automatic' | 'classic';
}

export interface BabelPluginState {
  opts: PluginOptions;
  // 追踪是否已经添加了运行时导入
  runtimeImportAdded?: boolean;
  // 文件路径信息
  filename?: string;
}

export type fukictBabelPlugin = PluginObj<BabelPluginState>;
