import vanillaDomPlugin from './plugin.js';

// 主导出：babel 插件函数
export default vanillaDomPlugin;

// 命名导出：类型定义
export type { PluginOptions, BabelPluginState } from './types.js';

// 工具函数导出（可选，供高级用户使用）
export {
  isJSXElement,
  isJSXFragment,
  getJSXElementName,
  convertJSXAttributes,
  convertJSXChildren,
  isBuiltinElement,
  createRuntimeImport,
} from './utils.js';
