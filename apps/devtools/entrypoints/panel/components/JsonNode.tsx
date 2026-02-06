/**
 * JsonNode Component
 * 单个 JSON 节点，支持折叠/展开
 */
import { cn } from '~/utils/cn.js';

import { Fukict } from '@fukict/basic';

export interface JsonNodeProps {
  keyName?: string;
  value: any;
  depth: number;
  expanded: boolean;
  isLast?: boolean;
}

const INDENT_SIZE = 16;

export default class JsonNode extends Fukict<JsonNodeProps> {
  private isExpanded: boolean;

  constructor(props: JsonNodeProps) {
    super(props);
    this.isExpanded = this.shouldAutoExpand(props);
  }

  // 当 expanded prop 改变时同步状态
  updated(prevProps: JsonNodeProps): void {
    if (prevProps.expanded !== this.props.expanded) {
      this.isExpanded = this.shouldAutoExpand(this.props);
    }
  }

  /** Auto expand: only expand root + 2 levels (depth 0, 1, 2) */
  private shouldAutoExpand(props: JsonNodeProps): boolean {
    if (!props.expanded) return false;
    return props.depth <= 2;
  }

  private toggle = (e: Event): void => {
    e.stopPropagation();
    this.isExpanded = !this.isExpanded;
    this.update();
  };

  private handleRevealElement = (
    tagName: string,
    id?: string,
    className?: string,
  ): void => {
    let selector = tagName.toLowerCase();
    if (id) selector += `#${id}`;
    if (className) {
      selector += className
        .split(/\s+/)
        .filter(Boolean)
        .map(c => `.${c}`)
        .join('');
    }
    chrome.devtools.inspectedWindow.eval(
      `(function() {
        var el = document.querySelector(${JSON.stringify(selector)});
        if (el) { inspect(el); return true; }
        return false;
      })()`,
    );
  };

  private renderPrimitive(value: any): any {
    if (value === null) {
      return <span class="text-orange-500 dark:text-orange-400">null</span>;
    }
    if (value === undefined) {
      return <span class="text-gray-400 italic">undefined</span>;
    }

    const type = typeof value;

    if (type === 'string') {
      const displayValue =
        value.length > 100 ? value.slice(0, 100) + '...' : value;
      return (
        <span
          class="truncate text-green-600 dark:text-green-400"
          title={`"${displayValue}"`}
        >
          "{displayValue}"
        </span>
      );
    }
    if (type === 'number') {
      return <span class="text-blue-600 dark:text-blue-400">{value}</span>;
    }
    if (type === 'boolean') {
      return (
        <span class="text-purple-600 dark:text-purple-400">
          {value ? 'true' : 'false'}
        </span>
      );
    }

    if (
      type === 'function' ||
      (typeof value === 'string' && value.startsWith('[Function:'))
    ) {
      return <span class="text-gray-500 italic">{String(value)}</span>;
    }

    return <span class="text-gray-600">{String(value)}</span>;
  }

  private renderSpecialObject(value: any): any {
    if (value.__type === 'Date') {
      return (
        <span class="text-orange-600 dark:text-orange-400">{value.value}</span>
      );
    }
    if (value.__type === 'RegExp') {
      return <span class="text-red-600 dark:text-red-400">{value.value}</span>;
    }
    if (value.__type === 'ComponentInstance') {
      return (
        <span class="text-purple-600 italic dark:text-purple-400">
          &lt;{value.name}
          {value.id ? ` #${value.id}` : ''}&gt;
        </span>
      );
    }
    if (value.__type === 'Element') {
      return (
        <span class="inline-flex items-center gap-1">
          <span class="text-cyan-600 dark:text-cyan-400">
            &lt;{value.tagName.toLowerCase()}
            {value.id && ` id="${value.id}"`}
            {value.className && ` class="${value.className}"`}
            &gt;
          </span>
          <span
            class="cursor-pointer rounded px-1 text-[9px] text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Reveal in Elements panel"
            on:click={(e: Event) => {
              e.stopPropagation();
              this.handleRevealElement(
                value.tagName,
                value.id,
                value.className,
              );
            }}
          >
            inspect
          </span>
        </span>
      );
    }
    return null;
  }

  render() {
    const { keyName, value, depth, expanded, isLast = true } = this.props;

    const isArray = Array.isArray(value);
    const isObject =
      value !== null && typeof value === 'object' && !value.__type;
    const isExpandable = isObject || isArray;

    // 特殊对象类型
    const specialRender =
      value && value.__type ? this.renderSpecialObject(value) : null;
    if (specialRender) {
      return (
        <div class="flex h-5 items-center overflow-hidden">
          {/* 固定宽度的箭头占位 */}
          <span class="w-4 shrink-0" />
          {keyName !== undefined && (
            <span class="mr-1 text-purple-700 dark:text-purple-400">
              {keyName}:
            </span>
          )}
          {specialRender}
          {!isLast && <span class="text-gray-400">,</span>}
        </div>
      );
    }

    // 基础类型
    if (!isExpandable) {
      return (
        <div class="flex h-5 items-center overflow-hidden">
          {/* 固定宽度的箭头占位 */}
          <span class="w-4 shrink-0" />
          {keyName !== undefined && (
            <span class="mr-1 text-purple-700 dark:text-purple-400">
              {keyName}:
            </span>
          )}
          {this.renderPrimitive(value)}
          {!isLast && <span class="text-gray-400">,</span>}
        </div>
      );
    }

    // 数组或对象
    const entries: Array<[string | number, any]> = isArray
      ? value.map((v: any, i: number) => [i, v] as [number, any])
      : Object.entries(value);
    const isEmpty = entries.length === 0;
    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';

    // 空数组/对象
    if (isEmpty) {
      return (
        <div class="flex h-5 items-center overflow-hidden">
          <span class="w-4 shrink-0" />
          {keyName !== undefined && (
            <span class="mr-1 text-purple-700 dark:text-purple-400">
              {keyName}:
            </span>
          )}
          <span class="text-gray-500">
            {openBracket}
            {closeBracket}
          </span>
          {!isLast && <span class="text-gray-400">,</span>}
        </div>
      );
    }

    return (
      <div>
        {/* 头部行：箭头 + key + 括号 */}
        <div class="flex h-5 items-center overflow-hidden">
          {/* 折叠按钮 - 固定宽度居中 */}
          <span
            class={cn(
              'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center text-[10px] text-gray-400 transition-transform select-none hover:text-gray-600 dark:hover:text-gray-300',
              this.isExpanded && 'rotate-90',
            )}
            on:click={this.toggle}
          >
            ▶
          </span>

          {keyName !== undefined && (
            <span class="mr-1 text-purple-700 dark:text-purple-400">
              {keyName}:
            </span>
          )}

          <span class="text-gray-500">{openBracket}</span>

          {/* 折叠时显示预览 */}
          {!this.isExpanded && (
            <span
              class="mx-1 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              on:click={this.toggle}
            >
              {isArray ? `${value.length} items` : `${entries.length} keys`}
            </span>
          )}

          {!this.isExpanded && (
            <span class="text-gray-500">
              {closeBracket}
              {!isLast && <span class="text-gray-400">,</span>}
            </span>
          )}
        </div>

        {/* 展开的内容 */}
        {this.isExpanded && (
          <div
            class="border-l border-gray-200 dark:border-gray-700"
            style={`margin-left: 7px; padding-left: ${INDENT_SIZE - 8}px`}
          >
            {entries.map(([k, v], index) => (
              <JsonNode
                keyName={isArray ? undefined : String(k)}
                value={v}
                depth={depth + 1}
                expanded={expanded}
                isLast={index === entries.length - 1}
              />
            ))}
          </div>
        )}

        {/* 闭合括号 */}
        {this.isExpanded && (
          <div class="flex h-5 items-center overflow-hidden">
            <span class="w-4 shrink-0" />
            <span class="text-gray-500">{closeBracket}</span>
            {!isLast && <span class="text-gray-400">,</span>}
          </div>
        )}
      </div>
    );
  }
}
