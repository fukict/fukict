import { App } from './App';
import { render } from '@vanilla-dom/core';

// 使用 render 函数渲染应用
const container = document.getElementById('app');
if (container) {
  render(App(), { container });
}
