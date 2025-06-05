import { Counter } from './Counter';
import { render } from '@vanilla-dom/core';

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
        </ul>
        <button
          className="btn"
          on:click={() => alert('Hello from Vanilla DOM!')}
        >
          测试事件处理
        </button>
      </div>

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

// 临时测试events
const testButton = (
  <button on:click={() => console.log('测试点击')}>Test Events</button>
);

render(<App />, { container: document.getElementById('app')! });
