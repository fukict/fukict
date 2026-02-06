/**
 * JsonViewer Component
 * 美观的 JSON 查看器，支持折叠/展开
 */
import { Fukict } from '@fukict/basic';

import JsonNode from './JsonNode.js';

interface JsonViewerProps {
  data: any;
  defaultExpanded?: boolean;
  expandAll?: boolean;
  renderKey?: number;
}

export default class JsonViewer extends Fukict<JsonViewerProps> {
  render() {
    const {
      data,
      expandAll,
      defaultExpanded = false,
      renderKey = 0,
    } = this.props;
    const expanded = expandAll ?? defaultExpanded;

    if (data === null || data === undefined) {
      return <div class="py-2 text-xs text-gray-400 italic">No data</div>;
    }

    return (
      <div class="font-mono text-xs">
        {/* JSON 内容 - 使用 key 强制重新渲染 */}
        <div key={renderKey}>
          <JsonNode value={data} depth={0} expanded={expanded} />
        </div>
      </div>
    );
  }
}
