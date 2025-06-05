import { App } from './App';
import { Counter } from './components/Counter';
import { TodoList } from './components/TodoList';
import { FormWidget } from './components/FormWidget';

// 渲染主应用
const container = document.getElementById('app')!;
const app = App({});
(app as any).mount(container);

// 等待 DOM 挂载完成后，挂载子组件
setTimeout(() => {
  // 挂载计数器组件 - 使用 new 关键字实例化高阶基类
  const counterContainer = document.getElementById('counter-container');
  if (counterContainer) {
    const counter = new Counter({ initialCount: 0 });
    counter.mount(counterContainer);
  }

  // 挂载 TodoList 组件 - 使用 new 关键字实例化高阶基类
  const todoListContainer = document.getElementById('todolist-container');
  if (todoListContainer) {
    const todoList = new TodoList({});
    todoList.mount(todoListContainer);
  }

  // 挂载表单组件 - 使用 new 关键字实例化高阶基类
  const formContainer = document.getElementById('form-container');
  if (formContainer) {
    const formWidget = new FormWidget({ title: '📋 用户信息表单' });
    formWidget.mount(formContainer);
  }
}, 0); 