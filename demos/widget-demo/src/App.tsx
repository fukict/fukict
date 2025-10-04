import { RouterLink, RouterView } from '@fukict/router';
import type { Router } from '@fukict/router';
import { defineWidget } from '@fukict/widget';

interface AppProps {
  router: Router;
}

// 演示应用组件
export const App = defineWidget<AppProps>(({ router }) => {
  return (
    <div className="demo-app">
      <header className="app-header">
        <div className="header-content">
          <h1>🚀 Fukict Widget + Router Demo</h1>
          <p>展示 Widget 编码范式和路由系统的完整示例</p>
        </div>
      </header>

      <nav className="app-nav">
        <RouterLink router={router} to="/" activeClass="nav-link-active">
          🏠 首页
        </RouterLink>
        <RouterLink router={router} to="/about" activeClass="nav-link-active">
          📖 关于
        </RouterLink>
        <RouterLink router={router} to="/demos" activeClass="nav-link-active">
          🎨 Demo 列表
        </RouterLink>
        <RouterLink
          router={router}
          to={{ name: 'user', params: { id: '123' } }}
          activeClass="nav-link-active"
        >
          👤 用户示例
        </RouterLink>
      </nav>

      <main className="app-main">
        <RouterView router={router} />
      </main>

      <footer className="app-footer">
        <p>
          Powered by <strong>Fukict</strong> - 轻量级 DOM 渲染库 +{' '}
          <strong>Fukict Router</strong>
        </p>
      </footer>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .demo-app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .app-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .header-content h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .header-content p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .app-nav {
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 0;
          display: flex;
          justify-content: center;
          gap: 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .app-nav a {
          padding: 16px 28px;
          text-decoration: none;
          color: #555;
          font-weight: 500;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          display: inline-block;
        }

        .app-nav a:hover {
          background: #f8f9fa;
          color: #667eea;
        }

        .app-nav a.router-link-active {
          color: #667eea;
          border-bottom-color: #667eea;
          background: #f8f9fa;
        }

        .app-main {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .app-footer {
          background: #2c3e50;
          color: white;
          text-align: center;
          padding: 20px;
          margin-top: auto;
        }

        .app-footer p {
          margin: 0;
          opacity: 0.9;
        }

        .app-footer strong {
          color: #3498db;
        }

        /* 通用样式 */
        .demo-section {
          margin-bottom: 40px;
        }

        .demo-section h2 {
          color: #34495e;
          border-left: 4px solid #3498db;
          padding-left: 15px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
});
