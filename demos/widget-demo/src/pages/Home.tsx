import { RouteWidget } from '@fukict/router';

import { Counter } from '../components/Counter';
import { FormWidget } from '../components/FormWidget';
import { TodoList } from '../components/TodoList';

/**
 * 主页 - 展示 Widget 组件示例
 */
export class Home extends RouteWidget {
  private counterInstance: Counter | null = null;

  // 组件挂载回调 - 测试 onMounted 获取实例
  private handleCounterMount = (instance: Counter) => {
    this.counterInstance = instance;
    // 测试公共属性和方法
    if (this.counterInstance) {
      // 测试 DOM 查询方法
      const display = this.counterInstance.$('.count-display');
      if (display) {
        console.log(
          '   - DOM 查询成功，当前计数显示:',
          display.element?.textContent,
        );
      }
    }
  };

  render() {
    return (
      <div className="page-home">
        <div className="demo-section">
          <h2>📊 Widget 类组件 + onMount 测试</h2>
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; margin-bottom: 10px;">
            <Counter initialCount={5} onMounted={this.handleCounterMount} />
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
            <h4 style="margin: 0 0 10px 0; color: #2d7d32;">
              🎯 Widget 编码范式要点:
            </h4>
            <ul style="margin: 0; padding-left: 20px; color: #2d7d32;">
              <li>✅ 事件监听直接在 JSX 上使用 on:event_name 绑定</li>
              <li>✅ 事件会跟随 DOM 销毁自动清理，无需手动管理</li>
              <li>✅ Class 组件在 onUnmounting 中清理内存泄漏风险变量</li>
              <li>✅ Function 组件避免定义复杂状态，专注简单展示</li>
              <li>✅ 使用 Widget DOM 查询 API ($ 和 $$) 精确操作</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
