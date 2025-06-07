import { Counter } from './components/Counter';
import { TodoApp } from './components/TodoApp';

export function App() {
  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="logo">🚀</div>
        <h1 className="title">Vanilla DOM</h1>
        <p className="subtitle">使用 Rsbuild + Babel 插件的超快速构建演示</p>
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
        <h3 className="config-title">⚡️ Rsbuild 配置信息</h3>
        <p>
          本演示使用了 <strong>Rsbuild</strong> 作为构建工具， 通过{' '}
          <code>@rsbuild/plugin-babel</code> 集成{' '}
          <code>@vanilla-dom/babel-plugin</code>， 实现极速的 JSX 到 hyperscript
          转换。
        </p>

        <div className="config-code">
          {`// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginBabel } from '@rsbuild/plugin-babel'

export default defineConfig({
  plugins: [
    pluginBabel({
      babelLoaderOptions: {
        plugins: [
          '@babel/plugin-syntax-jsx',
          '@vanilla-dom/babel-plugin'
        ]
      }
    })
  ]
})`}
        </div>

        <div className="config-code">
          {`// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@vanilla-dom/core"
  }
}`}
        </div>

        <p>
          🚀 <strong>Rsbuild 优势</strong>：基于 Rust 的极速构建，比传统工具快
          5-10 倍！
        </p>
      </div>
    </div>
  );
}
