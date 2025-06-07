import { App } from './App';
import { render } from '@vanilla-dom/core';
import type { SimpleWidgetInstance } from '@vanilla-dom/widget';

// 渲染主应用
const container = document.getElementById('app')!;
render(
  <App
    onMount={(instance: SimpleWidgetInstance) => {
      console.log('instance', instance);
    }}
  />,
  { container, replace: true },
);

console.log('🚀 Vanilla DOM Widget Demo 启动完成!');
console.log('📋 架构模式: JSX 静态组件挂载 + onMount 回调获取实例');
console.log('🎯 生命周期: onMounted 测试完成');
console.log('🔧 组件注册: babel-plugin 自动识别和转换');
