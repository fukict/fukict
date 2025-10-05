import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';
import { updateDOM } from '@fukict/runtime';
import { createState } from '@fukict/state';

class SelectorDemo extends Widget {
  private state = createState({
    todos: [
      { id: 1, text: '学习 Fukict', done: false },
      { id: 2, text: '构建应用', done: false },
      { id: 3, text: '部署上线', done: true },
    ],
  });

  // 创建派生选择器
  private activeTodos = this.state.select(s => s.todos.filter(t => !t.done));
  private completedTodos = this.state.select(s => s.todos.filter(t => t.done));

  onMounted() {
    // 订阅派生值的变化
    this.activeTodos.subscribe(() => {
      console.log('Active todos changed');
      this.forceUpdate();
    });

    this.completedTodos.subscribe(() => {
      console.log('Completed todos changed');
      this.forceUpdate();
    });
  }

  render() {
    return (
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-blue-50 rounded-lg">
            <h4 class="font-semibold text-blue-900 mb-2">
              未完成 ({this.activeTodos.value.length})
            </h4>
            <div class="space-y-2">
              {this.activeTodos.value.map(todo => (
                <div key={todo.id} class="text-sm text-blue-800">
                  • {todo.text}
                </div>
              ))}
            </div>
          </div>

          <div class="p-4 bg-green-50 rounded-lg">
            <h4 class="font-semibold text-green-900 mb-2">
              已完成 ({this.completedTodos.value.length})
            </h4>
            <div class="space-y-2">
              {this.completedTodos.value.map(todo => (
                <div key={todo.id} class="text-sm text-green-800 line-through">
                  • {todo.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          on:click={() => this.toggleFirst()}
          class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          切换第一个任务状态
        </button>
      </div>
    );
  }

  private toggleFirst() {
    const todos = this.state.get('todos');
    if (todos.length > 0) {
      const updated = [...todos];
      updated[0] = { ...updated[0], done: !updated[0].done };
      this.state.set('todos', updated);
    }
  }

  private forceUpdate() {
    if (!this.vnode || !this.root) return;
    const newVNode = this.render();
    updateDOM(this.vnode, newVNode, this.root);
    this.vnode = newVNode;
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="04. 派生选择器"
      description="使用 select 创建计算属性，自动响应依赖变化"
    >
      <DemoCard title="运行效果">
        <SelectorDemo />
      </DemoCard>
      </ExampleLayout>
    );
  }
}
