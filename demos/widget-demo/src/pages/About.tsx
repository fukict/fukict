import { RouteWidget } from '@fukict/router';

/**
 * 关于页面 - 展示路由信息和框架介绍
 */
export class About extends RouteWidget {
  componentDidMount() {
    console.log('About page mounted');
    console.log('Current route:', this.route);
  }

  componentWillUnmount() {
    console.log('About page unmounting');
  }

  render() {
    return (
      <div className="page-about">
        <div className="about-header">
          <h1>🎯 关于 Fukict Router</h1>
          <p style="color: #666; font-size: 1.1rem; margin-top: 10px;">
            轻量级路由系统，专为 Fukict 框架设计
          </p>
        </div>

        <div className="about-section">
          <h2>📋 当前路由信息</h2>
          <div className="info-card">
            <div className="info-item">
              <strong>路由名称:</strong> {this.route.name}
            </div>
            <div className="info-item">
              <strong>路径:</strong> {this.route.path}
            </div>
            <div className="info-item">
              <strong>完整路径:</strong> {this.route.fullPath}
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>✨ 核心特性</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🚀 类型安全</h3>
              <p>完整的 TypeScript 支持，路由定义、参数、导航全部类型化</p>
            </div>
            <div className="feature-card">
              <h3>🎨 Widget 集成</h3>
              <p>路由组件必须继承 RouteWidget，提供完整的生命周期管理</p>
            </div>
            <div className="feature-card">
              <h3>⚡ 轻量高效</h3>
              <p>核心代码精简，零依赖（除 fukict runtime 和 widget）</p>
            </div>
            <div className="feature-card">
              <h3>🔒 导航守卫</h3>
              <p>支持 beforeEach、afterEach 全局守卫和路由级守卫</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>🛠️ RouteWidget 基类</h2>
          <div className="code-section">
            <pre>{`export abstract class RouteWidget<Props, R> extends Widget<Props> {
  // 路由上下文 (由 RouterView 注入)
  route!: RouteContext<R>;

  // 便捷访问
  get router(): R
  get params(): Record<string, string>
  get query(): Record<string, string>
  get meta(): Record<string, any>
}`}</pre>
          </div>
        </div>

        <div className="about-section">
          <h2>📚 使用示例</h2>
          <div className="code-section">
            <pre>{`// 1. 定义路由
const routes = defineRoutes({
  home: { path: '/', component: Home },
  about: { path: '/about', component: About },
  user: { path: '/user/:id', component: User }
});

// 2. 创建路由器
const router = createRouter({
  routes,
  mode: 'hash'
});

// 3. 在组件中使用
class User extends RouteWidget {
  render() {
    const userId = this.params.id;
    return <div>User ID: {userId}</div>;
  }
}`}</pre>
          </div>
        </div>

        <style>{`
          .page-about {
            max-width: 1000px;
            margin: 0 auto;
          }
          .about-header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 40px;
          }
          .about-header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin: 0;
          }
          .about-section {
            margin-bottom: 40px;
          }
          .about-section h2 {
            color: #34495e;
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin-bottom: 20px;
          }
          .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #17a2b8;
          }
          .info-item {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-item strong {
            color: #2c3e50;
            margin-right: 10px;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }
          .feature-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
          }
          .feature-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          .feature-card h3 {
            color: #3498db;
            margin: 0 0 10px 0;
            font-size: 1.2rem;
          }
          .feature-card p {
            color: #666;
            margin: 0;
            line-height: 1.6;
          }
          .code-section {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
          }
          .code-section pre {
            margin: 0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }
}
