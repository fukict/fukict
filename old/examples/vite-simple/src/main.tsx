import { render } from '@fukict/runtime';
import type { VNode } from '@fukict/runtime';

import './style.css';

// ===== 示例 1: 基础 JSX 渲染 =====

const BasicExample = () => (
  <div class="example">
    <h2>Basic JSX Rendering</h2>
    <p>This is a simple paragraph rendered by Fukict runtime.</p>
    <ul>
      <li>Runtime 仅负责初次渲染</li>
      <li>VNode 到 DOM 的转换</li>
      <li>没有状态管理，没有更新</li>
    </ul>
  </div>
);

// ===== 示例 2: 函数组件 =====

const Greeting = ({ name }: { name: string }): VNode => (
  <div class="greeting">
    <h3>Hello, {name}!</h3>
    <p>这是一个简单的函数组件</p>
  </div>
);

const FunctionComponentExample = () => (
  <div class="example">
    <h2>Function Component</h2>
    <Greeting name="Fukict" />
    <Greeting name="World" />
  </div>
);

// ===== 示例 2: 事件处理 =====

let clickCount = 0;

const EventExample = () => (
  <div class="example">
    <h2>Event Handling</h2>
    <p>
      <span id="message">Click count: {clickCount}</span>
    </p>
    <button
      on:click={() => {
        clickCount++;
        const msgEl = document.getElementById('message');
        if (msgEl) {
          msgEl.textContent = `Click count: ${clickCount}`;
        }
      }}
    >
      Click Me!
    </button>
    <p class="note">注意：这是手动 DOM 操作，runtime 不提供更新机制</p>
  </div>
);

// ===== 示例 3: 条件渲染 =====

const showAdvanced = false;

const ConditionalExample = () => (
  <div class="example">
    <h2>Conditional Rendering</h2>
    <p>Basic content always visible</p>
    {showAdvanced && (
      <div class="advanced">
        <p>This is advanced content (hidden by default)</p>
      </div>
    )}
  </div>
);

// ===== 示例 4: 列表渲染 =====

const items = ['Apple', 'Banana', 'Cherry', 'Date'];

const ListExample = () => (
  <div class="example">
    <h2>List Rendering</h2>
    <ul>
      {items.map(item => (
        <li>{item}</li>
      ))}
    </ul>
  </div>
);

// ===== 示例 5: 样式和类名 =====

const StyleExample = () => (
  <div class="example">
    <h2>Styles and Classes</h2>
    <div
      class="styled-box"
      style="background: #646cff; color: white; padding: 1rem; border-radius: 4px;"
    >
      <p>Inline styles work!</p>
    </div>
    <div class="styled-box success">
      <p>CSS classes work too!</p>
    </div>
  </div>
);

// ===== 示例 6: ref 回调 =====

let inputRef: HTMLInputElement | null = null;

const RefExample = () => (
  <div class="example">
    <h2>Ref Callbacks</h2>
    <input
      type="text"
      placeholder="Type something..."
      ref={el => {
        inputRef = el as HTMLInputElement;
        console.log('[Ref] Input element mounted:', el);
      }}
    />
    <button
      on:click={() => {
        if (inputRef) {
          alert(`Input value: ${inputRef.value}`);
        }
      }}
    >
      Get Input Value
    </button>
  </div>
);

// ===== 示例 7: 表单示例 =====

const FormExample = () => (
  <div class="example">
    <h2>Form Example</h2>
    <form
      on:submit={e => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        alert(`Form data: ${JSON.stringify(data, null, 2)}`);
      }}
    >
      <div class="form-group">
        <label>Name:</label>
        <input type="text" name="name" required />
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" name="email" required />
      </div>
      <div class="form-group">
        <label>Message:</label>
        <textarea name="message" rows={4}></textarea>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
);

// ===== 主应用 =====

const App = () => (
  <div class="app">
    <header>
      <h1>Fukict Runtime Examples</h1>
      <p class="subtitle">纯 Runtime 层测试 - 无状态管理，无更新机制</p>
    </header>

    <main>
      <BasicExample />
      <FunctionComponentExample />
      <EventExample />
      <ConditionalExample />
      <ListExample />
      <StyleExample />
      <RefExample />
      <FormExample />
    </main>

    <footer>
      <p>
        <strong>说明:</strong> 这些示例仅演示 @fukict/runtime 的基础渲染能力。
        如需状态管理和组件更新，请使用 @fukict/widget。
      </p>
    </footer>
  </div>
);

// 渲染到 DOM
const container = document.getElementById('app');

if (container) {
  render(<App />, { container, replace: true });
  console.log('✅ App rendered successfully!');
} else {
  console.error('❌ Container #app not found');
}
