# @fukict/babel-preset 使用示例

## 基础示例

### 1. 简单组件

**输入代码**：

```tsx
const Greeting = ({ name }) => <div>Hello {name}</div>;

const App = () => {
  return <Greeting name="World" />;
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const Greeting = defineFukict(({ name }) =>
  hyperscript('div', null, 'Hello ', name),
);

const App = defineFukict(() => {
  return hyperscript(Greeting, { name: 'World' });
});

// 开发模式还会注入
Greeting.displayName = 'Greeting';
App.displayName = 'App';
```

### 2. 带事件的组件

**输入代码**：

```tsx
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button on:click={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const Counter = defineFukict(() => {
  const [count, setCount] = useState(0);

  return hyperscript(
    'div',
    null,
    hyperscript('p', null, 'Count: ', count),
    hyperscript(
      'button',
      { 'on:click': () => setCount(count + 1) },
      'Increment',
    ),
  );
});

Counter.displayName = 'Counter';
```

### 3. 嵌套组件

**输入代码**：

```tsx
const Button = ({ children, on:click }) => (
  <button on:click={on:click}>
    {children}
  </button>
);

const App = () => {
  const handleClick = () => alert('Clicked!');

  return (
    <div>
      <Button on:click={handleClick}>
        Click Me
      </Button>
    </div>
  );
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const Button = defineFukict(({ children, 'on:click': onClick }) =>
  hyperscript('button', { 'on:click': onClick }, children),
);

const App = defineFukict(() => {
  const handleClick = () => alert('Clicked!');

  return hyperscript(
    'div',
    null,
    hyperscript(Button, { 'on:click': handleClick }, 'Click Me'),
  );
});

Button.displayName = 'Button';
App.displayName = 'App';
```

## 高级示例

### 4. 列表渲染

**输入代码**：

```tsx
const TodoList = ({ items }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const TodoList = defineFukict(({ items }) => {
  return hyperscript(
    'ul',
    null,
    items.map(item => hyperscript('li', { key: item.id }, item.text)),
  );
});

TodoList.displayName = 'TodoList';
```

### 5. 条件渲染

**输入代码**：

```tsx
const Alert = ({ type, message, show }) => {
  if (!show) return null;

  return <div class={`alert alert-${type}`}>{message}</div>;
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const Alert = defineFukict(({ type, message, show }) => {
  if (!show) return null;

  return hyperscript('div', { class: `alert alert-${type}` }, message);
});

Alert.displayName = 'Alert';
```

### 6. Fragment 使用

**输入代码**：

```tsx
const Header = () => {
  return (
    <>
      <h1>Title</h1>
      <nav>Navigation</nav>
    </>
  );
};
```

**编译输出**：

```javascript
import { Fragment, defineFukict, hyperscript } from '@fukict/basic';

const Header = defineFukict(() => {
  return hyperscript(
    Fragment,
    null,
    hyperscript('h1', null, 'Title'),
    hyperscript('nav', null, 'Navigation'),
  );
});

Header.displayName = 'Header';
```

### 7. 复杂属性

**输入代码**：

```tsx
const StyledDiv = () => {
  return (
    <div
      class="container"
      style={{ color: 'red', fontSize: 16 }}
      data-test-id="styled-div"
    >
      Content
    </div>
  );
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const StyledDiv = defineFukict(() => {
  return hyperscript(
    'div',
    {
      class: 'container',
      style: { color: 'red', fontSize: 16 },
      'data-test-id': 'styled-div',
    },
    'Content',
  );
});

StyledDiv.displayName = 'StyledDiv';
```

## 特殊场景

### 8. @nofukict 标记

**输入代码**：

```tsx
/** @nofukict */
const createIcon = (name: string) => <i class={`icon-${name}`} />;

const App = () => {
  return (
    <div>
      {createIcon('home')}
      {createIcon('settings')}
    </div>
  );
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

// 不会被 defineFukict 包裹
const createIcon = name => hyperscript('i', { class: `icon-${name}` });

const App = defineFukict(() => {
  return hyperscript('div', null, createIcon('home'), createIcon('settings'));
});

App.displayName = 'App';
```

### 9. 类组件（已包裹 Fukict）

**输入代码**：

```tsx
class Counter extends Fukict {
  state = { count: 0 };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button on:click={this.increment}>Increment</button>
      </div>
    );
  }
}
```

**编译输出**：

```javascript
import { hyperscript } from '@fukict/basic';

// 类组件不需要 defineFukict，已经继承 Fukict
class Counter extends Fukict {
  state = { count: 0 };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return hyperscript(
      'div',
      null,
      hyperscript('p', null, 'Count: ', this.state.count),
      hyperscript('button', { 'on:click': this.increment }, 'Increment'),
    );
  }
}
```

### 10. 导出组件

**输入代码**：

```tsx
export const Button = ({ children, on:click }) => (
  <button on:click={on:click}>
    {children}
  </button>
);

export default ({ title }) => (
  <div>
    <h1>{title}</h1>
  </div>
);
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

export const Button = defineFukict(({ children, 'on:click': onClick }) =>
  hyperscript('button', { 'on:click': onClick }, children),
);

Button.displayName = 'Button';

const _default = defineFukict(({ title }) =>
  hyperscript('div', null, hyperscript('h1', null, title)),
);

_default.displayName = '_default';

export default _default;
```

## 不会被转换的场景

### 11. 小写函数名

**输入代码**：

```tsx
// 不会被识别为组件（小写开头）
const helper = () => <div>Helper</div>;

const App = () => {
  return <div>{helper()}</div>;
};
```

**编译输出**：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

// 不会被 defineFukict 包裹
const helper = () => hyperscript('div', null, 'Helper');

const App = defineFukict(() => {
  return hyperscript('div', null, helper());
});

App.displayName = 'App';
```

### 12. 函数声明

**输入代码**：

```tsx
// 函数声明不支持自动包裹
function Greeting({ name }) {
  return <div>Hello {name}</div>;
}
```

**编译输出**：

```javascript
import { hyperscript } from '@fukict/basic';

// 不会被 defineFukict 包裹
function Greeting({ name }) {
  return hyperscript('div', null, 'Hello ', name);
}
```

**建议改为箭头函数**：

```tsx
const Greeting = ({ name }) => {
  return <div>Hello {name}</div>;
};
```

## 完整应用示例

### 13. Todo 应用

**输入代码**：

```tsx
const TodoItem = ({ text, completed, on:toggle, on:remove }) => (
  <li class={completed ? 'completed' : ''}>
    <input
      type="checkbox"
      checked={completed}
      on:change={on:toggle}
    />
    <span>{text}</span>
    <button on:click={on:remove}>Delete</button>
  </li>
);

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div class="todo-app">
      <h1>Todo List</h1>
      <div>
        <input
          value={input}
          on:input={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
        />
        <button on:click={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            text={todo.text}
            completed={todo.completed}
            on:toggle={() => toggleTodo(todo.id)}
            on:remove={() => removeTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};
```

**编译输出**（简化）：

```javascript
import { defineFukict, hyperscript } from '@fukict/basic';

const TodoItem = defineFukict(
  ({ text, completed, 'on:toggle': onToggle, 'on:remove': onRemove }) =>
    hyperscript(
      'li',
      { class: completed ? 'completed' : '' },
      hyperscript('input', {
        type: 'checkbox',
        checked: completed,
        'on:change': onToggle,
      }),
      hyperscript('span', null, text),
      hyperscript('button', { 'on:click': onRemove }, 'Delete'),
    ),
);

const TodoApp = defineFukict(() => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // ... 逻辑代码 ...

  return hyperscript(
    'div',
    { class: 'todo-app' },
    hyperscript('h1', null, 'Todo List'),
    // ... 其他元素 ...
  );
});

TodoItem.displayName = 'TodoItem';
TodoApp.displayName = 'TodoApp';
```

## 与构建工具集成

### 14. Vite 项目

**vite.config.ts**：

```typescript
import { transformSync } from '@babel/core';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'fukict-babel',
      transform(code, id) {
        if (!/\.(tsx|jsx)$/.test(id)) return;

        const result = transformSync(code, {
          presets: ['@fukict/babel-preset'],
          filename: id,
        });

        return {
          code: result.code,
          map: result.map,
        };
      },
    },
  ],
});
```

**src/main.tsx**：

```tsx
import { render } from '@fukict/basic';

const App = () => (
  <div>
    <h1>Hello Fukict!</h1>
  </div>
);

render(<App />, document.getElementById('app')!);
```

### 15. Webpack 项目

**webpack.config.js**：

```javascript
module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@fukict/babel-preset'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
};
```

**src/index.tsx**：

```tsx
import { render } from '@fukict/basic';

const App = () => (
  <div>
    <h1>Hello Fukict!</h1>
  </div>
);

render(<App />, document.getElementById('root')!);
```

## TypeScript 配置

### 16. 完整 TypeScript 设置

**tsconfig.json**：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

**src/types/jsx.d.ts**（可选）：

```typescript
import { VNode } from '@fukict/basic';

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
```

---

**文档状态**：设计阶段
**最后更新**：2025-10-11
