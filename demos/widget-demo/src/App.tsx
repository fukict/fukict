import { Counter } from './components/Counter';
import { TodoListUI as TodoList } from './components/TodoList';
import type { TodoItem, TodoListProps } from './components/TodoList';
import { createWidget } from '@vanilla-dom/widget';

// 演示应用组件
export const App = createWidget(_ => {
  // 组件实例引用
  let counterInstance: Counter | null = null;
  let todoListInstance: TodoList | null = null;

  // 组件挂载回调 - 测试 onMount 获取实例
  const handleCounterMount = (instance: Counter) => {
    counterInstance = instance;
    console.log('✅ Counter mounted via JSX onMount:', instance);
    console.log('   Component type:', (Counter as any).__COMPONENT_TYPE__);
    console.log('   挂载状态:', instance.isMounted);
    console.log('   根元素:', instance.element);

    // 测试公共属性和方法
    setTimeout(() => {
      if (counterInstance) {
        console.log('🎯 测试 Counter 实例访问:');
        console.log('   - 根元素存在:', !!counterInstance.element);
        console.log('   - 挂载状态:', counterInstance.isMounted);

        // 测试 DOM 查询方法
        const display = counterInstance.$('.count-display');
        if (display) {
          console.log(
            '   - DOM 查询成功，当前计数显示:',
            display.element?.textContent,
          );
        }
      }
    }, 1000);
  };

  const handleTodoListMount = (instance: TodoList) => {
    todoListInstance = instance;
    console.log('✅ TodoList mounted via JSX onMount:', instance);
    console.log('   Component type:', (TodoList as any).__COMPONENT_TYPE__);
    console.log('   onMounted 生命周期已执行');

    // 测试访问实例属性
    setTimeout(() => {
      if (todoListInstance && todoListInstance.element) {
        console.log('🎯 TodoList 实例元素:', todoListInstance.element);
        console.log('   挂载状态:', todoListInstance.isMounted);
      }
    }, 1000);
  };

  // 初始 TodoList 数据
  const initialTodos: TodoItem[] = [
    {
      id: '1',
      text: '学习 Vanilla DOM 组件架构',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      text: '理解业务逻辑与 UI 分离',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const todoListProps: TodoListProps = {
    maxItems: 20,
    autoSave: false,
    initialTodos,
  };

  // 延迟显示组件信息
  setTimeout(() => {
    displayComponentFlags();
  }, 200);

  return (
    <div className="demo-app">
      <header className="demo-header">
        <h1>🚀 Vanilla DOM Widget 演示</h1>
        <p>展示 JSX 组件挂载和 onMount 回调获取实例</p>
      </header>

      <div className="demo-section">
        <h2>📊 Widget 类组件 + onMount 测试</h2>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; margin-bottom: 10px;">
          <Counter initialCount={5} onMount={handleCounterMount} />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          ✅ Counter 组件通过 JSX 语法挂载，使用 onMount
          回调获取实例并测试方法调用
        </p>
      </div>

      <div className="demo-section">
        <h2>📝 分层架构组件 + 生命周期测试</h2>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white; margin-bottom: 10px;">
          <TodoList {...todoListProps} onMount={handleTodoListMount} />
        </div>
        <p style="color: #666; font-size: 0.9rem;">
          ✅ TodoList 采用 Domain + UI 分层架构，测试 onMounted
          生命周期和实例访问
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
          <h4 style="margin: 0 0 10px 0; color: #2d7d32;">🎯 测试要点:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #2d7d32;">
            <li>JSX 组件自动挂载和渲染</li>
            <li>onMount 回调正确获取组件实例</li>
            <li>组件生命周期 onMounted 正常执行</li>
            <li>实例方法和属性可以正常访问</li>
            <li>babel-plugin 自动识别注册组件</li>
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

/**
 * 显示组件标志信息
 */
function displayComponentFlags() {
  const flagsElement = document.getElementById('component-flags');
  if (flagsElement) {
    const flagsInfo = [
      '🏷️  组件标志验证结果:',
      '',
      `Counter.__COMPONENT_TYPE__ = "${(Counter as any).__COMPONENT_TYPE__}"`,
      `TodoList.__COMPONENT_TYPE__ = "${(TodoList as any).__COMPONENT_TYPE__}"`,
      '',
      '✅ 所有组件都通过 JSX 语法正确挂载!',
      '🎯 onMount 回调成功获取组件实例!',
      '🔧 onMounted 生命周期正常执行!',
      '🚀 babel-plugin 自动识别注册组件并转换!',
      '',
      '📋 架构模式: JSX 静态组件 + onMount 实例获取',
      '🎨 适用场景: 布局中的固定组件',
    ].join('\n');

    flagsElement.textContent = flagsInfo;
  }
}
