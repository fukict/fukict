import { RouteWidget } from '@fukict/router';

/**
 * User 页面 - 展示动态路由参数
 */
export class User extends RouteWidget {
  componentDidMount() {
    console.log('User page mounted');
    console.log('User ID:', this.params.id);
  }

  componentDidUpdate() {
    console.log('User page updated');
    console.log('New User ID:', this.params.id);
  }

  componentWillUnmount() {
    console.log('User page unmounting');
  }

  render() {
    const userId = this.params.id || 'unknown';

    return (
      <div className="page-user">
        <div className="user-header">
          <h1>👤 用户详情</h1>
          <p style="color: #666; margin-top: 10px;">展示动态路由参数的使用</p>
        </div>

        <div className="user-content">
          <div className="user-card">
            <div className="user-avatar">{userId.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <h2>用户 #{userId}</h2>
              <p className="user-meta">这是一个动态路由示例页面</p>
            </div>
          </div>

          <div className="route-info">
            <h3>📋 路由信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>用户 ID (params.id):</strong>
                <span>{userId}</span>
              </div>
              <div className="info-item">
                <strong>路由路径:</strong>
                <span>{this.route.path}</span>
              </div>
              <div className="info-item">
                <strong>完整路径:</strong>
                <span>{this.route.fullPath}</span>
              </div>
            </div>
          </div>

          <div className="navigation-demo">
            <h3>🔄 切换用户示例</h3>
            <p style="color: #666; margin-bottom: 15px;">
              点击下面的按钮查看路由参数变化（注意控制台输出）
            </p>
            <div className="nav-buttons">
              <button
                on:click={() => {
                  this.router.push('user', { id: '1' });
                }}
              >
                用户 #1
              </button>
              <button
                on:click={() => {
                  this.router.push('user', { id: '42' });
                }}
              >
                用户 #42
              </button>
              <button
                on:click={() => {
                  this.router.push('user', { id: '999' });
                }}
              >
                用户 #999
              </button>
            </div>
          </div>

          <div className="back-navigation">
            <button
              className="back-btn"
              on:click={() => {
                this.router.back();
              }}
            >
              ← 返回上一页
            </button>
            <button
              className="home-btn"
              on:click={() => {
                this.router.push('home');
              }}
            >
              🏠 返回首页
            </button>
          </div>
        </div>

        <style>{`
          .page-user {
            max-width: 800px;
            margin: 0 auto;
          }
          .user-header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 40px;
          }
          .user-header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin: 0;
          }
          .user-content {
            display: flex;
            flex-direction: column;
            gap: 30px;
          }
          .user-card {
            display: flex;
            align-items: center;
            gap: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
          .user-avatar {
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-weight: bold;
            flex-shrink: 0;
          }
          .user-info h2 {
            margin: 0 0 10px 0;
            font-size: 2rem;
          }
          .user-meta {
            margin: 0;
            opacity: 0.9;
          }
          .route-info {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
          }
          .route-info h3 {
            color: #2c3e50;
            margin: 0 0 20px 0;
          }
          .info-grid {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: white;
            border-radius: 6px;
          }
          .info-item strong {
            color: #2c3e50;
          }
          .info-item span {
            color: #3498db;
            font-weight: 500;
          }
          .navigation-demo {
            background: #fff3cd;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
          }
          .navigation-demo h3 {
            color: #856404;
            margin: 0 0 15px 0;
          }
          .nav-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          .nav-buttons button {
            padding: 10px 20px;
            background: #ffc107;
            color: #856404;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          .nav-buttons button:hover {
            background: #ffb300;
            transform: translateY(-2px);
          }
          .back-navigation {
            display: flex;
            gap: 15px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
          }
          .back-btn, .home-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          .back-btn {
            background: #6c757d;
            color: white;
          }
          .back-btn:hover {
            background: #5a6268;
          }
          .home-btn {
            background: #28a745;
            color: white;
          }
          .home-btn:hover {
            background: #218838;
          }
        `}</style>
      </div>
    );
  }
}
