import { Counter } from './components/Counter';
import { TodoApp } from './components/TodoApp';

export function App() {
  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="logo">🌟</div>
        <h1 className="title">Vanilla DOM</h1>
        <p className="subtitle">使用 Hyperscript + Babel 插件的演示</p>
      </div>

      {/* Counter Section */}
      <div className="demo-section">
        <h2 className="demo-title">🎯 计数器演示</h2>
        <Counter />
      </div>

      {/* Todo Section */}
      <div className="demo-section">
        <h2 className="demo-title">📝 Todo 应用演示</h2>
        <TodoApp />
      </div>

      {/* Config Info */}
      <div className="config-info">
        <h3 className="config-title">⚙️ 配置信息</h3>
        <p>
          本演示使用了 <strong>hyperscript</strong> 函数， 通过{' '}
          <code>@vanilla-dom/babel-plugin</code> 将 JSX 转换为 hyperscript
          调用。
        </p>

        <div className="config-code">
          {`// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@vanilla-dom/core"
  }
}`}
        </div>

        <div className="config-code">
          {`// vite.config.ts
export default defineConfig({
  plugins: [
    // Babel 插件处理 JSX → hyperscript 转换
    vanillaDomBabelPlugin()
  ]
})`}
        </div>
      </div>
    </div>
  );
}
