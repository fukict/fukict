import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../../components/CodeBlock';
import { DemoBox } from '../../../components/DemoBox';
import { PageHeader } from '../../../components/PageHeader';
import { HighPerformanceList } from './HighPerformanceList';
import { TraditionalList } from './TraditionalList';

/**
 * 动态列表页面（状态管理组件）
 *
 * 职责：
 * 1. 管理页面级状态
 * 2. 通过 this.$refs.listRef.add/remove/updateItem/move 调用高性能列表 APIs
 * 3. 展示性能对比和使用指南
 */
export class DynamicListPage extends RouteComponent {
  declare $refs: {
    perfList: HighPerformanceList;
    tradList: TraditionalList;
  };

  /**
   * 通过 ref 调用高性能列表的 API - 添加任务
   */
  handleAdd() {
    const perfList = this.$refs.perfList;
    if (perfList) {
      perfList.add({
        id: `perf-${Date.now()}`,
        text: `新任务 ${perfList.getAll().length + 1}`,
        completed: false,
        createdAt: Date.now(),
      });
    }

    const tradList = this.$refs.tradList;
    if (tradList) {
      tradList.add();
    }
  }

  /**
   * 通过 ref 调用高性能列表的 API - 排序
   */
  handleSort() {
    const perfList = this.$refs.perfList;
    if (perfList) {
      perfList.sortByDate();
    }

    const tradList = this.$refs.tradList;
    if (tradList) {
      tradList.sortByDate();
    }
  }

  render() {
    return (
      <div class="space-y-8">
        <PageHeader
          title="高性能动态列表"
          description="通过手动实例化 + mount 实现高性能列表操作，避免不必要的重新渲染"
        />

        {/* 概述 */}
        <DemoBox title="核心设计思想">
          <div class="prose max-w-none">
            <p class="text-sm text-gray-700">
              React
              的列表渲染在频繁更新时性能较差，每次父组件更新都可能导致大量子组件重新渲染。
            </p>
            <p class="text-sm text-gray-700">Fukict 提供了更精确的控制方案：</p>
            <ul class="space-y-1 text-sm text-gray-700">
              <li>
                <strong>手动实例化</strong> -{' '}
                <code class="text-xs">new TodoItemComponent(props)</code>{' '}
                直接创建组件实例
              </li>
              <li>
                <strong>占位元素</strong> -{' '}
                <code class="text-xs">createComment()</code> 创建占位符标记位置
              </li>
              <li>
                <strong>手动挂载</strong> -{' '}
                <code class="text-xs">
                  instance.mount(container, placeholder)
                </code>{' '}
                精确控制挂载
              </li>
              <li>
                <strong>API 暴露</strong> - 列表组件暴露 add/remove/update/move
                等 APIs
              </li>
              <li>
                <strong>外部调用</strong> -{' '}
                <code class="text-xs">this.$refs.listRef.add(todo)</code> 通过
                ref 调用
              </li>
            </ul>
            <p class="text-sm font-medium text-red-600">
              请点击按钮操作两个列表，观察渲染次数和操作耗时的差异！
            </p>
          </div>
        </DemoBox>

        {/* 操作按钮 */}
        <div class="flex gap-3 rounded border border-blue-200 bg-blue-50 p-4">
          <button
            on:click={() => this.handleAdd()}
            class="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            🆕 两个列表都添加任务
          </button>
          <button
            on:click={() => this.handleSort()}
            class="rounded bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
          >
            🔄 两个列表都排序
          </button>
        </div>

        {/* 性能对比示例 */}
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 传统列表 */}
          <DemoBox title="传统模式（JSX 渲染）">
            <TraditionalList fukict:ref="tradList" />
          </DemoBox>

          {/* 高性能列表 */}
          <DemoBox title="高性能模式（手动实例化 + mount）">
            <HighPerformanceList fukict:ref="perfList" />
          </DemoBox>
        </div>

        {/* 实现原理 */}
        <DemoBox title="高性能列表实现原理">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 核心思路 */}
            <div>
              <h3 class="mb-3 text-base font-medium text-gray-800">实现步骤</h3>
              <ol class="list-inside list-decimal space-y-2 text-sm text-gray-700">
                <li>
                  <strong>创建占位元素</strong>
                  <code class="mt-1 ml-5 block rounded bg-gray-100 p-1 text-xs">
                    const placeholder = dom.createComment('fukict:todo:1');
                  </code>
                </li>
                <li>
                  <strong>将占位元素添加到容器</strong>
                  <code class="mt-1 ml-5 block rounded bg-gray-100 p-1 text-xs">
                    container.appendChild(placeholder);
                  </code>
                </li>
                <li>
                  <strong>直接实例化组件</strong>
                  <code class="mt-1 ml-5 block rounded bg-gray-100 p-1 text-xs">
                    const instance = new TodoItemComponent(props);
                  </code>
                </li>
                <li>
                  <strong>调用 mount 方法挂载</strong>
                  <code class="mt-1 ml-5 block rounded bg-gray-100 p-1 text-xs">
                    instance.mount(container, placeholder);
                  </code>
                </li>
                <li>
                  <strong>保存实例引用</strong>
                  <code class="mt-1 ml-5 block rounded bg-gray-100 p-1 text-xs">
                    this.todoInstances.set(id, instance);
                  </code>
                </li>
              </ol>

              <h3 class="mt-4 mb-3 text-base font-medium text-gray-800">
                性能优势
              </h3>
              <ul class="list-inside list-disc space-y-2 text-sm text-gray-700">
                <li>子组件只在添加时渲染一次</li>
                <li>切换状态只更新单个子组件</li>
                <li>排序只移动 DOM 节点，不重新渲染</li>
                <li>删除直接卸载，不影响其他组件</li>
                <li>
                  <strong class="text-green-600">性能提升：10x - 100x</strong>
                </li>
              </ul>
            </div>

            {/* 代码示例 */}
            <div>
              <h3 class="mb-3 text-base font-medium text-gray-800">核心代码</h3>
              <CodeBlock
                language="tsx"
                code={`class HighPerformanceList extends Fukict {
  private todoInstances = new Map();
  private todoPlaceholders = new Map();

  /**
   * API: 添加 Todo 项
   */
  add(todo: TodoItem) {
    // 1. 创建占位元素
    const placeholder =
      dom.createComment(\`fukict:todo:\${todo.id}\`);

    // 2. 添加到容器
    this.containerRef.appendChild(placeholder);

    // 3. 实例化组件
    const instance = new TodoItemComponent({
      todo,
      onToggle: (id) => this.toggle(id),
    });

    // 4. 手动挂载
    instance.mount(this.containerRef, placeholder);

    // 5. 保存引用
    this.todoInstances.set(todo.id, instance);
    this.todoPlaceholders.set(todo.id, placeholder);
  }

  /**
   * API: 删除 Todo 项
   */
  remove(id: string) {
    const instance = this.todoInstances.get(id);
    const placeholder = this.todoPlaceholders.get(id);

    if (instance && placeholder) {
      // 卸载组件
      instance.unmount();

      // 移除占位元素
      placeholder.parentNode?.removeChild(placeholder);

      // 清理引用
      this.todoInstances.delete(id);
      this.todoPlaceholders.delete(id);
    }
  }

  /**
   * API: 更新 Todo 项
   */
  update(id: string, newTodo: TodoItem) {
    const instance = this.todoInstances.get(id);
    if (instance) {
      instance.updateTodo(newTodo);
    }
  }
}

// 外部组件通过 ref 调用
class App extends Fukict {
  declare $refs: { list: HighPerformanceList };

  handleAdd() {
    this.$refs.list.add({
      id: '1',
      text: '新任务'
    });
  }
}`}
              />
            </div>
          </div>
        </DemoBox>

        {/* 使用建议 */}
        <DemoBox title="使用建议">
          <div class="prose max-w-none">
            <h3 class="text-base font-medium text-gray-800">
              何时使用高性能列表模式？
            </h3>
            <ul class="space-y-1 text-sm text-gray-700">
              <li>
                <strong>大量列表项</strong>（100+ 项）且频繁更新
              </li>
              <li>
                <strong>复杂子组件</strong>（每个子组件渲染成本高）
              </li>
              <li>
                <strong>高频操作</strong>（排序、过滤、搜索）
              </li>
              <li>
                <strong>实时数据</strong>（WebSocket、轮询更新）
              </li>
            </ul>

            <h3 class="mt-4 text-base font-medium text-gray-800">
              何时使用传统模式？
            </h3>
            <ul class="space-y-1 text-sm text-gray-700">
              <li>
                <strong>简单列表</strong>（少于 50 项）
              </li>
              <li>
                <strong>低频更新</strong>（用户手动触发）
              </li>
              <li>
                <strong>简单子组件</strong>（渲染成本低）
              </li>
            </ul>

            <div class="mt-4 rounded border border-blue-200 bg-blue-50 p-4">
              <p class="text-sm font-medium text-blue-800">💡 提示</p>
              <p class="text-sm text-blue-700">
                我们计划将这种模式抽象为{' '}
                <code class="text-xs">@fukict/list</code>{' '}
                package，提供开箱即用的高性能列表组件。详见项目根目录的{' '}
                <code class="text-xs">DYNAMIC_LIST_DESIGN.md</code>。
              </p>
            </div>
          </div>
        </DemoBox>
      </div>
    );
  }
}
