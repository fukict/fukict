/**
 * Tree Node Component
 * 树形节点组件 - 支持展开/折叠、选中状态
 */
import { cn } from '~/utils/cn.js';

import { Fukict } from '@fukict/basic';

import { cva } from 'class-variance-authority';

interface TreeNodeProps {
  // 节点数据
  id: string;
  label: string;
  type?: string;
  depth?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
  isMounted?: boolean;
  updateCount?: number;
  isLast?: boolean;

  // 事件回调
  onToggle?: (id: string) => void;
  onSelect?: (id: string) => void;
}

const nodeVariants = cva(
  'flex items-center gap-2 pr-3 py-0.5 cursor-pointer transition-colors text-xs hover:bg-gray-100 dark:hover:bg-gray-800 relative',
  {
    variants: {
      selected: {
        true: 'bg-blue-50 dark:bg-blue-900/30',
        false: '',
      },
      mounted: {
        true: '',
        false: 'opacity-50',
      },
    },
    defaultVariants: {
      selected: false,
      mounted: true,
    },
  },
);

export default class TreeNode extends Fukict<TreeNodeProps> {
  private handleToggle = (e: Event): void => {
    e.stopPropagation();
    if (this.props.onToggle && this.props.hasChildren) {
      this.props.onToggle(this.props.id);
    }
  };

  private handleSelect = (): void => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.id);
    }
  };

  private handleMouseEnter = (): void => {
    void chrome.runtime.sendMessage({
      type: 'HIGHLIGHT_COMPONENT',
      componentId: this.props.id,
      source: 'fukict-devtools-panel',
    });
  };

  private handleMouseLeave = (): void => {
    void chrome.runtime.sendMessage({
      type: 'UNHIGHLIGHT_COMPONENT',
      source: 'fukict-devtools-panel',
    });
  };

  render() {
    const {
      label,
      type,
      depth = 0,
      hasChildren = false,
      isExpanded = false,
      isSelected = false,
      isMounted = true,
      updateCount = 0,
      isLast = false,
    } = this.props;

    const indentSize = 12;
    const paddingLeft = depth * indentSize + 6;

    // 生成缩进指引线（不包括当前层级）
    const indentGuides = [];
    for (let i = 0; i < depth - 1; i++) {
      indentGuides.push(
        <span
          class="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
          style={`left: ${i * indentSize + 12}px`}
        />,
      );
    }

    return (
      <div>
        {/* 当前节点 */}
        <div
          class={cn(nodeVariants({ selected: isSelected, mounted: isMounted }))}
          style={`padding-left: ${paddingLeft}px`}
          on:click={this.handleSelect}
          on:mouseenter={this.handleMouseEnter}
          on:mouseleave={this.handleMouseLeave}
        >
          {/* 缩进指引线（祖先层级） */}
          {indentGuides}

          {/* 当前层级的连接线 */}
          {depth > 0 && (
            <span
              class="absolute w-px bg-gray-200 dark:bg-gray-700"
              style={`left: ${(depth - 1) * indentSize + 12}px; top: 0; ${isLast ? 'height: 50%' : 'bottom: 0'}`}
            />
          )}

          {/* 水平连接线（从垂直线到节点） */}
          {depth > 0 && (
            <span
              class="absolute h-px bg-gray-200 dark:bg-gray-700"
              style={`left: ${(depth - 1) * indentSize + 12}px; top: 50%; width: ${indentSize - 6}px`}
            />
          )}

          {/* 选中指示条 */}
          {isSelected && (
            <span class="absolute top-0 bottom-0 left-0 w-0.5 bg-blue-500" />
          )}

          <div class="flex items-center">
            {/* 展开/折叠图标 */}
            {hasChildren ? (
              <span
                class="inline-flex h-4 w-4 items-center justify-center text-gray-400 transition-transform select-none hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                style={isExpanded ? 'transform: rotate(90deg)' : ''}
                on:click={this.handleToggle}
              >
                {'▶'}
              </span>
            ) : (
              <span class="inline-block w-4" />
            )}

            {/* 组件名称 */}
            <span class="font-medium text-gray-800 dark:text-gray-200">
              &lt;{label}&gt;
            </span>
          </div>

          {/* 组件类型 */}
          {type && (
            <span class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {type}
            </span>
          )}

          {/* 更新计数 */}
          {updateCount > 0 && (
            <span class="ml-auto rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              ×{updateCount}
            </span>
          )}

          {/* 未挂载标识 */}
          {!isMounted && (
            <span class="ml-auto rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/50 dark:text-red-400">
              unmounted
            </span>
          )}
        </div>

        {/* 子节点 - 使用 $slots.default */}
        {hasChildren && isExpanded && (
          <div class="component-children">{this.$slots.default}</div>
        )}
      </div>
    );
  }
}
