import { Counter } from './components/Counter';
import { TodoList } from './components/TodoList';
import { FormWidget } from './components/FormWidget';
import { createWidget } from '@vanilla-dom/widget';

// 演示应用组件
export const App = createWidget(_ => {
  // 组件实例引用
  let counterInstance: Counter | null = null;

  // 组件挂载回调 - 测试 onMounted 获取实例
  const handleCounterMount = (instance: Counter) => {
    counterInstance = instance;
    // 测试公共属性和方法
    if (counterInstance) {
      // 测试 DOM 查询方法
      const display = counterInstance.$('.count-display');
      if (display) {
        console.log(
          '   - DOM 查询成功，当前计数显示:',
          display.element?.textContent,
        );
      }
    }
  };

  return (
    <div className="demo-app">
      <header className="demo-header">
        <h1>🚀 Vanilla DOM Widget 演示</h1>
        <p>展示正确的 Widget 编码范式 - 事件直接在 JSX 上绑定</p>
      </header>

      <div className="demo-section">
        <h2>📊 Widget 类组件 + onMount 测试</h2>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; margin-bottom: 10px;">
          <Counter initialCount={5} onMounted={handleCounterMount} />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          ✅ Counter 组件通过 JSX 语法挂载，使用 onMounted
          回调获取实例并测试方法调用
        </p>
      </div>

      <div className="demo-section">
        <h2>📝 简化版待办列表 - Widget 编码范式</h2>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; margin-bottom: 10px;">
          <TodoList title="📝 正确的 Widget 事件处理" />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          ✅ 使用 on:event 直接在 JSX 上绑定事件，自动跟随 DOM 销毁而清理
        </p>
      </div>

      <div className="demo-section">
        <h2>📋 表单组件 - 事件处理演示</h2>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; margin-bottom: 10px;">
          <FormWidget title="📋 Widget 事件绑定演示" />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          ✅ 展示正确的 Widget 事件处理和 DOM 操作方式
        </p>
      </div>

      <div className="demo-section">
        <h2>🔧 测试结果验证</h2>
        <div
          className="info-card"
          style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;"
        >
          <pre
            id="component-flags"
            style="background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 0.9rem;"
          >
            检查中...
          </pre>
        </div>
        <div style="margin-top: 15px; padding: 15px; background: #e8f5e8; border-radius: 6px;">
          <h4 style="margin: 0 0 10px 0; color: #2d7d32;">🎯 Widget 编码范式要点:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #2d7d32;">
            <li>✅ 事件监听直接在 JSX 上使用 on:event_name 绑定</li>
            <li>✅ 事件会跟随 DOM 销毁自动清理，无需手动管理</li>
            <li>✅ Class 组件在 onUnmounting 中清理内存泄漏风险变量</li>
            <li>✅ Function 组件避免定义复杂状态，专注简单展示</li>
            <li>✅ 使用 Widget DOM 查询 API ($ 和 $$) 精确操作</li>
          </ul>
        </div>
      </div>

      <style>{`
        .demo-app {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .demo-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        .demo-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .demo-header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }
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
