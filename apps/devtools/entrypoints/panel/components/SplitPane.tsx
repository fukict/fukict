/**
 * SplitPane Component
 * 通用可拖拽分栏组件 - 左右两栏布局，支持拖拽调整左栏宽度
 */
import { Fukict, VNodeChild } from '@fukict/basic';

interface SplitPaneProps {
  /** localStorage 持久化 key */
  storageKey: string;
  /** 默认宽度（px） */
  defaultWidth?: number;
  /** 最小宽度（px） */
  minWidth?: number;
  /** 最大宽度（px） */
  maxWidth?: number;
  /** 子节点 */
  children: VNodeChild[];
}

export default class SplitPane extends Fukict<
  SplitPaneProps,
  {
    default: VNodeChild[];
  }
> {
  private sidebarWidth: number;
  private isResizing = false;
  private readonly minWidth: number;
  private readonly maxWidth: number;

  constructor(props: SplitPaneProps) {
    super(props);
    this.minWidth = props.minWidth ?? 200;
    this.maxWidth = props.maxWidth ?? 600;
    this.sidebarWidth = props.defaultWidth ?? 256;
  }

  mounted() {
    const saved = localStorage.getItem(this.props.storageKey);
    if (saved) {
      this.sidebarWidth = parseInt(saved, 10);
    }

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (): void => {
    this.isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isResizing) return;

    const newWidth = e.clientX;
    if (newWidth >= this.minWidth && newWidth <= this.maxWidth) {
      this.sidebarWidth = newWidth;
      this.update();
    }
  };

  private handleMouseUp = (): void => {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(this.props.storageKey, this.sidebarWidth.toString());
    }
  };

  render() {
    const children = this.$slots.default || [];
    const aside = children[0];
    const main = children[1];

    return (
      <div class="flex h-full">
        {/* Aside */}
        <div
          class="flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700"
          style={`width: ${this.sidebarWidth}px; min-width: ${this.minWidth}px; max-width: ${this.maxWidth}px;`}
        >
          {aside}
        </div>

        {/* Resize Handle */}
        <div
          class="group relative w-[1px] cursor-col-resize bg-transparent hover:bg-blue-500 dark:hover:bg-blue-400"
          on:mousedown={this.handleMouseDown}
        >
          <div class="absolute inset-y-0 -right-1 -left-1" />
        </div>

        {/* Main */}
        <div class="flex-1 overflow-hidden">{main}</div>
      </div>
    );
  }
}
