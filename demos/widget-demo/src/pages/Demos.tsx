import { RouteWidget } from '@fukict/router';

/**
 * Demos 页面 - 展示 Demo 列表
 */
export class Demos extends RouteWidget {
  componentDidMount() {
    console.log('Demos page mounted');
    console.log('Query params:', this.query);
  }

  render() {
    const demos = [
      {
        id: 1,
        title: 'Counter 组件',
        description: 'Widget 类组件示例，展示状态管理和生命周期',
        icon: '📊',
      },
      {
        id: 2,
        title: 'TodoList 组件',
        description: '待办列表，展示复杂状态管理和事件处理',
        icon: '📝',
      },
      {
        id: 3,
        title: 'FormWidget 组件',
        description: '表单组件，展示表单处理和验证',
        icon: '📋',
      },
    ];

    return (
      <div className="page-demos">
        <div className="demos-header">
          <h1>🎨 组件演示列表</h1>
          <p style="color: #666; margin-top: 10px;">
            探索 Fukict Widget 的各种组件示例
          </p>
        </div>

        <div className="demos-list">
          {demos.map(demo => (
            <div key={demo.id} className="demo-item">
              <div className="demo-icon">{demo.icon}</div>
              <div className="demo-content">
                <h3>{demo.title}</h3>
                <p>{demo.description}</p>
              </div>
              <button
                className="demo-btn"
                on:click={() => {
                  this.router.push('home');
                }}
              >
                查看示例
              </button>
            </div>
          ))}
        </div>

        <div className="query-info">
          <h2>🔍 查询参数测试</h2>
          <p>
            当前查询参数:{' '}
            {Object.keys(this.query).length > 0
              ? JSON.stringify(this.query)
              : '无'}
          </p>
          <div className="query-actions">
            <button
              on:click={() => {
                this.router.push('demos', undefined, { filter: 'all' });
              }}
            >
              添加 filter=all
            </button>
            <button
              on:click={() => {
                this.router.push('demos', undefined, {
                  filter: 'widget',
                  sort: 'name',
                });
              }}
            >
              添加多个参数
            </button>
            <button
              on:click={() => {
                this.router.push('demos');
              }}
            >
              清除参数
            </button>
          </div>
        </div>

        <style>{`
          .page-demos {
            max-width: 1000px;
            margin: 0 auto;
          }
          .demos-header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 40px;
          }
          .demos-header h1 {
            color: #2c3e50;
            font-size: 2.5rem;
            margin: 0;
          }
          .demos-list {
            display: grid;
            gap: 20px;
            margin-bottom: 40px;
          }
          .demo-item {
            display: flex;
            align-items: center;
            gap: 20px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.3s ease;
          }
          .demo-item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          .demo-icon {
            font-size: 3rem;
            flex-shrink: 0;
          }
          .demo-content {
            flex: 1;
          }
          .demo-content h3 {
            color: #2c3e50;
            margin: 0 0 10px 0;
          }
          .demo-content p {
            color: #666;
            margin: 0;
            line-height: 1.6;
          }
          .demo-btn {
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s ease;
          }
          .demo-btn:hover {
            background: #2980b9;
          }
          .query-info {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            border-left: 4px solid #9b59b6;
          }
          .query-info h2 {
            color: #2c3e50;
            margin: 0 0 15px 0;
          }
          .query-info p {
            color: #666;
            margin: 0 0 20px 0;
            font-size: 1rem;
          }
          .query-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          .query-actions button {
            padding: 8px 16px;
            background: #9b59b6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s ease;
          }
          .query-actions button:hover {
            background: #8e44ad;
          }
        `}</style>
      </div>
    );
  }
}
