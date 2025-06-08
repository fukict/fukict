import { Counter } from './Counter';
import { render } from '@vanilla-dom/core';

// 简单的未注册函数组件，用于测试新的处理逻辑
function SimpleGreeting({ name }: { name: string }) {
  return <p>👋 Hello, {name}! 这是一个未注册的函数组件。</p>;
}

// ref 功能演示组件
function RefDemo() {
  let inputElement: HTMLInputElement | null = null;

  const handleRef = (el: Element | null) => {
    if (el) {
      inputElement = el as HTMLInputElement;
      console.log('✅ Ref 回调被调用:', el);
    }
  };

  const focusInput = () => {
    if (inputElement) {
      inputElement.focus();
      inputElement.style.border = '2px solid #4299e1';
    }
  };

  const clearInput = () => {
    if (inputElement) {
      inputElement.value = '';
      inputElement.style.border = '';
    }
  };

  return (
    <div className="demo-section">
      <h3 className="demo-title">Ref 功能演示</h3>
      <p>这个演示展示了新的 ref 功能:</p>

      <div style="margin: 15px 0;">
        <input
          ref={handleRef}
          type="text"
          placeholder="使用 ref 获取的输入框"
          style="padding: 8px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px;"
        />
        <button
          className="btn"
          on:click={focusInput}
          style="margin-right: 5px;"
        >
          聚焦输入框
        </button>
        <button className="btn" on:click={clearInput}>
          清空输入框
        </button>
      </div>

      <p style="color: #666; font-size: 0.9rem;">
        ✅ 使用 ref 回调获取 DOM 元素引用，可以直接操作元素
      </p>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <div className="header">
        <div className="logo">🚀</div>
        <h1 className="title">Vanilla DOM + Webpack</h1>
        <p className="subtitle">
          使用 @vanilla-dom/babel-plugin + @vanilla-dom/core 构建
        </p>
      </div>

      <div className="demo-section">
        <h3 className="demo-title">基础功能演示</h3>
        <p>这个演示展示了:</p>
        <ul>
          <li>JSX 语法支持 ✅</li>
          <li>Babel 插件转换 ✅</li>
          <li>事件处理 ✅</li>
          <li>组件化开发 ✅</li>
          <li>Webpack 构建 ✅</li>
          <li>TypeScript 支持 ✅</li>
          <li>未注册函数组件支持 ✅</li>
          <li>Ref 功能支持 ✅</li>
        </ul>
        <button
          className="btn"
          on:click={() => alert('Hello from Vanilla DOM!')}
        >
          测试事件处理
        </button>

        {/* 测试未注册的函数组件 */}
        <SimpleGreeting name="vanilla-dom 用户" />
      </div>

      {/* 新增：Ref 功能演示 */}
      <RefDemo />

      <Counter />

      <div className="config-info">
        <h4 className="config-title">📋 配置信息</h4>
        <p>这个演示使用了以下配置:</p>
        <div className="config-code">
          {`// webpack.config.js
module: {
  rules: [
    {
      test: /\\.(ts|tsx)$/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-typescript"
          ],
          plugins: [
            "@vanilla-dom/babel-plugin"
          ]
        }
      }
    }
  ]
}`}
        </div>
      </div>
    </div>
  );
}

render(<App />, { container: document.getElementById('app')! });
