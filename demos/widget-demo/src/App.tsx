import { createWidget } from '@vanilla-dom/widget';

export const App = createWidget(() => {
  return (
    <div className="demo-app">
      <div className="demo-section">
        <h2>🔢 简易函数范式演示</h2>
        <p>这是一个简易函数组件的示例，带有交互功能</p>
        <div className="demo-card">
          {/* 计数器组件将在挂载后渲染 */}
          <div id="counter-container"></div>
        </div>
      </div>

      <div className="demo-section">
        <h2>📝 Todo List 演示</h2>
        <p>展示动态列表操作和状态管理</p>
        <div className="demo-card">
          {/* TodoList 组件将在挂载后渲染 */}
          <div id="todolist-container"></div>
        </div>
      </div>

      <div className="demo-section">
        <h2>📋 表单处理演示</h2>
        <p>展示表单提交和重置功能</p>
        <div className="demo-card">
          {/* FormWidget 组件将在挂载后渲染 */}
          <div id="form-container"></div>
        </div>
      </div>

      <style>{`
        .demo-app {
          width: 100%;
        }

        .demo-section {
          margin-bottom: 40px;
        }

        .demo-section h2 {
          color: #333;
          font-size: 1.8rem;
          margin-bottom: 10px;
          border-bottom: 3px solid #4facfe;
          padding-bottom: 8px;
        }

        .demo-section p {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .demo-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 25px;
          background: #fafafa;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .counter-example,
        .todo-example,
        .form-example {
          background: white;
          border-radius: 8px;
          padding: 20px;
        }

        .counter-example h3,
        .todo-example h3,
        .form-example h3 {
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .counter-display {
          text-align: center;
          margin: 30px 0;
        }

        .count-value {
          font-size: 3rem;
          font-weight: bold;
          color: #4facfe;
          border-radius: 50%;
          display: inline-block;
          width: 100px;
          height: 100px;
          line-height: 100px;
        }

        .counter-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .todo-stats {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: #666;
        }

        .todo-add {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .todo-input {
          flex: 1;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        .todo-input:focus {
          outline: none;
          border-color: #4facfe;
        }

        .todo-items {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 250px;
          overflow-y: auto;
        }

        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: #f9f9f9;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .todo-item:hover {
          background: #f0f0f0;
        }

        .todo-item.completed {
          opacity: 0.7;
        }

        .todo-item.completed .todo-text {
          text-decoration: line-through;
          color: #999;
        }

        .todo-content {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .todo-checkbox {
          width: 18px;
          height: 18px;
        }

        .todo-text {
          flex: 1;
          font-size: 1rem;
        }

        .todo-actions {
          display: flex;
          gap: 8px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 25px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-increment,
        .btn-add,
        .btn-primary {
          background: #4facfe;
          color: white;
        }

        .btn-decrement,
        .btn-delete {
          background: #ff6b6b;
          color: white;
        }

        .btn-reset,
        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-highlight {
          background: #ffc107;
          color: black;
          font-size: 0.8rem;
          padding: 4px 8px;
        }

        .todo-item.highlight {
          background: #fff3cd !important;
          border: 2px solid #ffc107;
          transform: scale(1.02);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}); 