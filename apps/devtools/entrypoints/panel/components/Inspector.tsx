/**
 * Inspector Component
 * 详情检查器 - 显示 Props/State/Refs 等详细信息
 */
import { cn } from '~/utils/cn.js';

import { Fukict } from '@fukict/basic';

import { cva } from 'class-variance-authority';

import JsonViewer from './JsonViewer.js';

interface InspectorProps {
  title?: string;
  data: any;
  emptyText?: string;
  defaultExpanded?: boolean;
  expandAllState?: boolean;
  onExpandAllChange?: (expanded: boolean) => void;
}

const sectionVariants = cva(
  'border-b border-gray-200 dark:border-gray-700 last:border-b-0',
);

const headerVariants = cva(
  'px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400',
);

export default class Inspector extends Fukict<InspectorProps> {
  private expandAll: boolean;
  private renderKey = 0;

  constructor(props: InspectorProps) {
    super(props);
    this.expandAll = props.expandAllState ?? props.defaultExpanded ?? false;
  }

  updated(prevProps: InspectorProps): void {
    if (
      prevProps.expandAllState !== this.props.expandAllState &&
      this.props.expandAllState !== undefined
    ) {
      this.expandAll = this.props.expandAllState;
      this.renderKey++;
    }
  }

  private handleExpandAllChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    this.expandAll = target.checked;
    this.renderKey++;
    this.props.onExpandAllChange?.(this.expandAll);
    this.update();
  };

  render() {
    const {
      title = 'Inspector',
      data,
      emptyText = 'No data to display',
      defaultExpanded = false,
    } = this.props;

    const hasData = data && Object.keys(data).length > 0;

    return (
      <div class={cn(sectionVariants())}>
        <div class={cn(headerVariants(), 'flex items-center justify-between')}>
          <span>{title}</span>
          {hasData && (
            <label class="flex cursor-pointer items-center gap-1.5 font-normal text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <input
                type="checkbox"
                checked={this.expandAll}
                on:change={this.handleExpandAllChange}
                class="h-3 w-3 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-[11px]">Auto expand</span>
            </label>
          )}
        </div>
        <div class="px-4 py-3">
          {hasData ? (
            <JsonViewer
              data={data}
              defaultExpanded={defaultExpanded}
              expandAll={this.expandAll}
              renderKey={this.renderKey}
            />
          ) : (
            <div class="text-xs text-gray-400 italic">{emptyText}</div>
          )}
        </div>
      </div>
    );
  }
}
