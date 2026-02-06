/**
 * Tree View Component
 * 树形视图容器 - 管理树的展开/折叠状态和选中状态
 */
import type { ComponentId, ComponentInfo } from '~/types/index.js';

import { Fukict } from '@fukict/basic';

import TreeNode from './TreeNode.js';

interface TreeViewProps {
  // 扁平的组件映射
  components: Record<string, ComponentInfo>;
  // 根组件 IDs
  rootIds?: ComponentId[];
  // 选中的组件 ID
  selectedId?: ComponentId | null;
  // 选中回调
  onSelect?: (id: ComponentId) => void;
}

export default class TreeView extends Fukict<TreeViewProps> {
  private expandedIds: Set<ComponentId> = new Set();
  private selectedId: ComponentId | null = null;
  private readonly STORAGE_KEY = 'fukict-devtools-expanded-nodes';

  mounted() {
    // 尝试从 localStorage 恢复展开状态
    this.loadExpandedState();

    // 清理不存在的节点
    this.cleanupExpandedState();

    // 确保所有根节点始终展开（即使有保存的状态）
    const { components, rootIds = [] } = this.props;
    rootIds.forEach(id => {
      if (components[id]) {
        this.expandedIds.add(id);
      }
    });

    // 如果是首次加载（没有其他展开的节点），保存状态
    if (this.expandedIds.size === rootIds.length) {
      this.saveExpandedState();
    }

    this.selectedId = this.props.selectedId || null;

    // Expand ancestors of the selected node so it's visible
    if (this.selectedId) {
      this.expandNodeAndAncestors(this.selectedId);
      this.saveExpandedState();
    }
  }

  /**
   * 组件更新时调用，清理无效的展开状态并补充展开新到达的根节点
   */
  updated(prevProps: TreeViewProps) {
    this.cleanupExpandedState();

    const { components, rootIds = [] } = this.props;
    let hasNewRoots = false;
    rootIds.forEach(id => {
      if (components[id] && !this.expandedIds.has(id)) {
        this.expandedIds.add(id);
        hasNewRoots = true;
      }
    });
    if (hasNewRoots) {
      this.saveExpandedState();
    }

    // 当 selectedId prop 从外部变化时（如 inspect picker），展开祖先并同步
    if (
      this.props.selectedId &&
      this.props.selectedId !== prevProps.selectedId
    ) {
      this.selectedId = this.props.selectedId;
      this.expandNodeAndAncestors(this.selectedId);
      this.saveExpandedState();
    }
  }

  /**
   * 从 localStorage 加载展开状态
   */
  private loadExpandedState(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const ids = JSON.parse(saved) as ComponentId[];
        this.expandedIds = new Set(ids);
      }
    } catch (error) {
      console.warn('[TreeView] Failed to load expanded state:', error);
    }
  }

  /**
   * 保存展开状态到 localStorage
   */
  private saveExpandedState(): void {
    try {
      const ids = Array.from(this.expandedIds);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.warn('[TreeView] Failed to save expanded state:', error);
    }
  }

  /**
   * 清理不存在的组件的展开状态
   */
  private cleanupExpandedState(): void {
    const { components } = this.props;
    let hasChanges = false;

    // 检查每个展开的 ID 是否还存在
    for (const id of this.expandedIds) {
      if (!components[id]) {
        this.expandedIds.delete(id);
        hasChanges = true;
      }
    }

    // 如果有变化，保存更新后的状态
    if (hasChanges) {
      this.saveExpandedState();
    }
  }

  /**
   * 展开指定节点及其所有祖先节点
   */
  private expandNodeAndAncestors(id: ComponentId): void {
    const { components } = this.props;
    const component = components[id];

    if (!component) return;

    // 展开当前节点
    this.expandedIds.add(id);

    // 递归展开父节点
    if (component.parentId) {
      this.expandNodeAndAncestors(component.parentId as ComponentId);
    }
  }

  private handleToggle = (id: ComponentId): void => {
    if (this.expandedIds.has(id)) {
      // 折叠：移除此节点
      this.expandedIds.delete(id);
    } else {
      // 展开：添加此节点并确保所有祖先节点也展开
      this.expandNodeAndAncestors(id);
    }
    this.saveExpandedState();
    this.update();
  };

  private handleSelect = (id: ComponentId): void => {
    this.selectedId = id;

    // 选中时自动展开到该节点（展开所有祖先）
    this.expandNodeAndAncestors(id);
    this.saveExpandedState();

    this.update();

    if (this.props.onSelect) {
      this.props.onSelect(id);
    }
  };

  /**
   * 递归渲染组件树
   */
  private renderTree(
    componentId: ComponentId,
    depth: number = 0,
    isLast: boolean = true,
  ): any {
    const { components } = this.props;
    const component = components[componentId];

    if (!component) return null;

    const hasChildren = component.children.length > 0;
    const isExpanded = this.expandedIds.has(componentId);
    const isSelected = this.selectedId === componentId;

    return (
      <TreeNode
        id={componentId}
        label={component.name}
        type={component.type}
        depth={depth}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isMounted={component.isMounted}
        updateCount={component.updateCount}
        isLast={isLast}
        onToggle={this.handleToggle}
        onSelect={this.handleSelect}
      >
        {hasChildren &&
          isExpanded &&
          component.children.map((childId, index) =>
            this.renderTree(
              childId as ComponentId,
              depth + 1,
              index === component.children.length - 1,
            ),
          )}
      </TreeNode>
    );
  }

  render() {
    const { rootIds = [] } = this.props;

    if (rootIds.length === 0) {
      return (
        <div class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
          <p class="text-xs">No components detected(TreeView)</p>
        </div>
      );
    }

    return (
      <div class="h-full overflow-y-auto">
        {rootIds.map((rootId, index) =>
          this.renderTree(rootId, 0, index === rootIds.length - 1),
        )}
      </div>
    );
  }
}
