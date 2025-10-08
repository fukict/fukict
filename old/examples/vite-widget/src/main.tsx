import { render } from '@fukict/widget';

import './style.css';

import { Counter } from './examples/Counter';
import { Greeting } from './examples/Greeting';
import { TodoList } from './examples/TodoList';
import { Dialog, DialogHeader, DialogFooter } from './examples/DialogSlots';
import { RefsDemo } from './examples/RefsDemo';

const App = () => (
  <div class="app">
    <header>
      <h1>Fukict Widget Examples</h1>
      <p class="subtitle">Widget 层测试 - 类组件、函数组件、Refs、Slots</p>
    </header>

    <main>
      {/* 类组件 - 状态管理 */}
      <Counter initialCount={0} />

      {/* 函数组件 - 轻量级 */}
      <Greeting name="Fukict" color="#42b983" />

      {/* 类组件 - 复杂交互 */}
      <TodoList />

      {/* Refs 演示 - 父子组件通信 */}
      <RefsDemo />

      {/* Slots 演示 - 默认插槽 */}
      <Dialog title="默认对话框">
        <p>这是默认对话框的内容</p>
        <p>只使用了默认 slot，header 和 footer 使用组件内置的</p>
      </Dialog>

      {/* Slots 演示 - 具名插槽（DOM 元素）*/}
      <Dialog title="自定义对话框">
        <h3 fukict:slot="header">🎉 自定义标题</h3>
        <div>
          <p>这是自定义对话框的内容</p>
          <ul>
            <li>Header 和 Footer 都是 DOM 元素</li>
            <li>通过 fukict:slot 指定插槽名称</li>
          </ul>
        </div>
        <div fukict:slot="footer" style="text-align: right;">
          <button style="margin-right: 8px;">保存</button>
          <button>关闭</button>
        </div>
      </Dialog>

      {/* Slots 演示 - 具名插槽（Widget 组件）*/}
      <Dialog title="Widget 插槽">
        <DialogHeader fukict:slot="header" title="📦 Widget 作为插槽" />
        <div>
          <p>Header 和 Footer 都是 Widget 组件</p>
          <p>演示了 Widget 组件作为 slot 的用法</p>
        </div>
        <DialogFooter fukict:slot="footer" />
      </Dialog>
    </main>

    <footer>
      <p>
        <strong>说明:</strong> Widget 层提供状态管理、生命周期、Refs、Slots
        等高级特性。
      </p>
    </footer>
  </div>
);

const container = document.getElementById('app');
if (container) {
  render(<App />, { container, replace: true });
}

console.log('✅ Widget examples mounted successfully!');
